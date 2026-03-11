import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MongooseModule } from '@nestjs/mongoose';
import { EnrichProcessor, ENRICH_QUEUE } from './enrich.processor';
import { Note, NoteSchema } from '../notes/note.schema';
import { SCORE_QUEUE } from '../score/score.processor';

@Module({
  imports: [
    BullModule.registerQueue({ name: ENRICH_QUEUE }),
    BullModule.registerQueue({ name: SCORE_QUEUE }),
    MongooseModule.forFeature([{ name: Note.name, schema: NoteSchema }]),
  ],
  providers: [EnrichProcessor],
  exports: [BullModule],
})
export class AgentsModule {}
