export type ScoreLabel = 'Expert' | 'Proficient' | 'Learning' | 'Beginner';
export type ReadinessLevel = 'Junior' | 'Mid' | 'Senior' | 'Not Ready';
export interface TopicScore {
    topic: string;
    score: number;
    label: ScoreLabel;
    lastUpdated: Date;
}
export interface KnowledgeHealthScore {
    userId: string;
    workspaceId?: string;
    overallScore: number;
    topics: TopicScore[];
    interviewReadiness: ReadinessLevel;
    updatedAt: Date;
}
//# sourceMappingURL=score.types.d.ts.map