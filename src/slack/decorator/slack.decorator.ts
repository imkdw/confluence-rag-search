import { SetMetadata } from '@nestjs/common';

export const SLACK_MESSAGE_METADATA = 'slack:message' as const;

export interface MessageHandlerMetadata {
  pattern: string | RegExp;
}

export const Message = (pattern: string | RegExp) =>
  SetMetadata(SLACK_MESSAGE_METADATA, { pattern } as MessageHandlerMetadata);
