import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Note extends Document {
  @Prop({ required: true })
  workspaceId: string;

  @Prop({ required: true })
  rawContent: string;

  @Prop()
  enrichedContent?: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: [String], default: [] })
  interviewQs: string[];

  @Prop()
  vectorId?: string;

  @Prop({ enum: ['web', 'cli', 'git-commit'], default: 'web' })
  source: string;
}

export const NoteSchema = SchemaFactory.createForClass(Note);
NoteSchema.index({ workspaceId: 1, createdAt: -1 });
NoteSchema.index({ tags: 1 });
NoteSchema.index({ rawContent: 'text', enrichedContent: 'text' });
