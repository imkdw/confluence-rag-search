import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';

/**
 * HTML 본문 문자열 스플리터
 */
export async function splitByHTML(html: string): Promise<Document[]> {
  const CHUNK_SIZE = 500;
  const CHUNK_OVERLAP = 50;

  const htmlSplitter = RecursiveCharacterTextSplitter.fromLanguage('html', {
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });

  const htmlDocs = await htmlSplitter.createDocuments([html]);

  return htmlDocs;
}
