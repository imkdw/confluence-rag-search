export interface RerankerResult {
  index: number;
  relevanceScore: number;
}

export interface DocumentCandidate {
  text: string;
  metadata?: Record<string, any>;
}
