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

    const queryResult = await this.collection.query({
      queryEmbeddings: [embedding],
      nResults: limit,
    });

    const result = queryResult.distances[0]
      .filter((distance) => distance !== null)
      .map((distance, index) => ({
        distance,
        metadata: queryResult.metadatas[0][index],
      }))
      .filter((item) => item.metadata !== null)
      .map((item) => ({
        distance: item.distance,
        metadata: item.metadata as unknown as VectorStoreMetadata,
      }));

    return result;
  }
}
