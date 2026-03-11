import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { ScoreService } from './score.service';
import { ScoreController } from './score.controller';
import { ScoreProcessor, SCORE_QUEUE } from './score.processor';
import { KnowledgeScore, KnowledgeScoreSchema } from './score.schema';
import { Note, NoteSchema } from '../notes/note.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KnowledgeScore.name, schema: KnowledgeScoreSchema },
      { name: Note.name, schema: NoteSchema },
    ]),
    BullModule.registerQueue({ name: SCORE_QUEUE }),
  ],
  providers: [ScoreService, ScoreProcessor],
  controllers: [ScoreController],
  exports: [ScoreService],
})
export class ScoreModule {}
