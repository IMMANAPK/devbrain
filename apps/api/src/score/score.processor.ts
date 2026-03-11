import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ScoreService } from './score.service';

export const SCORE_QUEUE = 'score';

export interface ScoreJob {
  userId: string;
  workspaceId: string;
  role?: string;
}

@Processor(SCORE_QUEUE)
export class ScoreProcessor {
  private readonly logger = new Logger(ScoreProcessor.name);

  constructor(private scoreService: ScoreService) {}

  @Process()
  async handle(job: Job<ScoreJob>) {
    const { userId, workspaceId, role } = job.data;
    this.logger.log(`Computing score for workspace ${workspaceId}`);
    await this.scoreService.compute(userId, workspaceId, role ?? 'Fullstack');
    this.logger.log(`Score computed for workspace ${workspaceId}`);
  }
}
