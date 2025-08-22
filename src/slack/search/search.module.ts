import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { SlackMessageRegisterService } from '../service/slack-message-register.service';
import { VectorStoreModule } from '../../vector-store/vector-store.module';
import { RerankerModule } from '../../reranker/reranker.module';

@Module({
  imports: [DiscoveryModule, VectorStoreModule, RerankerModule],
  controllers: [SearchController],
  providers: [SlackMessageRegisterService, SearchService],
})
export class SearchModule {}
