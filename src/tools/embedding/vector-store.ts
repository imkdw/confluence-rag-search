import { ChromaClient, Collection } from 'chromadb';
import { EmbeddingData } from '../../types/embedding/embedding.type';
import { EmbeddingClient } from './embedding';

export class ChromaVectorStore {
  private readonly embeddingClient: EmbeddingClient;

  private static readonly COLLECTION_NAME = 'confluence_rag_search';
  private readonly client: ChromaClient;
  private collection: Collection;

  private constructor(client: ChromaClient, collection: Collection, embeddingClient: EmbeddingClient) {
    this.client = client;
    this.collection = collection;
    this.embeddingClient = embeddingClient;
  }

  static async create(embeddingClient: EmbeddingClient): Promise<ChromaVectorStore> {
    const client = new ChromaClient();

    let collection: Collection;
    try {
      collection = await client.getCollection({
        name: ChromaVectorStore.COLLECTION_NAME,
      });
    } catch {
      collection = await client.createCollection({
        name: ChromaVectorStore.COLLECTION_NAME,
        embeddingFunction: null,
      });
    }

    return new ChromaVectorStore(client, collection, embeddingClient);
  }

  async saveEmbeddings(data: EmbeddingData[]): Promise<void> {
    const batchSize = 5000;
    const batches: EmbeddingData[][] = [];

    for (let i = 0; i < data.length; i += batchSize) {
      batches.push(data.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      await this.collection.upsert({
        ids: batch.map((embedding) => embedding.id),
        embeddings: batch.map((embedding) => embedding.values),
        metadatas: batch.map((embedding) => embedding.metadata),
      });
    }
  }

  async searchSimilar(word: string, limit: number = 10) {
    const embedding = await this.embeddingClient.embeddingText(word, 'query');

    const queryResult = await this.collection.query({
      queryEmbeddings: [embedding],
      nResults: limit,
    });

    const result = queryResult.distances[0].map((distance, index) => ({
      distance: distance ?? 0,
      metadata: queryResult.metadatas[0][index],
    }));

    return result;
  }
}
