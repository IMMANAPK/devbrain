import Anthropic from '@anthropic-ai/sdk';
import { AIProvider, EnrichResult } from './types.js';

const ENRICH_PROMPT = (content: string) => `
You are a developer knowledge assistant. A developer wrote this learning note:
"${content}"

Respond ONLY with a valid JSON object (no markdown, no explanation):
{
  "enrichedContent": "A 3-5 sentence expanded explanation with context, why it matters, and best practices",
  "interviewQs": ["Question 1?", "Question 2?", "Question 3?"],
  "tags": ["tag1", "tag2", "tag3"]
}
`;

export class ClaudeProvider implements AIProvider {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model = 'claude-3-5-haiku-20241022') {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async enrich(rawContent: string): Promise<EnrichResult> {
    const message = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      messages: [{ role: 'user', content: ENRICH_PROMPT(rawContent) }],
    });

    const text = (message.content[0] as any).text as string;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Claude returned invalid JSON');

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      enrichedContent: parsed.enrichedContent ?? '',
      interviewQs: parsed.interviewQs ?? [],
      tags: parsed.tags ?? [],
      embedding: [], // Claude API doesn't have embeddings yet - use Ollama for this
    };
  }

  async embed(_text: string): Promise<number[]> {
    // Claude API does not provide embeddings — fallback to Ollama
    return [];
  }
}
