import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { QdrantService } from '../qdrant/qdrant.service';
import { NotesService } from '../notes/notes.service';

export interface AskDto {
  question: string;
  workspaceId?: string;  // optional — scopes vector search to one workspace
}

export interface AskResult {
  answer: string;
  sources: {
    _id: string;
    rawContent: string;
    enrichedContent?: string;
    tags: string[];
    workspaceId: string;
    score: number;
  }[];
  model: string;
}

export interface ContextResult {
  systemPrompt: string;
  sources: {
    _id: string;
    rawContent: string;
    enrichedContent?: string;
    tags: string[];
    workspaceId: string;
    score: number;
  }[];
}

@Injectable()
export class InterviewService {
  private readonly logger = new Logger(InterviewService.name);

  constructor(
    private config: ConfigService,
    private qdrant: QdrantService,
    private notes: NotesService,
  ) {}

  /** RAG retrieval only — no LLM. Used by frontend Puter.js integration. */
  async getContext(dto: AskDto): Promise<ContextResult> {
    const ollamaUrl = this.config.get<string>('OLLAMA_URL', 'http://localhost:11434');

    // ── Step 1: Embed the question ─────────────────────────────────────────
    let questionVector: number[] = [];
    try {
      const { data } = await axios.post(
        `${ollamaUrl}/api/embeddings`,
        { model: 'nomic-embed-text', prompt: dto.question },
        { timeout: 10_000 },
      );
      questionVector = data.embedding ?? [];
    } catch {
      this.logger.warn('Embedding unavailable — skipping vector search');
    }

    // ── Step 2: Vector search ──────────────────────────────────────────────
    let noteIds: string[] = [];
    const qdrantScores = new Map<string, number>();

    if (questionVector.length) {
      try {
        const filter = dto.workspaceId
          ? { must: [{ key: 'workspaceId', match: { value: dto.workspaceId } }] }
          : undefined;
        const results = await this.qdrant.search(questionVector, 8, filter);
        for (const hit of results) {
          const id = hit.payload?.noteId as string;
          if (id) { noteIds.push(id); qdrantScores.set(id, hit.score as number); }
        }
      } catch (err: any) {
        this.logger.warn(`Qdrant search failed: ${err.message}`);
      }
    }

    // ── Step 3: Fetch notes from MongoDB ──────────────────────────────────
    let contextNotes: any[] = [];
    if (noteIds.length) contextNotes = await this.notes.findByIds(noteIds);

    // ── Step 4: Build system prompt ────────────────────────────────────────
    const contextBlock = contextNotes.length > 0
      ? contextNotes.map((n, i) => `[Note ${i + 1}]\n${n.enrichedContent || n.rawContent}`).join('\n\n---\n\n')
      : null;

    const systemPrompt = contextBlock
      ? `You are DevBrain, an AI that helps developers recall and understand their own notes.
Below are the developer's relevant notes. Use them as your primary source, then supplement with your general knowledge.

DEVELOPER'S NOTES:
${contextBlock}

Rules:
- Ground your answer primarily in the notes above
- If notes don't cover the topic fully, fill in with accurate general knowledge
- Be concise and practical — this is for interview/learning prep
- If a note is directly relevant, quote or reference it briefly`
      : `You are DevBrain, an AI assistant for developers.
The developer's knowledge base has no relevant notes for this question yet.
Answer from your general knowledge and suggest they capture notes on this topic.`;

    const sources = contextNotes.map((n) => ({
      _id: n._id.toString(),
      rawContent: (n.rawContent as string).slice(0, 300),
      enrichedContent: n.enrichedContent ? (n.enrichedContent as string).slice(0, 300) : undefined,
      tags: (n.tags as string[]) ?? [],
      workspaceId: n.workspaceId as string,
      score: Math.round((qdrantScores.get(n._id.toString()) ?? 0) * 100),
    }));

    return { systemPrompt, sources };
  }

