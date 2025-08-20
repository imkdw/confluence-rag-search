import { GoogleGenAI } from '@google/genai';
import { Document } from '@langchain/core/documents';

const PINECONE_FREE_TIER_VECTOR_SHAPE = 1024;

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

export async function embeddingDocument(document: Document): Promise<number[]> {
  const response = await ai.models.embedContent({
    model: 'gemini-embedding-001',
    contents: document.pageContent,
    config: {
      outputDimensionality: PINECONE_FREE_TIER_VECTOR_SHAPE,
    },
  });

  return response.embeddings?.[0]?.values || [];
}
