// Needs to be the first thing that happens
// Registers the import aliases
import 'module-alias/register';
import tmi from 'tmi.js';
import { DateTime } from 'luxon';

import getLogger from '@common/logging';
import config from '@common/config';

import AnnounceService from '@services/announce-service';
import QueueService from '@services/queue-service';

import StreamerConfigurationDao from '@mongo/dao/streamer-configuration-dao';
import { IStreamerConfiguration, StreamerConfigurationDoc } from '@mongo/schema/streamer-configuration';

import ICommand, { ICommandParameters } from '@twitch-bot/command';
import SRCommand from '@twitch-bot/commands/sr-command';
import QueueCommand from '@twitch-bot/commands/queue-command';
import QueuePositionCommand from '@twitch-bot/commands/queue-position-command';
import BanlistCommand from '@twitch-bot/commands/banlist-command';
import LeaveCommand from '@twitch-bot/commands/leave-command';
import ToggleQueueCommand from '@twitch-bot/commands/toggle-queue-command';

const logger = getLogger('Twitch Bot');

export default class TwitchBot {
  private static instance: TwitchBot;

  private client: tmi.Client;
  private configurations: {
    [k: string]: IStreamerConfiguration;
  } = {};

  private commands: { [k: string]: ICommand } = {
    '!sr': new SRCommand(),
    '!songrequest': new SRCommand(),

    '!q': new QueueCommand(),
    '!queue': new QueueCommand(),

    '!qp': new QueuePositionCommand(),
    '!queueposition': new QueuePositionCommand(),

    '!bl': new BanlistCommand(),
    '!banlist': new BanlistCommand(),

    '!l': new LeaveCommand(),
    '!leave': new LeaveCommand(),

    '!oq': new ToggleQueueCommand(true),
    '!openqueue': new ToggleQueueCommand(true),

    '!cq': new ToggleQueueCommand(false),
    '!closequeue': new ToggleQueueCommand(false),
  };

  /**
   * Get the TwitchBot Instance
   *
   * @returns The TwitchBot Instance
   */
  public static getInstance(): TwitchBot {
    if (!this.instance) {
      this.instance = new TwitchBot();
    }

    return this.instance;
  }

  /**
   * Configure the TwitchBot to listen to IRC events
   */
  private configureClient(): void {
    this.client.on('message', (channel, userstate, message, self) =>
      this.handleOnMessage(channel, userstate, message, self)
    );

    this.client.on('notice', async (channelName, msgid, message) => {
      logger.info(`Got notice (${channelName} | ${msgid}): ${message}`);

      switch (msgid) {
        case 'msg_banned':
        case 'msg_channel_suspended':
          // The reason why we also remove the channel name is that
          // msg_channel_suspended can also happen when the channel was renamed.
          // In this case we can not just remove the complete streamerdata since the userid
          // did not change and we don't want to remove the configuration when they just changed
          // their name
          logger.info(`Removing Chat Integration for ${channelName}, as well as the channel name.`);

          StreamerConfigurationDao.updateByChannelName(
            this.getUnifiedChannelName(channelName),
            {
              'chatIntegration.channelName': '',
              'chatIntegration.enabled': false,
            },
            []
          );
          break;

        default:
          return;
      }
    });

    this.client.on('join', async (channelName, username, self) => {
      if (self) return;

      logger.info(`User ${username} joined the channel ${channelName}`);

      QueueService.updateUserState(this.getUnifiedChannelName(channelName), username, {
        inChat: true,
        lastSeen: undefined,
      });
    });

    this.client.on('part', async (channelName, username, self) => {
      if (self) return;

      logger.info(`User ${username} left the channel ${channelName}`);

      QueueService.updateUserState(this.getUnifiedChannelName(channelName), username, {
        inChat: false,
        lastSeen: DateTime.now().toMillis(),
      });
    });
  }

  /**
   * Initialize the StreamerConfigurations for the Bot
   *
   * **Note**: This should be called before {@link createClient}
   */
  private async initializeConfigurations(): Promise<void> {
    const configurationsResult = await StreamerConfigurationDao.getAllWithChatIntegrationEnabled();

    if (configurationsResult.type === 'error') {
      logger.error(
        'Unable to connect to channels. StreamerConfigurationDao returned an error while fetching channels.'
      );
    }

    if (configurationsResult.type === 'success') {
      configurationsResult.data.forEach((configuration) => {
        const channelName = configuration.chatIntegration.channelName;

        if (channelName === '') {
          return logger.error(
            `Configuration (${configuration._id}) is malformed. Chat Integration is activated but channel name is emtpy.`
          );
        }

        this.updateConfiguration(channelName, configuration);
      });
    }
  }

