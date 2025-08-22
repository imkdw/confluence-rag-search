export interface VectorStoreMetadata {
  pageId: number;
  title: string;
  content: string;
  url: string;
}

export interface VectorStoreSearchResult {
  distance: number;
  metadata: VectorStoreMetadata;
}
