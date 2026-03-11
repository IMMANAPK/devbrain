import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { NotesModule } from './notes/notes.module';
import { AgentsModule } from './agents/agents.module';
import { QdrantModule } from './qdrant/qdrant.module';
import { ScoreModule } from './score/score.module';
import { FeedModule } from './feed/feed.module';
import { InterviewModule } from './interview/interview.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI', 'mongodb://localhost:27017/devbrain'),
      }),
    }),

    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
        },
      }),
    }),

    QdrantModule,
    AgentsModule,
    ScoreModule,
    FeedModule,
    InterviewModule,
    AuthModule,
    UsersModule,
    WorkspacesModule,
    NotesModule,
  ],
})
export class AppModule {}
