import axios from 'axios';
import { ConfluencePage, ConfluencePageDetail } from '../../types/confluence/confluence.type';
import { GetConfluencePagesResponse } from '../../types/confluence/confluence-api.type';

export class ConfluenceClient {
  private readonly baseUrl: string;
  private readonly authorization: string;

  constructor() {
    this.baseUrl = process.env.CONFLUENCE_BASE_URL!;
    this.authorization = this.generateAuthorization();
  }

  async getAllPages() {
    let cursor: null | string = null;
    const pages: ConfluencePage[] = [];
    const limit = 250;

    do {
      const getPagesUrl: string = `${this.baseUrl}/wiki/api/v2/pages?limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`;

      try {
        const response = await axios.get<GetConfluencePagesResponse>(getPagesUrl, {
          headers: {
            Authorization: this.authorization,
            Accept: 'application/json',
          },
        });

        pages.push(...response.data.results);
        cursor = this.parseOpaqueCursorToken(response.data._links.next);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const errorData: unknown = error.response?.data;
          console.error(errorData);
          throw errorData;
        }

        throw error;
      }
    } while (cursor);

    return pages;
  }

  async getPageDetail(pageId: number) {
    const getPageDetailUrl: string = `${this.baseUrl}/wiki/api/v2/pages/${pageId}?body-format=editor`;

    const response = await axios.get<ConfluencePageDetail>(getPageDetailUrl, {
      headers: {
        Authorization: this.authorization,
        Accept: 'application/json',
      },
    });

    return response.data.body.editor.value;
  }

  private generateAuthorization(): string {
    const email = process.env.CONFLUENCE_EMAIL;
    const apiKey = process.env.CONFLUENCE_API_KEY;

    const prefix = 'Basic';

    return `${prefix} ${Buffer.from(`${email}:${apiKey}`).toString('base64')}`;
  }

  private parseOpaqueCursorToken(cursor: string): string | null {
    if (!cursor) {
      return null;
    }

    const match = cursor.match(/cursor=([^&]+)/);

    return match ? match[1] : null;
  }
}
