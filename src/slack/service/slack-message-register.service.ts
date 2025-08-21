import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { App } from '@slack/bolt';
import { ConfigService } from '@nestjs/config';
import { MessageHandlerMetadata, SLACK_MESSAGE_METADATA } from '../decorator/slack.decorator';

@Injectable()
export class SlackMessageRegisterService implements OnModuleInit {
  private readonly app: App;

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {
    this.app = new App({
      signingSecret: this.configService.get('SLACK_SIGNING_SECRET'),
      token: this.configService.get('SLACK_BOT_TOKEN'),
      appToken: this.configService.get('SLACK_APP_TOKEN'),
      socketMode: true,
    });
  }

  async onModuleInit() {
    this.registerHandlers();
    await this.app.start();
  }

  private registerHandlers() {
    const controllers = this.discoveryService.getControllers();

    controllers.forEach((controller) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { instance } = controller;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const prototype = Object.getPrototypeOf(instance);

      const methodNames = Object.getOwnPropertyNames(prototype).filter(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (name) => name !== 'constructor' && typeof prototype[name] === 'function',
      );

      methodNames.forEach((methodName) => this.registerMessageHandlers(instance, methodName));
    });
  }

  private registerMessageHandlers(instance: any, methodName: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    const metadata: MessageHandlerMetadata = this.reflector.get(SLACK_MESSAGE_METADATA, instance[methodName]);

    if (metadata) {
      this.app.message(metadata.pattern, async (args) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        await instance[methodName](args);
      });
    }
  }
}
