import { config } from 'dotenv';
import { Prisma, PrismaClient, ConfluencePage as PrismaConfluencePage } from '@prisma/client';
import { ConfluenceClient } from './confluence.client';
import { ChromaVectorStore } from '../embedding/vector-store';
import { TextSplitter } from '../text-splitter/splitter';
import { EmbeddingClient } from '../embedding/embedding';
import { ConfluencePagesWithEmbedding, EmbeddingData, EmbeddingMetadata } from '../../types/embedding/embedding.type';
import { ConfluencePage } from '../../types/confluence/confluence.type';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

config();

const prisma = new PrismaClient();
const baseUrl = process.env.CONFLUENCE_BASE_URL;

const confluenceClient = new ConfluenceClient();

async function deleteExistPages(tx: Prisma.TransactionClient) {
  await tx.confluencePage.deleteMany();
}

async function savePages(pages: ConfluencePage[], tx: Prisma.TransactionClient) {
  const data = pages.map(
    (page): Prisma.ConfluencePageCreateManyInput => ({
      id: parseInt(page.id, 10),
      title: page.title,
      content: '',
      url: `${baseUrl}/wiki${page._links.webui}`,
      createdAt: new Date(page.createdAt),
      updatedAt: new Date(page.createdAt),
    }),
  );

  await tx.confluencePage.createMany({ data });
}

async function updatePageContent(pages: ConfluencePage[]) {
  for (const page of pages) {
    const pageId = parseInt(page.id);
    const detail = await confluenceClient.getPageDetail(pageId);

    await prisma.confluencePage.update({
      where: { id: pageId },
      data: { content: detail },
    });

    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

function createMetadata(page: ConfluencePagesWithEmbedding): EmbeddingMetadata {
  return {
    pageId: page.id,
    title: page.title,
    url: page.url,
    content: page.content,
  };
}

async function createEmbeddingData(existPages: PrismaConfluencePage[]): Promise<EmbeddingData[]> {
  const jsonPath = join(process.cwd(), 'embedding-progress.json');

  const existEmbeddingData = await readFile(jsonPath, 'utf-8').catch(() => null);
  if (existEmbeddingData) {
    return JSON.parse(existEmbeddingData) as EmbeddingData[];
  }

  const textSplitter = new TextSplitter();
  const embeddingClient = new EmbeddingClient();

  const confluencePagesWithEmbeddings: ConfluencePagesWithEmbedding[][] = [];

  for (const [index, page] of existPages.entries()) {
    const splittedPages = await textSplitter.splitByHTML(page.content);

    const embeddings: number[][] = [];
    for (const splittedPage of splittedPages) {
      const embedding = await embeddingClient.embeddingText(splittedPage.pageContent, 'passage');
      embeddings.push(embedding);
    }

    const data = splittedPages.map((splittedPage, index) => ({
      ...page,
      content: splittedPage.pageContent,
      embeddings: embeddings[index],
    }));

    confluencePagesWithEmbeddings.push(data);
    console.log(`[${index + 1}/${existPages.length}] 컨플루언스 문서 처리완료`);
  }

  return confluencePagesWithEmbeddings.flatMap((confluencePage) => {
    return confluencePage.map((page, index) => ({
      id: `${page.id}-${index + 1}`,
      values: page.embeddings,
      metadata: createMetadata(page),
    }));
  });
}

async function init() {
  let existPages = await prisma.confluencePage.findMany();

  if (existPages.length === 0) {
    const pages = await confluenceClient.getAllPages();

    await prisma.$transaction(async (tx) => {
      await deleteExistPages(tx);
      await savePages(pages, tx);
    });

    await updatePageContent(pages);

    existPages = await prisma.confluencePage.findMany();
  }

  const embeddingClient = new EmbeddingClient();
  const vectorStore = await ChromaVectorStore.create(embeddingClient);
  const embeddingData = await createEmbeddingData(existPages);

  await writeFile(join(process.cwd(), 'embedding-progress.json'), JSON.stringify(embeddingData, null, 2));

  await vectorStore.saveEmbeddings(embeddingData);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
init();
