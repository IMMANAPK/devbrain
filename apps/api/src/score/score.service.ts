import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { KnowledgeScore } from './score.schema';
import { Note } from '../notes/note.schema';
import { getSyllabus, SyllabusTopic } from '../syllabus/syllabus.data';

@Injectable()
export class ScoreService {
  private readonly logger = new Logger(ScoreService.name);

  constructor(
    @InjectModel(KnowledgeScore.name) private scoreModel: Model<KnowledgeScore>,
    @InjectModel(Note.name) private noteModel: Model<Note>,
  ) {}

  async compute(userId: string, workspaceId: string, role = 'Fullstack'): Promise<KnowledgeScore> {
    const notes = await this.noteModel.find({ workspaceId });
    const syllabus = getSyllabus(role);

    const allText = notes.map((n) =>
      `${n.rawContent} ${n.enrichedContent ?? ''} ${n.tags.join(' ')}`.toLowerCase()
    );

    const topicScores = syllabus.topics.map((topic) => {
      const score = this.computeTopicScore(topic, allText);
      return {
        topic: topic.topic,
        score,
        label: this.getLabel(score),
        noteCount: this.countRelevantNotes(topic, allText),
        updatedAt: new Date(),
      };
    });

    // Weighted overall score
    const totalWeight = syllabus.topics.reduce((s, t) => s + t.weight, 0);
    const weightedSum = topicScores.reduce((sum, ts, i) => {
      return sum + ts.score * syllabus.topics[i].weight;
    }, 0);
    const overallScore = Math.round(weightedSum / totalWeight);

    const readiness = this.computeReadiness(role, topicScores);

    return this.scoreModel.findOneAndUpdate(
      { userId, workspaceId },
      { userId, workspaceId, role, overallScore, topics: topicScores, interviewReadiness: readiness },
      { upsert: true, new: true },
    );
  }

  async findOne(userId: string, workspaceId: string): Promise<KnowledgeScore | null> {
    return this.scoreModel.findOne({ userId, workspaceId });
  }

  async findAllByUser(userId: string): Promise<KnowledgeScore[]> {
    return this.scoreModel.find({ userId });
  }

  // ── Private helpers ──────────────────────────────────────────────

  private computeTopicScore(topic: SyllabusTopic, allText: string[]): number {
    if (!allText.length) return 0;

    let matchedNotes = 0;
    let depthScore = 0;

    for (const text of allText) {
      const matches = topic.keywords.filter((kw) => text.includes(kw)).length;
      if (matches > 0) {
        matchedNotes++;
        depthScore += Math.min(matches / topic.keywords.length, 1);
      }
    }

    const coverage = (matchedNotes / allText.length) * 100;    // 0-100
    const depth = (depthScore / Math.max(matchedNotes, 1)) * 100; // 0-100
    const recencyBoost = matchedNotes > 0 ? 10 : 0;

    return Math.min(Math.round(coverage * 0.4 + depth * 0.4 + recencyBoost * 0.2), 100);
  }

  private countRelevantNotes(topic: SyllabusTopic, allText: string[]): number {
    return allText.filter((text) => topic.keywords.some((kw) => text.includes(kw))).length;
  }

  private getLabel(score: number): string {
    if (score >= 90) return 'Expert';
    if (score >= 70) return 'Proficient';
    if (score >= 50) return 'Learning';
    return 'Beginner';
  }

  private computeReadiness(role: string, topics: { topic: string; score: number }[]): string {
    const avg = topics.reduce((s, t) => s + t.score, 0) / topics.length;
    const hasSystemDesign = topics.find((t) => t.topic.includes('System'))?.score ?? 0;

    if (avg >= 85 && hasSystemDesign >= 80) return 'Senior Ready';
    if (avg >= 75 && hasSystemDesign >= 60) return 'Mid Ready';
    if (avg >= 65) return 'Junior Ready';
    return 'Not Ready';
  }
}
