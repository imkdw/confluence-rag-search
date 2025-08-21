import { SetMetadata } from '@nestjs/common';

export const SLACK_MESSAGE_METADATA = 'slack:message' as const;

export interface MessageHandlerMetadata {
  pattern: string | RegExp;
  options?: Record<string, unknown>;
}

export const Message = (pattern: string | RegExp, options?: Record<string, unknown>) =>
  SetMetadata(SLACK_MESSAGE_METADATA, { pattern, options } as MessageHandlerMetadata);
