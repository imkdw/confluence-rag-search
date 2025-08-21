import { ChromaClient, Collection } from 'chromadb';
import { EmbeddingMetadata } from '../../types/embedding/embedding.type';

export class ChromaVectorStore {
  private static readonly COLLECTION_NAME = 'confluence_rag_search';
  private readonly client: ChromaClient;
  private collection: Collection;

  private constructor(client: ChromaClient, collection: Collection) {
    this.client = client;
    this.collection = collection;
  }

  static async create(): Promise<ChromaVectorStore> {
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

    return new ChromaVectorStore(client, collection);
  }

  async saveEmbeddings(embeddings: { id: string; embedding: number[]; metadata: EmbeddingMetadata }[]): Promise<void> {
    await this.collection.add({
      ids: embeddings.map((embedding) => embedding.id),
      embeddings: embeddings.map((embedding) => embedding.embedding),
      metadatas: embeddings.map((embedding) => embedding.metadata),
    });
  }

  async searchSimilar(embedding: number[], limit: number = 10) {
    return this.collection.query({
      queryEmbeddings: [embedding],
      nResults: limit,
    });
  }
}
