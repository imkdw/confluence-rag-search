import { Injectable } from '@nestjs/common';
import { CohereClient } from 'cohere-ai';
import { RerankerService } from './reranker.service';
import { RerankerResult, DocumentCandidate } from './reranker.type';

@Injectable()
export class CohereRerankerService implements RerankerService {
  private readonly client: CohereClient;

  constructor() {
    this.client = new CohereClient({
      token: process.env.COHERE_API_KEY,
    });
  }

  async rerank(query: string, documents: DocumentCandidate[], topN: number): Promise<RerankerResult[]> {
    try {
      const response = await this.client.rerank({
        query,
        documents: documents.map((doc) => doc.text),
        topN,
        model: 'rerank-multilingual-v3.0',
      });

      return response.results.map((result) => ({
        index: result.index,
        relevanceScore: result.relevanceScore,
      }));
    } catch (error) {
      console.log(error);

      return documents.slice(0, topN).map((_, index) => ({
        index,
        relevanceScore: 1.0 - index * 0.1,
      }));
    }
  }
}
