import { Module } from '@nestjs/common';
import { EMBEDDING_SERVICE } from './embedding.const';
import { LocalEmbeddingService } from './local-embedding.service';

@Module({
  providers: [
    {
      provide: EMBEDDING_SERVICE,
      useClass: LocalEmbeddingService,
    },
  ],
  exports: [EMBEDDING_SERVICE],
})
export class EmbeddingModule {}
