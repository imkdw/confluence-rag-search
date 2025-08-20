import axios from 'axios';
import { config } from 'dotenv';
import { generateConfluenceAuthorization, parseOpaqueCursorToken } from '../../utils/confluence.util';
import { GetConfluencePagesResponse } from '../../types/confluence/confluence-api.type';
import { ConfluencePage, ConfluencePageDetail } from '../../types/confluence/confluence.type';
import { Prisma, PrismaClient } from '@prisma/client';

config();

const prisma = new PrismaClient();
const baseUrl = process.env.CONFLUENCE_BASE_URL;

async function getAllPages() {
  let cursor: null | string = null;
  const pages: ConfluencePage[] = [];
  const limit = 250;

  do {
    const getPagesUrl = `${baseUrl}/wiki/api/v2/pages?limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`;

    try {
      const response = await axios.get<GetConfluencePagesResponse>(getPagesUrl, {
        headers: {
          Authorization: generateConfluenceAuthorization(),
          Accept: 'application/json',
        },
      });

      pages.push(...response.data.results);
      cursor = parseOpaqueCursorToken(response.data._links.next);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(error.response?.data);
      }
    }
  } while (cursor);

  return pages;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function deleteExistPages(tx: Prisma.TransactionClient) {
  await tx.confluencePage.deleteMany();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

async function getPageDetail(pageId: number) {
  const getPageDetailUrl: string = `${baseUrl}/wiki/api/v2/pages/${pageId}?body-format=editor`;

  const response = await axios.get<ConfluencePageDetail>(getPageDetailUrl, {
    headers: {
      Authorization: generateConfluenceAuthorization(),
      Accept: 'application/json',
    },
  });

  return response.data.body.editor.value;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function updatePageContent(pages: ConfluencePage[]) {
  for (const page of pages) {
    const pageId = parseInt(page.id);
    const detail = await getPageDetail(pageId);

    await prisma.confluencePage.update({
      where: { id: pageId },
      data: { content: detail },
    });

    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

async function init() {
  const pages = await getAllPages();

  /**
   * 문서 목록 삭제하고 재저장
   */
  // await prisma.$transaction(async (tx) => {
  //   await deleteExistPages(tx);
  //   await savePages(pages, tx);
  // });

  /**
   * 문서 목록 콘텐츠 업데이트
   */
  // await updatePageContent(pages);

  return pages;
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
init();
