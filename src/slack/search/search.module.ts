import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { SlackMessageRegisterService } from '../service/slack-message-register.service';

@Module({
  imports: [DiscoveryModule],
  controllers: [SearchController],
  providers: [SlackMessageRegisterService, SearchService],
})
export class SearchModule {}
