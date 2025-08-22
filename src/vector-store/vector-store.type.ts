export interface VectorStoreMetadata {
  pageId: number;
  title: string;
  contentPreview: string;
  url: string;
}

export interface VectorStoreSearchResult {
  distance: number;
  metadata: VectorStoreMetadata;
}
