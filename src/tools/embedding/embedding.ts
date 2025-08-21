import { Document } from '@langchain/core/documents';
import axios from 'axios';

export class EmbeddingClient {
  async embeddingDocument(document: Document): Promise<number[]> {
    try {
      const response = await axios.post<{ embedding: number[] }>('http://localhost:9000/embeddings', {
        text: document.pageContent,
      });

      return response.data.embedding;
    } catch (error) {
      console.error('Embedding API 호출 에러:', error);
      throw error;
    }
  }
}
