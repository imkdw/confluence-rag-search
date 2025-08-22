import { Controller } from '@nestjs/common';
import { Message } from '../decorator/slack.decorator';
import { SearchService, SearchResult } from './search.service';
import { KnownEventFromType, SlackEventMiddlewareArgs, types } from '@slack/bolt';

@Controller()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Message('!검색')
  async handleSearchMessage({ message, say }: SlackEventMiddlewareArgs<'message'>) {
    if (this.isHasText(message)) {
      const query = message.text!.replace('!검색', '').trim();

      if (!query) {
        await say({
          text: '검색어를 입력해주세요',
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: '*검색어를 입력해주세요*\n사용법: `!검색 [검색어]`',
              },
            } satisfies types.SectionBlock,
          ],
        });
        return;
      }

      await say({
        text: `${query}에 대해서 검색 중입니다...`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `🔍 "${query}"에 대해서 검색 중입니다...`,
            },
          } satisfies types.SectionBlock,
        ],
      });

      const result = await this.searchService.search(query);

      const blocks = this.formatSearchResults(query, result);

      await say({
        text: `${result.length}개의 검색 결과를 찾았습니다`,
        blocks,
      });
    } else {
      await say({
        text: '잘못된 메세지 형식입니다',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '❌ *잘못된 메시지 형식입니다*\n사용법: `!검색 [검색어]`',
            },
          } satisfies types.SectionBlock,
        ],
      });
    }
  }

  private formatSearchResults(query: string, results: SearchResult[]): types.KnownBlock[] {
    const blocks: types.KnownBlock[] = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*"${query}"* 검색 결과 (${results.length}개)`,
        },
      } satisfies types.SectionBlock,
      {
        type: 'divider',
      } satisfies types.DividerBlock,
    ];

    results.forEach((item, index) => {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${index + 1}. ${item.metadata.title}*\n${item.metadata.content.slice(0, 100)}...\n\n유사도: ${Math.round(item.relevanceScore * 100)}%`,
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '전체보기',
            emoji: true,
          },
          url: item.metadata.url,
          action_id: `view_page_${index}`,
        },
      } satisfies types.SectionBlock);

      if (index < results.length - 1) {
        blocks.push({
          type: 'divider',
        } satisfies types.DividerBlock);
      }
    });

    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: '더 정확한 검색을 위해 구체적인 키워드를 사용해보세요',
        },
      ],
    } satisfies types.ContextBlock);

    return blocks;
  }

  private isHasText(message: KnownEventFromType<'message'>) {
    return message.subtype === undefined || message.subtype === 'bot_message';
  }
}
