import { Injectable } from '@nestjs/common';

@Injectable()
export class SearchService {
  constructor() {}

  search(query: string) {
    return query;
  }
}
