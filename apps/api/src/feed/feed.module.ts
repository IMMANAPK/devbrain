import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedService } from './feed.service';
import { FeedController } from './feed.controller';
import { Workspace, WorkspaceSchema } from '../workspaces/workspace.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Workspace.name, schema: WorkspaceSchema }]),
  ],
  providers: [FeedService],
  controllers: [FeedController],
})
export class FeedModule {}
