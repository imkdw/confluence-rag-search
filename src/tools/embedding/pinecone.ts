import { Pinecone, PineconeRecord } from '@pinecone-database/pinecone';
import { ConfluencePage, PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { promises as fs } from 'fs';
import { splitByHTML } from '../text-splitter/html.splitter';
import { embeddingDocument } from './embedding';
import { ConfluencePagesWithEmbedding, EmbeddingMetadata } from '../../types/embedding/embedding.type';

config();

const prisma = new PrismaClient();

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
  maxRetries: 5,
});

const index = pc.index(process.env.PINECONE_INDEX!);

const SAVE_FILE_PATH = './embedding-progress.json';

function createMetadata(page: Pick<ConfluencePage, 'id' | 'title' | 'url' | 'content'>): EmbeddingMetadata {
  return {
    pageId: page.id,
    title: page.title,
    url: page.url,
    contentPreview: page.content,
  };
}

async function appendToJson(data: unknown): Promise<void> {
  await fs.writeFile(SAVE_FILE_PATH, JSON.stringify(data, null, 2));
}

async function init() {
  const confluencePages = await prisma.confluencePage.findMany({
    orderBy: {
      id: 'desc',
    },
  });

  const confluencePagesWithEmbeddings: ConfluencePagesWithEmbedding[][] = [];

  for (const [index, page] of confluencePages.entries()) {
    const splittedPages = await splitByHTML(page.content);
    console.log(
      `[${index + 1}/${confluencePages.length}] 컨플루언스 문서의 페이지 분할본 개수 : ${splittedPages.length}`,
    );

    const embeddings: number[][] = [];
    for (const splittedPage of splittedPages) {
      const embedding = await embeddingDocument('local', splittedPage);
      embeddings.push(embedding);
    }

    const data = splittedPages.map((splittedPage, index) => ({
      ...page,
      content: splittedPage.pageContent,
      contentPreview: splittedPage.pageContent.slice(0, 150),
      embeddings: embeddings[index],
    }));

    confluencePagesWithEmbeddings.push(data);

    console.log(`[${index + 1}/${confluencePages.length}] 컨플루언스 문서 처리완료`);
  }

  const pineconeData = confluencePagesWithEmbeddings.flatMap((confluencePagesWithEmbedding) =>
    confluencePagesWithEmbedding.map(
      (page, index): PineconeRecord<EmbeddingMetadata> => ({
        id: `${page.id}-${index + 1}`,
        metadata: createMetadata(page),
        values: page.embeddings,
      }),
    ),
  );

  await appendToJson(pineconeData);

  await index.upsert(pineconeData);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
init();
