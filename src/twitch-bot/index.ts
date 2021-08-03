// Needs to be the first thing that happens
// Registers the import aliases
import 'module-alias/register';
import tmi from 'tmi.js';

import logger from '@common/logging';
import config from '@common/config';
import SRCommand from '@twitch-bot/commands/sr-command';

export default class TwitchBot {
  private client: tmi.Client;

  constructor() {
    this.client = new tmi.Client({
      options: { messagesLogLevel: 'info' },
      connection: {
        reconnect: true,
        secure: true,
      },
      identity: {
        username: config.twitch.bot.username,
        password: config.twitch.bot.oauthToken,
      },
      channels: ['Tandashii'],
      logger,
    });

    this.configure();
  }

  private configure(): void {
    this.client.on('message', (channel, userstate, message, self) =>
      this.handleOnMessage(channel, userstate, message, self)
    );
  }

  private handleOnMessage(channel: string, userstate: tmi.Userstate, message: string, self: boolean): void {
    if (self) {
      return;
    }

    if (message.toLowerCase().startsWith('!sr ')) {
      SRCommand.process(channel, userstate, message, this);
    }
  }

  public sendMessage(channelId: string, message: string, replyTo?: tmi.Userstate): void {
    if (!replyTo) {
      this.client.say(channelId, message);
    } else {
      this.client.say(channelId, `[@${replyTo['display-name']}] ${message}`);
    }
  }

  public start(): void {
    logger.info('Starting Twitch Bot...');
    this.client
      .connect()
      .then(() => {
        logger.info('Twitch Bot started successfully');
      })
      .catch((err: Error) => {
        logger.error(err);
      });
  }
}