  /**
   * Create the Client
   */
  private async createClient(): Promise<void> {
    const channelsToConnectTo = Object.keys(this.configurations);

    this.client = new tmi.Client({
      options: { messagesLogLevel: 'debug' },
      connection: {
        reconnect: true,
        secure: true,
      },
      identity: {
        username: config.twitch.bot.username,
        password: `oauth:${config.twitch.bot.oauthToken}`,
      },
      channels: channelsToConnectTo,
      logger,
    });
  }

  /**
   * Handle all 'message' IRC Events
   *
   * @param channelName The channel name in which the message was sent
   * @param userstate The user state from the user that sent the message
   * @param message The message itself
   * @param self If the message was sent by us (aka JustDanceRequests)
   */
  private async handleOnMessage(
    channelName: string,
    userstate: tmi.Userstate,
    message: string,
    self: boolean
  ): Promise<void> {
    // Ignore messages that are sent by us
    if (self) {
      return;
    }

    // Get the command identifiert.
    // Messages usually look like this:
    //  !command param1 param2 param3 ...
    const commandIdentifier = message.split(' ')[0].toLowerCase();
    const command = this.commands[commandIdentifier];

    // Check if a command with that identifier is registered
    if (!command) {
      return;
    }

    // Grab the commands Configuration for the channel the message originated in
    const configuration = this.getConfiguration(channelName);
    const commandsConfiguration = configuration.chatIntegration.commands;

    // Check if the command is enabled in that channel
    if (!command.enabled(commandsConfiguration)) {
      return;
    }

    const params: ICommandParameters = {
      channel: channelName,
      userstate: userstate,
      message: message,
      bot: this,
    };

    // Process that comamnd
    command.process(params);
  }

  /**
   * Join the given channel by name and update the configuration
   *
   * @param channelName The channel name to join (e.g. Tandashii, JustDanceRequests, FayeBelle_)
   * @param configuration The configuration of that channel to update the current one with
   */
  public join(channelName: string, configuration: IStreamerConfiguration): void {
    this.updateConfiguration(channelName, configuration);
    this.client.join(channelName).catch((e) => logger.error(e));
  }

  /**
   * Leave the channel by name.
   * Will delete the channel configuration for that channel as well.
   *
   * @param channelName The name of the channel to leave  (e.g. Tandashii, JustDanceRequests, FayeBelle_)
   */
  public part(channelName: string): void {
    delete this.configurations[this.getUnifiedChannelName(channelName)];
    this.client.part(channelName).catch((e) => logger.error(e));
  }

  /**
   * Update the configuration for the channel.
   *
   * @param channelName The name of the channel whos configuration should be updated
   * @param configuration The configuration to replace the current one with
   */
  public updateConfiguration(channelName: string, configuration: IStreamerConfiguration): void {
    this.configurations[this.getUnifiedChannelName(channelName)] = configuration;
  }

  /**
   * Get the configuration of the channel by name.
   *
   * @param channelName The name of the channel to get the configuration from
   *
   * @returns The channel configuration
   */
  private getConfiguration(channelName: string): IStreamerConfiguration {
    return this.configurations[this.getUnifiedChannelName(channelName)];
  }

  /**
   * Unify the channel name.
   * Should be used when dealing with channel names since IRC and Stored channel names might differ.
   * This will provide a identical representation no matter the source of the channel name.
   *
   * @param channelName The channel name to unified
   *
   * @returns The unified channel name
   */
  private getUnifiedChannelName(channelName: string): string {
    return channelName.toLowerCase().replace('#', '');
  }

  /**
   * Send a message to the given channel.
   *
   * @param channelName The name of the channel the message should be sent in
   * @param message The message to sent
   * @param replyTo The person the message is replying to. Undefined if message is not replying to anyone.
   */
  public sendMessage(channelName: string, message: string, replyTo?: tmi.Userstate): void {
    if (!replyTo) {
      this.client.say(channelName, AnnounceService.getChatFiendlyString(message));
    } else {
      this.client.say(channelName, AnnounceService.getChatFiendlyString(`[@${replyTo['display-name']}] ${message}`));
    }
  }

  /**
   * Start the TwitchBot.
   */
  public async start(): Promise<void> {
    logger.info('Starting Twitch Bot...');

    await this.initializeConfigurations();

    await this.createClient();
    this.configureClient();

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
