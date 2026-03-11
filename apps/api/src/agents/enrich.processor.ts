import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectQueue } from '@nestjs/bull';
import { Model } from 'mongoose';
import { Job, Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import { createAIProvider } from '@devbrain/ai-core';
import { Note } from '../notes/note.schema';
import { QdrantService } from '../qdrant/qdrant.service';
import { SCORE_QUEUE, ScoreJob } from '../score/score.processor';

export const ENRICH_QUEUE = 'enrich';

export interface EnrichJob {
  noteId: string;
  rawContent: string;
  workspaceId: string;
  userId: string;
}

@Processor(ENRICH_QUEUE)
export class EnrichProcessor {
  private readonly logger = new Logger(EnrichProcessor.name);

  constructor(
    @InjectModel(Note.name) private noteModel: Model<Note>,
    @InjectQueue(SCORE_QUEUE) private scoreQueue: Queue,
    private qdrant: QdrantService,
    private config: ConfigService,
  ) {}

  @Process()
  async handle(job: Job<EnrichJob>) {
    const { noteId, rawContent, workspaceId, userId } = job.data;
    this.logger.log(`Enriching note ${noteId}`);

    try {
      const claudeKey = this.config.get<string>('CLAUDE_API_KEY');
      const mode = claudeKey ? 'claude' : 'ollama';

      const ai = createAIProvider(mode, {
        claudeApiKey: claudeKey,
        ollamaUrl: this.config.get<string>('OLLAMA_URL', 'http://localhost:11434'),
        ollamaModel: this.config.get<string>('OLLAMA_MODEL', 'llama3'),
      });

      const ollamaForEmbed = createAIProvider('ollama', {
        ollamaUrl: this.config.get<string>('OLLAMA_URL', 'http://localhost:11434'),
      });

      const result = await ai.enrich(rawContent);

      let embedding: number[] = result.embedding;
      if (!embedding.length) {
        try {
          embedding = await ollamaForEmbed.embed(rawContent);
        } catch {
          this.logger.warn('Embedding failed — skipping vector storage');
        }
      }

      await this.noteModel.findByIdAndUpdate(noteId, {
        enrichedContent: result.enrichedContent,
        interviewQs: result.interviewQs,
        $addToSet: { tags: { $each: result.tags } },
      });

      if (embedding.length) {
        await this.qdrant.upsert(noteId, embedding, { noteId, workspaceId, rawContent });
        await this.noteModel.findByIdAndUpdate(noteId, { vectorId: noteId });
      }

      // Trigger score recompute after enrichment
      const scoreJob: ScoreJob = { userId, workspaceId };
      await this.scoreQueue.add(scoreJob, { removeOnComplete: true, delay: 2000 });

      this.logger.log(`Note ${noteId} enriched — score recompute queued`);
    } catch (err: any) {
      this.logger.error(`Failed to enrich note ${noteId}: ${err.message}`);
      throw err;
    }
  }
}
