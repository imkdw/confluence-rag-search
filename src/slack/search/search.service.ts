import { Inject, Injectable } from '@nestjs/common';
import { VectorStoreService } from '../../vector-store/vector-store.service';
import { VECTOR_STORE_SERVICE } from '../../vector-store/vector-store.const';
import { VectorStoreMetadata } from '../../vector-store/vector-store.type';
import { RerankerService } from '../../reranker/reranker.service';
import { RERANKER_SERVICE } from '../../reranker/reranker.const';
import { DocumentCandidate } from '../../reranker/reranker.type';

export interface SearchResult {
  distance: number;
  relevanceScore: number;
  metadata: VectorStoreMetadata;
}

@Injectable()
export class SearchService {
  private readonly VECTOR_QUERY_COUNT = 20;
  private readonly RERANK_COUNT = 5;

  constructor(
    @Inject(VECTOR_STORE_SERVICE) private readonly vectorStoreService: VectorStoreService,
    @Inject(RERANKER_SERVICE) private readonly rerankerService: RerankerService,
  ) {}

  async search(query: string): Promise<SearchResult[]> {
    const candidates = await this.vectorStoreService.search(query, this.VECTOR_QUERY_COUNT);

    const documents: DocumentCandidate[] = candidates.map((candidate) => ({
      text: candidate.metadata.content,
      metadata: candidate.metadata,
    }));

    const rerankedResults = await this.rerankerService.rerank(query, documents, this.RERANK_COUNT);
    console.log(rerankedResults);

    return rerankedResults
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .map((result) => ({
        distance: candidates[result.index].distance,
        relevanceScore: result.relevanceScore,
        metadata: candidates[result.index].metadata,
      }));
  }
}
