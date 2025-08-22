import { VectorStoreSearchResult } from './vector-store.type';

export interface VectorStoreService {
  search(query: string, limit?: number): Promise<VectorStoreSearchResult[]>;
}
