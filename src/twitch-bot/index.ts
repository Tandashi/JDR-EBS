// Needs to be the first thing that happens
// Registers the import aliases
import 'module-alias/register';
import tmi from 'tmi.js';

import logger from '@common/logging';
import config from '@common/config';

import StreamerConfigurationDao from '@common/db/dao/streamer-configuration-dao';

import SRCommand from '@twitch-bot/commands/sr-command';
import BanlistCommand from './commands/banlist-command';

export default class TwitchBot {
  private static instance: TwitchBot;

  private client: tmi.Client;

  private constructor() {
    this.client = new tmi.Client({
      options: { messagesLogLevel: 'info' },
      connection: {
        reconnect: true,
        secure: true,
      },
      identity: {
        username: config.twitch.bot.username,
        password: `oauth:${config.twitch.bot.oauthToken}`,
      },
      channels: [],
      logger,
    });

    this.configure();
  }

  public static getInstance(): TwitchBot {
    if (!this.instance) {
      this.instance = new TwitchBot();
    }

    return this.instance;
  }

  private configure(): void {
    this.client.on('message', (channel, userstate, message, self) =>
      this.handleOnMessage(channel, userstate, message, self)
    );

    this.client.on('connected', () => {
      this.connect();
    });
  }

  private async connect(): Promise<void> {
    const configurationsResult = await StreamerConfigurationDao.getAllWithChatIntegrationEnabled();

    if (configurationsResult.type === 'success') {
      configurationsResult.data.forEach((c) => {
        const channelName = c.chatIntegration.channelName;

        if (channelName === '') {
          return logger.error(
            `Configuration (${c._id}) is malformed. Chat Integration is activated but channel name is emtpy.`
          );
        }

        this.client.join(channelName);
      });
    }

    if (configurationsResult.type === 'error') {
      logger.error(
        'Unable to connect to channels. StreamerConfigurationDao returned an error while fetching channels.'
      );
    }
  }

  private handleOnMessage(channel: string, userstate: tmi.Userstate, message: string, self: boolean): void {
    if (self) {
      return;
    }

    if (message.toLowerCase().startsWith('!sr ')) {
      SRCommand.process(channel, userstate, message, this);
    }

    if (message.toLocaleLowerCase().startsWith('!banlist')) {
      BanlistCommand.process(channel, userstate, this);
    }
  }

  public join(channelName: string): void {
    this.client.join(channelName);
  }

  public part(channelName: string): void {
    this.client.part(channelName);
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
