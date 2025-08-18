import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';

export async function splitByHTML(html: string): Promise<Document[]> {
  const htmlSplitter = RecursiveCharacterTextSplitter.fromLanguage('html', {
    chunkSize: 500,
    chunkOverlap: 50,
  });

  const htmlDocs = await htmlSplitter.createDocuments([html]);

  return htmlDocs;
}
