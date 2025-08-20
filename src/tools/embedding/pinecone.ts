import { Pinecone, PineconeRecord } from '@pinecone-database/pinecone';
import { ConfluencePage, PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
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

const BATCH_SIZE = 10;
const BATCH_DELAY_MS = 2000;

function createMetadata(page: Pick<ConfluencePage, 'id' | 'title' | 'url' | 'content'>): EmbeddingMetadata {
  return {
    pageId: page.id,
    title: page.title,
    url: page.url,
    contentPreview: page.content,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function upsertInBatches(pineconeData: PineconeRecord<EmbeddingMetadata>[]): Promise<void> {
  const totalBatches = Math.ceil(pineconeData.length / BATCH_SIZE);

  for (let i = 0; i < pineconeData.length; i += BATCH_SIZE) {
    const batch = pineconeData.slice(i, i + BATCH_SIZE);
    const currentBatch = Math.floor(i / BATCH_SIZE) + 1;

    console.log(`[${currentBatch}/${totalBatches}] 배치 처리 중... (${batch.length}개 레코드)`);

    try {
      await index.upsert(batch);
      console.log(`[${currentBatch}/${totalBatches}] 배치 처리 완료`);

      if (i + BATCH_SIZE < pineconeData.length) {
        console.log(`${BATCH_DELAY_MS}ms 대기 중...`);
        await sleep(BATCH_DELAY_MS);
      }
    } catch (error) {
      console.error(`[${currentBatch}/${totalBatches}] 배치 처리 실패:`, error);
      throw error;
    }
  }
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

  console.log(`총 ${pineconeData.length}개의 레코드를 ${BATCH_SIZE}개씩 배치 처리 시작`);
  await upsertInBatches(pineconeData);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
init();
