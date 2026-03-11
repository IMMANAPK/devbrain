import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class TopicScore {
  @Prop() topic: string;
  @Prop() score: number;
  @Prop() label: string;
  @Prop() noteCount: number;
  @Prop() updatedAt: Date;
}

@Schema({ timestamps: true })
export class KnowledgeScore extends Document {
  @Prop({ required: true }) userId: string;
  @Prop({ required: true }) workspaceId: string;
  @Prop({ default: 'Fullstack' }) role: string;
  @Prop({ default: 0 }) overallScore: number;
  @Prop({ type: [Object], default: [] }) topics: TopicScore[];
  @Prop({ default: 'Not Ready' }) interviewReadiness: string;
}

export const KnowledgeScoreSchema = SchemaFactory.createForClass(KnowledgeScore);
KnowledgeScoreSchema.index({ userId: 1, workspaceId: 1 }, { unique: true });
