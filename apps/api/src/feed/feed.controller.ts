import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FeedService } from './feed.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Workspace } from '../workspaces/workspace.schema';

@Controller('feed')
@UseGuards(JwtAuthGuard)
export class FeedController {
  constructor(
    private readonly feedService: FeedService,
    @InjectModel(Workspace.name) private workspaceModel: Model<Workspace>,
  ) {}

  /** GET /feed/workspace/:id  — feed tailored to a workspace's stack */
  @Get('workspace/:id')
  async forWorkspace(@Param('id') id: string) {
    const workspace = await this.workspaceModel.findById(id).lean();
    const stack: string[] = (workspace as any)?.stack ?? [];
    return this.feedService.fetchForStack(stack);
  }

  /** GET /feed?stack=nestjs,react,mongodb  — generic feed by stack tags */
  @Get()
  forStack(@Query('stack') stack: string) {
    const tags = stack ? stack.split(',').map((t) => t.trim()).filter(Boolean) : [];
    return this.feedService.fetchForStack(tags);
  }
}
