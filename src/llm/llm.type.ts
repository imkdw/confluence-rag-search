import { VectorStoreMetadata } from '../vector-store/vector-store.type';

export interface RAGContext {
  title: string;
  content: string;
  url: string;
}

export interface LLMService {
  generateAnswer(query: string, contexts: RAGContext[]): Promise<string>;
}

export interface AnswerResult {
  answer: string;
  sources: VectorStoreMetadata[];
}
