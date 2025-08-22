import { Inject, Injectable } from '@nestjs/common';
import { VectorStoreService } from '../../vector-store/vector-store.service';
import { VECTOR_STORE_SERVICE } from '../../vector-store/vector-store.const';
import { VectorStoreSearchResult } from '../../vector-store/vector-store.type';

@Injectable()
export class SearchService {
  constructor(@Inject(VECTOR_STORE_SERVICE) private readonly vectorStoreService: VectorStoreService) {}

  async search(query: string): Promise<VectorStoreSearchResult[]> {
    const result = await this.vectorStoreService.search(query, 5);
    return result;
  }
}
