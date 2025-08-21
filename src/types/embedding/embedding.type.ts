import { ConfluencePage } from '@prisma/client';

export interface EmbeddingMetadata {
  pageId: number;
  title: string;
  url: string;
  contentPreview: string;
  [key: string]: string | number | null;
}

export interface ConfluencePagesWithEmbedding extends ConfluencePage {
  contentPreview: string;
  embeddings: number[];
}
