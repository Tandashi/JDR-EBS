// Needs to be the first thing that happens
// Registers the import aliases
import 'module-alias/register';
import tmi from 'tmi.js';

import getLogger from '@common/logging';
import config from '@common/config';

import AnnounceService from '@services/announce-service';

import StreamerConfigurationDao from '@db/dao/streamer-configuration-dao';
import { IStreamerConfiguration } from '@db/schema/streamer-configuration';

import ICommand, { ICommandParameters } from '@twitch-bot/command';
import SRCommand from '@twitch-bot/commands/sr-command';
import QueueCommand from '@twitch-bot/commands/queue-command';
import BanlistCommand from '@twitch-bot/commands/banlist-command';

const logger = getLogger('Twitch Bot');

export default class TwitchBot {
  private static instance: TwitchBot;

  private client: tmi.Client;
  private configurations: {
    [k: string]: IStreamerConfiguration;
  } = {};

  private commands: { [k: string]: ICommand } = {
    '!sr': new SRCommand(),
    '!queue': new QueueCommand(),
    '!banlist': new BanlistCommand(),
  };

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

        this.join(channelName, c);
      });
    }

    if (configurationsResult.type === 'error') {
      logger.error(
        'Unable to connect to channels. StreamerConfigurationDao returned an error while fetching channels.'
      );
    }
  }

  private async handleOnMessage(
    channelName: string,
    userstate: tmi.Userstate,
    message: string,
    self: boolean
  ): Promise<void> {
    if (self) {
      return;
    }

    const commandIdentifier = message.split(' ')[0].toLowerCase();
    const command = this.commands[commandIdentifier];

    if (!command) {
      return;
    }

    const configuration = this.getConfiguration(channelName);
    const commandsConfiguration = configuration.chatIntegration.commands;

    if (!command.enabled(commandsConfiguration)) {
      return;
    }

    const params: ICommandParameters = {
      channel: channelName,
      userstate: userstate,
      message: message,
      bot: this,
    };

    command.process(params);
  }

  public join(channelName: string, configuration: IStreamerConfiguration): void {
    this.updateConfiguration(channelName, configuration);
    this.client.join(channelName);
  }

  public part(channelName: string): void {
    delete this.configurations[this.getUpdatedChannelName(channelName)];
    this.client.part(channelName);
  }

  public updateConfiguration(channelName: string, configuration: IStreamerConfiguration): void {
    this.configurations[this.getUpdatedChannelName(channelName)] = configuration;
  }

  private getUpdatedChannelName(channelName: string): string {
    return channelName.toLowerCase().replace('#', '');
  }

  public getConfiguration(channelName: string): IStreamerConfiguration {
    return this.configurations[this.getUpdatedChannelName(channelName)];
  }

  public sendMessage(channelName: string, message: string, replyTo?: tmi.Userstate): void {
    if (!replyTo) {
      this.client.say(channelName, AnnounceService.getChatFiendlyString(message));
    } else {
      this.client.say(channelName, AnnounceService.getChatFiendlyString(`[@${replyTo['display-name']}] ${message}`));
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
        logger.error(err.message);
      });
  }
}
