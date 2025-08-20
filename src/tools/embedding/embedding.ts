import { GoogleGenAI } from '@google/genai';
import { Document } from '@langchain/core/documents';
import axios from 'axios';

const PINECONE_FREE_TIER_VECTOR_SHAPE = 1024;

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

export async function embeddingDocument(provider: 'google' | 'local', document: Document): Promise<number[]> {
  if (provider === 'google') {
    return googleEmbedding(document);
  }

  if (provider === 'local') {
    return localEmbedding(document);
  }

  return [];
}

async function googleEmbedding(document: Document): Promise<number[]> {
  const response = await ai.models.embedContent({
    model: 'gemini-embedding-001',
    contents: document.pageContent,
    config: {
      outputDimensionality: PINECONE_FREE_TIER_VECTOR_SHAPE,
    },
  });

  return response.embeddings?.[0]?.values || [];
}

async function localEmbedding(document: Document): Promise<number[]> {
  try {
    const response = await axios.post<{ embedding: number[] }>('http://localhost:8000/embeddings', {
      text: document.pageContent,
    });

    return response.data.embedding;
  } catch (error) {
    console.error('임베딩 API 호출 에러:', error);
    throw error;
  }
}
