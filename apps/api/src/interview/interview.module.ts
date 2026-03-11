import { Module } from '@nestjs/common';
import { InterviewService } from './interview.service';
import { InterviewController } from './interview.controller';
import { NotesModule } from '../notes/notes.module';

@Module({
  imports: [NotesModule],           // brings in NotesService (exported)
  providers: [InterviewService],    // QdrantService is @Global() — no import needed
  controllers: [InterviewController],
})
export class InterviewModule {}
