import express from 'express';

import TwitchBot from '@twitch-bot/index';

import getLogger from '@common/logging';
import { Result, Success, FailureResult } from '@common/result';

import TwitchAPIService from '@services/twitch-api-service';

import StreamerConfigurationDao from '@mongo/dao/streamer-configuration-dao';
import type {
  StreamerConfigurationDoc,
  IStreamerConfiguration,
  IChatIntegrationConfiguration,
  IChatIntegrationCommandConfiguration,
  ISongRequestCommandConfiguration,
  IQueueCommandConfiguration,
  IBanlistCommandConfiguration,
  IRequestConfiguration,
  IChatIntegrationAnnouncementsConfiguration,
  IChatIntegrationAnnouncementsQueueConfiguration,
  IChatIntegrationAnnouncementsQueueStatusConfiguration,
  IChatIntegrationAnnouncementsQueueSongConfiguration,
  IThemeConfiguration,
  IThemeLiveConfigConfiguration,
  ILeaveCommandConfiguration,
  IToggleQueueCommandConfiguration,
} from '@mongo/schema/streamer-configuration';

const logger = getLogger('StreamerConfiguration Service');

export default class StreamerConfigurationService {
  /**
   * Update the channel name for the Chat Integration.
   *
   * @see {@link IChatIntegrationConfiguration.channelName ChatIntegration Configuration}
   *
   * @param configurationId The configuration Id for which the channel name should be updated
   * @param channelId The Id of the channel of which the channel name should be used to update
   *
   * @returns The updated {@link StreamerConfigurationDoc StreamerConfiguration} if successful else a {@link FailureResult Failure Result}
   */
  public static async updateChannelName(
    configurationId: string,
    channelId: string
  ): Promise<Result<StreamerConfigurationDoc>> {
    const channelInformationResult = await TwitchAPIService.getInstance().getChannelInfo(channelId);
    if (channelInformationResult.type === 'error') {
      logger.debug(
        `Getting Channel Information failed in updateChannelName: ${JSON.stringify(channelInformationResult)}`
      );
      return channelInformationResult;
    }

    const channelName = channelInformationResult.data.displayName;
    const updateResult = await StreamerConfigurationDao.updateById(
      configurationId,
      {
        $set: { 'chatIntegration.channelName': channelName },
      },
      []
    );

    if (updateResult.type === 'error') {
      logger.debug(`Updating StreamerConfiguration failed in updateChannelName: ${JSON.stringify(updateResult)}`);
      return updateResult;
    }

    return Success(updateResult.data);
  }

