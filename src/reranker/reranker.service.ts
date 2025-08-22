import { RerankerResult, DocumentCandidate } from './reranker.type';

export interface RerankerService {
  rerank(query: string, documents: DocumentCandidate[], topK?: number): Promise<RerankerResult[]>;
}
