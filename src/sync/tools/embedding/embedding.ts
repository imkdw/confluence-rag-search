import axios from 'axios';

export class EmbeddingClient {
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
