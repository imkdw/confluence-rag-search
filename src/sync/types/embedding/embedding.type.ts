import { ConfluencePage } from '@prisma/client';

export interface EmbeddingMetadata {
  pageId: number;
  title: string;
  url: string;
  content: string;
  [key: string]: string | number | null;
}

export interface ConfluencePagesWithEmbedding extends ConfluencePage {
  embeddings: number[];
}

export interface EmbeddingData {
  id: string;
  values: number[];
  metadata: EmbeddingMetadata;
}
