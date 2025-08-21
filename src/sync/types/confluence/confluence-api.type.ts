import { ConfluencePage } from './confluence.type';

export interface GetConfluencePagesResponse {
  results: ConfluencePage[];
  _links: {
    next: string;
    base: string;
  };
}
