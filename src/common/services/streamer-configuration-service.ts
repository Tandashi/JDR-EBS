import express from 'express';

import TwitchBot from '@twitch-bot/index';

import { Result, Success } from '@common/result';

import TwitchAPIService from '@services/twitch-api-service';

import StreamerConfigurationDao from '@mongo/dao/streamer-configuration-dao';
import {
  StreamerConfigurationDoc,
  IStreamerConfiguration,
  IChatIntegrationConfiguration,
  IChatIntegrationCommandConfiguration,
  ISongRequestCommandConfiguration,
  IQueueCommandConfiguration,
  IBanlistCommandConfiguration,
  IRequestConfiguration,
} from '@mongo/schema/streamer-configuration';

export default class StreamerConfigurationService {
  public static async updateChannelName(
    configurationId: string,
    channelId: string
  ): Promise<Result<StreamerConfigurationDoc>> {
    const channelInformationResult = await TwitchAPIService.getInstance().getChannelInfo(channelId);

    if (channelInformationResult.type === 'error') {
      return channelInformationResult;
    }

    const channelName = channelInformationResult.data.displayName;
    const updateResult = await StreamerConfigurationDao.update(
      configurationId,
      {
        $set: { 'chatIntegration.channelName': channelName },
      },
      []
    );

    if (updateResult.type === 'error') {
      return updateResult;
    }

    return Success(updateResult.data);
  }

  public static async update(
    oldConfiguration: StreamerConfigurationDoc,
    req: express.Request
  ): Promise<Result<StreamerConfigurationDoc>> {
    const configuration: Partial<IStreamerConfiguration> = req.body;

    const chatIntegration: Partial<IChatIntegrationConfiguration> | undefined = configuration?.chatIntegration;
    const chatIntegrationEnabled = chatIntegration?.enabled ?? oldConfiguration.chatIntegration.enabled;

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
      chatIntegration: {
        enabled: chatIntegrationEnabled,
        channelName: oldConfiguration.chatIntegration.channelName,
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

    const updateResult = await StreamerConfigurationDao.update(oldConfiguration._id, updatedConfiguration, [
      {
        path: 'profile.active',
      },
      {
        path: 'profile.profiles',
      },
    ]);

    if (updateResult.type === 'error') {
      return updateResult;
    }

    const twitchBot = TwitchBot.getInstance();
    const updateResultData = updateResult.data;

    // If we enabled chat integration through the update
    if (!oldConfiguration.chatIntegration.enabled && chatIntegrationEnabled) {
      twitchBot.join(oldConfiguration.chatIntegration.channelName, updateResultData);
    }
    // If we disabled chat integration through the update
    else if (oldConfiguration.chatIntegration.enabled && !chatIntegrationEnabled) {
      twitchBot.part(oldConfiguration.chatIntegration.channelName);
    }
    // If we didnt change the status but we might have changed something else about the configuration
    // we need to update it for the bot as well so it doesnt use outdated data
    else if (chatIntegrationEnabled) {
      twitchBot.updateConfiguration(oldConfiguration.chatIntegration.channelName, updateResultData);
    }

    return Success(updateResultData);
  }
}
