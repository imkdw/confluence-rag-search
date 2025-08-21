import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';

export class TextSplitter {
  private readonly CHUNK_SIZE = 1200;
  private readonly CHUNK_OVERLAP = 150;

  async splitByHTML(html: string): Promise<Document[]> {
    const htmlSplitter = RecursiveCharacterTextSplitter.fromLanguage('html', {
      chunkSize: this.CHUNK_SIZE,
      chunkOverlap: this.CHUNK_OVERLAP,
    });

    const htmlDocs = await htmlSplitter.createDocuments([html]);

    return htmlDocs.map((docs) => ({
      ...docs,
      pageContent: this.removeHtmlTags(docs.pageContent),
    }));
  }

  private removeHtmlTags(html: string) {
    return html
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<nav[^>]*>.*?<\/nav>/gi, '')
      .replace(/<header[^>]*>.*?<\/header>/gi, '')
      .replace(/<footer[^>]*>.*?<\/footer>/gi, '')
      .replace(/<aside[^>]*>.*?<\/aside>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, ' ')
      .trim();
  }
}
