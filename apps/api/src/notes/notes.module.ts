import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { Note, NoteSchema } from './note.schema';
import { Workspace, WorkspaceSchema } from '../workspaces/workspace.schema';
import { ENRICH_QUEUE } from '../agents/enrich.processor';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Note.name, schema: NoteSchema },
      { name: Workspace.name, schema: WorkspaceSchema },
    ]),
    BullModule.registerQueue({ name: ENRICH_QUEUE }),
  ],
  providers: [NotesService],
  controllers: [NotesController],
  exports: [NotesService],
})
export class NotesModule {}