  async ask(dto: AskDto): Promise<AskResult> {
    const ollamaUrl = this.config.get<string>('OLLAMA_URL', 'http://localhost:11434');
    const ollamaModel = this.config.get<string>('OLLAMA_MODEL', 'llama3');
    const claudeKey = this.config.get<string>('CLAUDE_API_KEY');

    // ── Step 1: Embed the question ─────────────────────────────────────────
    let questionVector: number[] = [];
    try {
      const { data } = await axios.post(
        `${ollamaUrl}/api/embeddings`,
        { model: 'nomic-embed-text', prompt: dto.question },
        { timeout: 15_000 },
      );
      questionVector = data.embedding ?? [];
    } catch (err: any) {
      this.logger.warn(`Embedding failed: ${err.message} — falling back to keyword search`);
    }

    // ── Step 2: Vector search in Qdrant ───────────────────────────────────
    let noteIds: string[] = [];
    let qdrantScores: Map<string, number> = new Map();

    if (questionVector.length) {
      try {
        const filter = dto.workspaceId
          ? { must: [{ key: 'workspaceId', match: { value: dto.workspaceId } }] }
          : undefined;

        const results = await this.qdrant.search(questionVector, 8, filter);

        for (const hit of results) {
          const id = hit.payload?.noteId as string;
          if (id) {
            noteIds.push(id);
            qdrantScores.set(id, hit.score as number);
          }
        }
      } catch (err: any) {
        this.logger.warn(`Qdrant search failed: ${err.message}`);
      }
    }

    // ── Step 3: Fetch notes from MongoDB ──────────────────────────────────
    let contextNotes: any[] = [];
    if (noteIds.length) {
      contextNotes = await this.notes.findByIds(noteIds);
    }

    // ── Step 4: Build RAG prompt ──────────────────────────────────────────
    const contextBlock =
      contextNotes.length > 0
        ? contextNotes
            .map(
              (n, i) =>
                `[Note ${i + 1}]\n${n.enrichedContent || n.rawContent}`,
            )
            .join('\n\n---\n\n')
        : 'No relevant notes found in your knowledge base.';

    const systemPrompt = contextNotes.length > 0
      ? `You are DevBrain, an AI that helps developers recall and understand their own notes.
Below are the developer's relevant notes. Use them as your primary source, then supplement with your general knowledge.

DEVELOPER'S NOTES:
${contextBlock}

Rules:
- Ground your answer primarily in the notes above
- If notes don't cover the topic fully, fill in with accurate general knowledge
- Be concise and practical — this is for interview/learning prep
- If a note is directly relevant, quote or reference it briefly`
      : `You are DevBrain, an AI assistant for developers.
The developer's knowledge base has no relevant notes for this question yet.
Answer from your general knowledge and suggest they capture notes on this topic.`;

    const fullPrompt = `${systemPrompt}

QUESTION: ${dto.question}

ANSWER:`;

    // ── Step 5: Generate answer ───────────────────────────────────────────
    let answer = '';
    let model = '';

    const groqKey = this.config.get<string>('GROQ_API_KEY');

    // Priority 1: Groq — Free, fast, no credit card (console.groq.com)
    if (!answer && groqKey) {
      try {
        const { data } = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: 'llama-3.1-8b-instant',
            max_tokens: 1024,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: dto.question },
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${groqKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 30_000,
          },
        );
        answer = data.choices?.[0]?.message?.content ?? '';
        model = 'groq · llama-3.1-8b';
      } catch (err: any) {
        this.logger.warn(`Groq failed: ${err.message} — trying next`);
      }
    }

    // Priority 2: Claude API
    if (claudeKey) {
      // Use Claude API
      try {
        const { data } = await axios.post(
          'https://api.anthropic.com/v1/messages',
          {
            model: 'claude-3-5-haiku-20241022',
            max_tokens: 1024,
            messages: [{ role: 'user', content: fullPrompt }],
          },
          {
            headers: {
              'x-api-key': claudeKey,
              'anthropic-version': '2023-06-01',
              'content-type': 'application/json',
            },
            timeout: 30_000,
          },
        );
        answer = data.content?.[0]?.text ?? '';
        model = 'claude-3-5-haiku';
      } catch (err: any) {
        this.logger.warn(`Claude failed: ${err.message} — falling back to Ollama`);
      }
    }

    if (!answer) {
      // Use Ollama
      try {
        const { data } = await axios.post(
          `${ollamaUrl}/api/generate`,
          { model: ollamaModel, prompt: fullPrompt, stream: false },
          { timeout: 60_000 },
        );
        answer = data.response ?? '';
        model = ollamaModel;
      } catch (err: any) {
        this.logger.error(`Ollama failed: ${err.message}`);
        answer = 'Sorry, the AI service is unavailable right now. Please ensure Ollama is running.';
        model = 'unavailable';
      }
    }

    // ── Step 6: Build source list ─────────────────────────────────────────
    const sources = contextNotes.map((n) => ({
      _id: n._id.toString(),
      rawContent: (n.rawContent as string).slice(0, 300),
      enrichedContent: n.enrichedContent
        ? (n.enrichedContent as string).slice(0, 300)
        : undefined,
      tags: (n.tags as string[]) ?? [],
      workspaceId: n.workspaceId as string,
      score: Math.round((qdrantScores.get(n._id.toString()) ?? 0) * 100),
    }));

    return { answer, sources, model };
  }
}
