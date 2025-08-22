import { Injectable } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';
import axios from 'axios';

@Injectable()
export class LocalEmbeddingService implements EmbeddingService {
  constructor() {}

  async embeddingText(text: string, type: 'query' | 'passage'): Promise<number[]> {
    try {
      const response = await axios.post<{ embedding: number[] }>('http://localhost:9000/embeddings', {
        text,
        type,
      });

      return response.data.embedding;
    } catch (error) {
      console.error('Embedding API 호출 에러:', error);
      throw error;
    }
  }
}
