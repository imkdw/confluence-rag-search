import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';

export class TextSplitter {
  private readonly CHUNK_SIZE = 500;
  private readonly CHUNK_OVERLAP = 50;

  async splitByHTML(html: string): Promise<Document[]> {
    const htmlSplitter = RecursiveCharacterTextSplitter.fromLanguage('html', {
      chunkSize: this.CHUNK_SIZE,
      chunkOverlap: this.CHUNK_OVERLAP,
    });

    const htmlDocs = await htmlSplitter.createDocuments([html]);

    return htmlDocs;
  }
}
