import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SearchModule } from './slack/search/search.module';
import { RerankerModule } from './reranker/reranker.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RerankerModule,
    SearchModule,
  ],
})
export class AppModule {}
