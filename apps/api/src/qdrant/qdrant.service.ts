import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class QdrantService implements OnModuleInit {
  private readonly logger = new Logger(QdrantService.name);
  private baseUrl: string;
  private readonly collection = 'devbrain_notes';
  private readonly vectorSize = 768; // nomic-embed-text dimension

  constructor(private config: ConfigService) {
    this.baseUrl = config.get<string>('QDRANT_URL', 'http://localhost:6333');
  }

  async onModuleInit() {
    await this.ensureCollection();
  }

  private async ensureCollection() {
    try {
      await axios.get(`${this.baseUrl}/collections/${this.collection}`);
      this.logger.log(`Qdrant collection '${this.collection}' exists`);
    } catch {
      await axios.put(`${this.baseUrl}/collections/${this.collection}`, {
        vectors: { size: this.vectorSize, distance: 'Cosine' },
      });
      this.logger.log(`Qdrant collection '${this.collection}' created`);
    }
  }

  async upsert(id: string, vector: number[], payload: Record<string, any>): Promise<void> {
    if (!vector.length) return; // skip if no embedding
    await axios.put(`${this.baseUrl}/collections/${this.collection}/points`, {
      points: [{ id: this.toUint(id), vector, payload }],
    });
  }

  async search(vector: number[], limit = 10, filter?: Record<string, any>): Promise<any[]> {
    const body: any = { vector, limit, with_payload: true };
    if (filter) body.filter = filter;
    const res = await axios.post(
      `${this.baseUrl}/collections/${this.collection}/points/search`,
      body,
    );
    return res.data.result ?? [];
  }

  async delete(id: string): Promise<void> {
    await axios.post(`${this.baseUrl}/collections/${this.collection}/points/delete`, {
      points: [this.toUint(id)],
    });
  }

  // Qdrant needs unsigned int IDs — derive from mongo ObjectId hex
  private toUint(mongoId: string): number {
    return parseInt(mongoId.slice(-8), 16);
  }
}
