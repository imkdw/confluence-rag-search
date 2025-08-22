import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { VectorStoreService } from './vector-store.service';
import { ChromaClient, Collection } from 'chromadb';
import { EmbeddingService } from '../embedding/embedding.service';
import { VectorStoreSearchResult, VectorStoreMetadata } from './vector-store.type';
import { EMBEDDING_SERVICE } from '../embedding/embedding.const';

@Injectable()
export class ChromaService implements VectorStoreService, OnModuleInit {
  private collection: Collection;
  private readonly COLLECTION_NAME = 'confluence_rag_search';

  constructor(@Inject(EMBEDDING_SERVICE) private readonly embeddingService: EmbeddingService) {}

  async onModuleInit() {
    const client = new ChromaClient();

    try {
      this.collection = await client.getCollection({
        name: this.COLLECTION_NAME,
      });
    } catch {
      this.collection = await client.createCollection({
        name: this.COLLECTION_NAME,
        embeddingFunction: null,
      });
    }
  }

  async search(query: string, limit: number = 10): Promise<VectorStoreSearchResult[]> {
    const embedding = await this.embeddingService.embeddingText(query, 'query');

    // 중복 제거를 위해 더 많은 결과 조회하되, 품질 유지를 위해 적절한 범위로 제한
    const expandedLimit = Math.min(limit * 5, 100);

    const queryResult = await this.collection.query({
      queryEmbeddings: [embedding],
      nResults: expandedLimit,
    });

    const allResults = queryResult.distances[0]
      .filter((distance) => distance !== null)
      .map((distance, index) => ({
        distance,
        metadata: queryResult.metadatas[0][index],
      }))
      .filter((item) => item.metadata !== null)
      .map((item) => ({
        distance: item.distance,
        metadata: item.metadata as unknown as VectorStoreMetadata,
      }))
      .sort((a, b) => a.distance - b.distance); // distance 순으로 정렬

    // 상위 품질 후보들 내에서 중복 제거
    const deduplicatedResults = this.deduplicateByPageIdWithQuality(allResults, limit);

    return deduplicatedResults;
  }

  private deduplicateByPageIdWithQuality(
    results: VectorStoreSearchResult[],
    targetLimit: number,
  ): VectorStoreSearchResult[] {
    const finalResults: VectorStoreSearchResult[] = [];
    const usedPageIds = new Set<number>();

    // 이미 distance 순으로 정렬된 상태에서 순차적으로 처리
    for (const result of results) {
      const pageId = result.metadata.pageId;

      // 해당 페이지가 아직 선택되지 않았다면 추가
      if (!usedPageIds.has(pageId)) {
        finalResults.push(result);
        usedPageIds.add(pageId);

        // 목표 개수에 도달하면 중단
        if (finalResults.length >= targetLimit) {
          break;
        }
      }
    }

    return finalResults;
  }

  private deduplicateByPageId(results: VectorStoreSearchResult[]): VectorStoreSearchResult[] {
    const pageMap = new Map<number, VectorStoreSearchResult>();

    for (const result of results) {
      const pageId = result.metadata.pageId;
      const existing = pageMap.get(pageId);

      if (!existing || result.distance < existing.distance) {
        pageMap.set(pageId, result);
      }
    }

    return Array.from(pageMap.values()).sort((a, b) => a.distance - b.distance);
  }
}
