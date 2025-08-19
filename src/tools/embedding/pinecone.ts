import { Pinecone } from '@pinecone-database/pinecone';
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { splitByHTML } from '../text-splitter/html.splitter';
import { GoogleGenAI } from '@google/genai';

config();

const prisma = new PrismaClient();

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
  maxRetries: 5,
});

async function init() {
  const page = await prisma.confluencePage.findFirstOrThrow({
    where: {
      id: 151126018,
    },
  });

  const splittedPage = await splitByHTML(page.content);

  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

  const response = await ai.models.embedContent({
    model: 'gemini-embedding-001',
    contents: 'What is the meaning of life?',
    config: {
      // pinecone 프리티어 벡터 차원수
      outputDimensionality: 1024,
    },
  });
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
init();
