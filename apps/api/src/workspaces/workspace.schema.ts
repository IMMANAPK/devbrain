import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Workspace extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: [String], default: [] })
  stack: string[];

  @Prop()
  gitPath?: string;

  @Prop({ default: 0 })
  score: number;
}

export const WorkspaceSchema = SchemaFactory.createForClass(Workspace);
