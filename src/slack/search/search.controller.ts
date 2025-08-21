import { Controller } from '@nestjs/common';
import { Message } from '../decorator/slack.decorator';
import { SearchService } from './search.service';
import { KnownEventFromType, SlackEventMiddlewareArgs } from '@slack/bolt';

@Controller()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Message('!검색')
  async handleSearchMessage({ message, say }: SlackEventMiddlewareArgs<'message'>) {
    if (this.isHasText(message)) {
      const result = this.searchService.search(message.text!);
      await say(result);
    } else {
      await say('잘못된 메세지 형식입니다');
    }
  }

  private isHasText(message: KnownEventFromType<'message'>) {
    return message.subtype === undefined || message.subtype === 'bot_message';
  }
}
