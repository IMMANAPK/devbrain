export interface EnrichResult {
  enrichedContent: string;
  interviewQs: string[];
  tags: string[];
  embedding: number[];
}

export interface AIProvider {
  enrich(rawContent: string): Promise<EnrichResult>;
  embed(text: string): Promise<number[]>;
}

export type AIMode = 'ollama' | 'claude';
