export interface EmbeddingService {
  embeddingText(text: string, type: 'query' | 'passage'): Promise<number[]>;
}
