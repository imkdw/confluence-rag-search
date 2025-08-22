import { Module } from '@nestjs/common';
import { RERANKER_SERVICE } from './reranker.const';
import { CohereRerankerService } from './cohere-reranker.service';

@Module({
  providers: [
    {
      provide: RERANKER_SERVICE,
      useClass: CohereRerankerService,
    },
  ],
  exports: [RERANKER_SERVICE],
})
export class RerankerModule {}
