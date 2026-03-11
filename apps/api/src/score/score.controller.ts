import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ScoreService } from './score.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SCORE_QUEUE, ScoreJob } from './score.processor';

@Controller('scores')
@UseGuards(JwtAuthGuard)
export class ScoreController {
  constructor(
    private scoreService: ScoreService,
    @InjectQueue(SCORE_QUEUE) private scoreQueue: Queue,
  ) {}

  // Get score for a workspace
  @Get('workspace/:workspaceId')
  getWorkspaceScore(
    @CurrentUser() user: any,
    @Param('workspaceId') workspaceId: string,
  ) {
    return this.scoreService.findOne(user.userId, workspaceId);
  }

  // Get all scores for current user
  @Get('me')
  getMyScores(@CurrentUser() user: any) {
    return this.scoreService.findAllByUser(user.userId);
  }

  // Trigger score recompute
  @Post('workspace/:workspaceId/compute')
  async triggerCompute(
    @CurrentUser() user: any,
    @Param('workspaceId') workspaceId: string,
    @Query('role') role = 'Fullstack',
  ) {
    const job: ScoreJob = { userId: user.userId, workspaceId, role };
    await this.scoreQueue.add(job, { removeOnComplete: true });
    return { message: 'Score computation queued' };
  }

  // Instant compute (sync, for first load)
  @Post('workspace/:workspaceId/compute-now')
  computeNow(
    @CurrentUser() user: any,
    @Param('workspaceId') workspaceId: string,
    @Query('role') role = 'Fullstack',
  ) {
    return this.scoreService.compute(user.userId, workspaceId, role);
  }
}
