import { Module } from '@nestjs/common';
import { VECTOR_STORE_SERVICE } from './vector-store.const';
import { ChromaService } from './chroma.service';
import { EmbeddingModule } from '../embedding/embedding.module';

@Module({
  imports: [EmbeddingModule],
  providers: [
    {
      provide: VECTOR_STORE_SERVICE,
      useClass: ChromaService,
    },
  ],
  exports: [VECTOR_STORE_SERVICE],
})
export class VectorStoreModule {}