  /**
   * Update the {@link IStreamerConfiguration StreamerConfiguration} using the given {@link express.Request Request}.
   *
   * @param oldConfiguration The old configuration
   * @param req The {@link express.Request Request} to use to update the configuration with
   *
   * @returns The updated {@link StreamerConfigurationDoc StreamerConfiguration} if successful else a {@link FailureResult Failure Result}
   */
  public static async update(
    oldConfiguration: StreamerConfigurationDoc,
    req: express.Request
  ): Promise<Result<StreamerConfigurationDoc>> {
    const configuration: Partial<IStreamerConfiguration> = req.body;

    const theme: Partial<IThemeConfiguration> | undefined = configuration?.theme;
    const themeLiveConfig: Partial<IThemeLiveConfigConfiguration> | undefined = theme?.liveConfig;
    const themeLiveConfigCss = themeLiveConfig?.css ?? oldConfiguration.theme.liveConfig.css;

    const chatIntegration: Partial<IChatIntegrationConfiguration> | undefined = configuration?.chatIntegration;
    const chatIntegrationEnabled = chatIntegration?.enabled ?? oldConfiguration.chatIntegration.enabled;

    const chatIntegrationAnnouncements: Partial<IChatIntegrationAnnouncementsConfiguration> | undefined =
      chatIntegration?.announcements;
    const chatIntegrationAnnouncementsQueue: Partial<IChatIntegrationAnnouncementsQueueConfiguration> | undefined =
      chatIntegrationAnnouncements?.queue;
    const chatIntegrationAnnouncementsQueueStatus:
      | Partial<IChatIntegrationAnnouncementsQueueStatusConfiguration>
      | undefined = chatIntegrationAnnouncementsQueue?.status;
    const chatIntegrationAnnouncementsQueueStatusOpened =
      chatIntegrationAnnouncementsQueueStatus?.opened ??
      oldConfiguration.chatIntegration.announcements.queue.status.opened;
    const chatIntegrationAnnouncementsQueueStatusClosed =
      chatIntegrationAnnouncementsQueueStatus?.closed ??
      oldConfiguration.chatIntegration.announcements.queue.status.closed;
    const chatIntegrationAnnouncementsQueueStatusCleared =
      chatIntegrationAnnouncementsQueueStatus?.cleared ??
      oldConfiguration.chatIntegration.announcements.queue.status.cleared;
    const chatIntegrationAnnouncementsQueueSong:
      | Partial<IChatIntegrationAnnouncementsQueueSongConfiguration>
      | undefined = chatIntegrationAnnouncementsQueue?.song;
    const chatIntegrationAnnouncementsQueueSongFromChat =
      chatIntegrationAnnouncementsQueueSong?.fromChat ??
      oldConfiguration.chatIntegration.announcements.queue.song.fromChat;
    const chatIntegrationAnnouncementsQueueSongFromExtension =
      chatIntegrationAnnouncementsQueueSong?.fromExtension ??
      oldConfiguration.chatIntegration.announcements.queue.song.fromExtension;
    const chatIntegrationAnnouncementsQueueSongNextUp =
      chatIntegrationAnnouncementsQueueSong?.nextUp ?? oldConfiguration.chatIntegration.announcements.queue.song.nextUp;

    const chatIntegrationCommands: Partial<IChatIntegrationCommandConfiguration> | undefined =
      chatIntegration?.commands;

    const chatIntegrationCommandsSongRequest: Partial<ISongRequestCommandConfiguration> | undefined =
      chatIntegrationCommands?.songRequest;
    const chatIntegrationCommandsSongRequestEnabled =
      chatIntegrationCommandsSongRequest?.enabled ?? oldConfiguration.chatIntegration.commands.songRequest.enabled;

    const chatIntegrationCommandsQueue: Partial<IQueueCommandConfiguration> | undefined =
      chatIntegrationCommands?.queue;
    const chatIntegrationCommandsQueueEnabled =
      chatIntegrationCommandsQueue?.enabled ?? oldConfiguration.chatIntegration.commands.queue.enabled;

    const chatIntegrationCommandsQueuePosition: Partial<IQueueCommandConfiguration> | undefined =
      chatIntegrationCommands?.queuePosition;
    const chatIntegrationCommandsQueuePositionEnabled =
      chatIntegrationCommandsQueuePosition?.enabled ?? oldConfiguration.chatIntegration.commands.queuePosition.enabled;

    const chatIntegrationCommandsLeave: Partial<ILeaveCommandConfiguration> | undefined =
      chatIntegrationCommands?.leave;
    const chatIntegrationCommandsLeaveEnabled =
      chatIntegrationCommandsLeave?.enabled ?? oldConfiguration.chatIntegration.commands.leave.enabled;

    const chatIntegrationCommandsToggleQueue: Partial<IToggleQueueCommandConfiguration> | undefined =
      chatIntegrationCommands?.toggleQueue;
    const chatIntegrationCommandsToggleQueueEnabled =
      chatIntegrationCommandsToggleQueue?.enabled ?? oldConfiguration.chatIntegration.commands.toggleQueue.enabled;

    const chatIntegrationCommandsBanlist: Partial<IBanlistCommandConfiguration> | undefined =
      chatIntegrationCommands?.banlist;
    const chatIntegrationCommandsBanlistEnabled =
      chatIntegrationCommandsBanlist?.enabled ?? oldConfiguration.chatIntegration.commands.banlist.enabled;
    const chatIntegrationCommandsBanlistFormat =
      chatIntegrationCommandsBanlist?.format ?? oldConfiguration.chatIntegration.commands.banlist.format;

    const requests: Partial<IRequestConfiguration> | undefined = configuration?.requests;
    const requestsPerUser = requests?.perUser ?? oldConfiguration.requests.perUser;
    const requestsDuplicates = requests?.duplicates ?? oldConfiguration.requests.duplicates;

    const updatedConfiguration: IStreamerConfiguration = {
      version: oldConfiguration.version,
      theme: {
        liveConfig: {
          css: themeLiveConfigCss,
        },
      },
      chatIntegration: {
        enabled: chatIntegrationEnabled,
        channelName: oldConfiguration.chatIntegration.channelName,
        announcements: {
          queue: {
            status: {
              opened: chatIntegrationAnnouncementsQueueStatusOpened,
              closed: chatIntegrationAnnouncementsQueueStatusClosed,
              cleared: chatIntegrationAnnouncementsQueueStatusCleared,
            },
            song: {
              fromChat: chatIntegrationAnnouncementsQueueSongFromChat,
              fromExtension: chatIntegrationAnnouncementsQueueSongFromExtension,
              nextUp: chatIntegrationAnnouncementsQueueSongNextUp,
            },
          },
        },
        commands: {
          songRequest: {
            enabled: chatIntegrationCommandsSongRequestEnabled,
          },
          queue: {
            enabled: chatIntegrationCommandsQueueEnabled,
          },
          queuePosition: {
            enabled: chatIntegrationCommandsQueuePositionEnabled,
          },
          leave: {
            enabled: chatIntegrationCommandsLeaveEnabled,
          },
          toggleQueue: {
            enabled: chatIntegrationCommandsToggleQueueEnabled,
          },
          banlist: {
            enabled: chatIntegrationCommandsBanlistEnabled,
            format: chatIntegrationCommandsBanlistFormat,
          },
        },
      },
      requests: {
        perUser: requestsPerUser,
        duplicates: requestsDuplicates,
      },
      profile: oldConfiguration.profile,
    };

    const updateResult = await StreamerConfigurationDao.updateById(oldConfiguration._id, updatedConfiguration, [
      {
        path: 'profile.active',
      },
      {
        path: 'profile.profiles',
      },
    ]);

    if (updateResult.type === 'error') {
      logger.debug(`Updating StreamerConfiguration failed in update: ${JSON.stringify(updateResult)}`);
      return updateResult;
    }

    const twitchBot = TwitchBot.getInstance();
    const updateResultData = updateResult.data;

    // If we enabled chat integration through the update
    if (!oldConfiguration.chatIntegration.enabled && chatIntegrationEnabled) {
      logger.debug(
        `Letting TwitchBot join channel because chatIntegration enabled changed: ${JSON.stringify({
          old: oldConfiguration.chatIntegration.enabled,
          new: chatIntegrationEnabled,
        })}`
      );
      twitchBot.join(oldConfiguration.chatIntegration.channelName, updateResultData);
    }
    // If we disabled chat integration through the update
    else if (oldConfiguration.chatIntegration.enabled && !chatIntegrationEnabled) {
      logger.debug(
        `Letting TwitchBot leave channel because chatIntegration enabled changed: ${JSON.stringify({
          old: oldConfiguration.chatIntegration.enabled,
          new: chatIntegrationEnabled,
        })}`
      );
      twitchBot.part(oldConfiguration.chatIntegration.channelName);
    }
    // If we didnt change the status but we might have changed something else about the configuration
    // we need to update it for the bot as well so it doesnt use outdated data
    else if (chatIntegrationEnabled) {
      logger.debug(`Updating TwitchBot configuration`);
      twitchBot.updateConfiguration(oldConfiguration.chatIntegration.channelName, updateResultData);
    }

    return Success(updateResultData);
  }
}
