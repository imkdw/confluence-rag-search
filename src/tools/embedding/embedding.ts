import { GoogleGenAI } from '@google/genai';
import { Document } from '@langchain/core/documents';
import { pipeline, env, Tensor } from '@xenova/transformers';

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
  env.localModelPath = './models/';
  env.allowRemoteModels = true;

  const embedder = await pipeline('feature-extraction', 'Xenova/multilingual-e5-large');

  const result = await embedder([document.pageContent], {
    pooling: 'mean',
    normalize: true,
  });

  return tensorToNumberArray(result);
}

function tensorToNumberArray(tensor: Tensor): number[] {
  const data = tensor.data;

  if (data instanceof Float32Array) {
    return Array.from(data);
  } else if (data instanceof Float64Array) {
    return Array.from(data);
  } else if (data instanceof BigInt64Array) {
    return Array.from(data, (value: bigint) => Number(value));
  } else if (data instanceof Int32Array) {
    return Array.from(data);
  } else if (Array.isArray(data)) {
    return data.map(Number);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unnecessary-type-assertion
    return Array.from(data as any, Number);
  }
}
