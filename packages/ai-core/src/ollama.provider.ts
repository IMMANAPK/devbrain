import axios from 'axios';
import { AIProvider, EnrichResult } from './types.js';

const ENRICH_PROMPT = (content: string) => `
You are a developer knowledge assistant. A developer wrote this learning note:
"${content}"

Respond ONLY with a valid JSON object (no markdown, no explanation):
{
  "enrichedContent": "A 3-5 sentence expanded explanation with context, why it matters, and best practices",
  "interviewQs": ["Question 1?", "Question 2?", "Question 3?"],
  "tags": ["tag1", "tag2", "tag3"]
}
`;

export class OllamaProvider implements AIProvider {
  private baseUrl: string;
  private model: string;

  constructor(baseUrl = 'http://localhost:11434', model = 'llama3') {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  async enrich(rawContent: string): Promise<EnrichResult> {
    const response = await axios.post(`${this.baseUrl}/api/generate`, {
      model: this.model,
      prompt: ENRICH_PROMPT(rawContent),
      stream: false,
    });

    const text: string = response.data.response;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Ollama returned invalid JSON');

    const parsed = JSON.parse(jsonMatch[0]);
    const embedding = await this.embed(rawContent);

    return {
      enrichedContent: parsed.enrichedContent ?? '',
      interviewQs: parsed.interviewQs ?? [],
      tags: parsed.tags ?? [],
      embedding,
    };
  }

  async embed(text: string): Promise<number[]> {
    const response = await axios.post(`${this.baseUrl}/api/embeddings`, {
      model: 'nomic-embed-text',
      prompt: text,
    });
    return response.data.embedding ?? [];
  }
}
