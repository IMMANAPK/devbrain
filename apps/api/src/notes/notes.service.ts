import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectQueue } from '@nestjs/bull';
import { Model } from 'mongoose';
import { Queue } from 'bull';
import { Note } from './note.schema';
import { Workspace } from '../workspaces/workspace.schema';
import { CreateNoteDto, SearchNotesDto } from '@devbrain/shared';
import { ENRICH_QUEUE, EnrichJob } from '../agents/enrich.processor';

@Injectable()
export class NotesService {
  constructor(
    @InjectModel(Note.name) private noteModel: Model<Note>,
    @InjectModel(Workspace.name) private workspaceModel: Model<Workspace>,
    @InjectQueue(ENRICH_QUEUE) private enrichQueue: Queue,
  ) {}

  async create(dto: CreateNoteDto & { userId?: string }): Promise<Note> {
    const note = await this.noteModel.create(dto);

    const job: EnrichJob = {
      noteId: note._id.toString(),
      rawContent: note.rawContent,
      workspaceId: note.workspaceId,
      userId: dto.userId ?? '',
    };
    await this.enrichQueue.add(job, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: true,
    });

    return note;
  }

  async findAllByWorkspace(workspaceId: string): Promise<Note[]> {
    return this.noteModel.find({ workspaceId }).sort({ createdAt: -1 });
  }

  async findOne(id: string): Promise<Note> {
    const note = await this.noteModel.findById(id);
    if (!note) throw new NotFoundException('Note not found');
    return note;
  }

  async update(id: string, patch: { rawContent?: string; tags?: string[] }): Promise<Note> {
    const note = await this.noteModel.findByIdAndUpdate(id, patch, { new: true });
    if (!note) throw new NotFoundException('Note not found');
    return note;
  }

  async search(dto: SearchNotesDto): Promise<Note[]> {
    const filter: any = {};
    if (dto.workspaceId) filter.workspaceId = dto.workspaceId;
    if (dto.tags?.length) filter.tags = { $in: dto.tags };

    return this.noteModel
      .find({ ...filter, $text: { $search: dto.query } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(20);
  }

  async remove(id: string): Promise<void> {
    await this.noteModel.findByIdAndDelete(id);
  }

  /** Total note count across all workspaces owned by userId */
  async countForUser(userId: string): Promise<number> {
    const workspaces = await this.workspaceModel
      .find({ userId })
      .select('_id')
      .lean();
    const ids = workspaces.map((w: any) => w._id.toString());
    if (!ids.length) return 0;
    return this.noteModel.countDocuments({ workspaceId: { $in: ids } });
  }

  /** Fetch notes by IDs — used by Interview mode after Qdrant vector search */
  async findByIds(ids: string[]): Promise<Note[]> {
    if (!ids.length) return [];
    return this.noteModel.find({ _id: { $in: ids } }).lean() as unknown as Note[];
  }
}
