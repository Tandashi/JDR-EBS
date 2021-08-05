import express from 'express';

import TwitchBot from '@twitch-bot/index';

import { Failure, Result, Success } from '@common/result';
import TwitchAPIService from '@services/twitch-api-service';
import { StreamerConfigurationDoc, IStreamerConfiguration } from '@common/db/schema/streamer-configuration';
import StreamerConfigurationDao from '@common/db/dao/streamer-configuration-dao';

type UpdateErrors = 'invalid-request';

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
    const updateResult = await StreamerConfigurationDao.update(configurationId, {
      $set: { 'chatIntegration.channelName': channelName },
    });

    if (updateResult.type === 'error') {
      return updateResult;
    }

    return Success(updateResult.data);
  }

  public static async update(
    oldConfiguration: StreamerConfigurationDoc,
    req: express.Request
  ): Promise<Result<StreamerConfigurationDoc, UpdateErrors>> {
    const chatIntegarationEnabled = req.body.chatIntegration?.enabled;
    if (chatIntegarationEnabled && typeof chatIntegarationEnabled !== 'boolean') {
      return Failure<UpdateErrors>(
        'invalid-request',
        "Invalid request. 'chatIntegration.enabled' should be of type boolean."
      );
    }

    const requestsPerUser = req.body.requests?.perUser;
    if (requestsPerUser && typeof requestsPerUser !== 'number') {
      return Failure<UpdateErrors>('invalid-request', "Invalid request. 'requests.perUser' should be of type number.");
    }

    const requestsDuplicates = req.body.requests?.duplicates;
    if (requestsDuplicates && typeof requestsDuplicates !== 'boolean') {
      return Failure<UpdateErrors>(
        'invalid-request',
        "Invalid request. 'requests.duplicates' should be of type boolean."
      );
    }

    const updatedConfiguration: IStreamerConfiguration = {
      version: oldConfiguration.version,
      chatIntegration: {
        enabled: chatIntegarationEnabled || oldConfiguration.chatIntegration.enabled,
        channelName: oldConfiguration.chatIntegration.channelName,
      },
      requests: {
        perUser: requestsPerUser || oldConfiguration.requests.perUser,
        duplicates: requestsDuplicates || oldConfiguration.requests.duplicates,
      },
      /* TODO: add bandlist patch endpoint
        Should update ids + name of list should be a param
        Make sure banlist is owned by user
        and user is broadcaster role */
      banlist: oldConfiguration.banlist,
    };

    const updateResult = await StreamerConfigurationDao.update(oldConfiguration._id, updatedConfiguration);
    if (updateResult.type === 'error') {
      return updateResult;
    }

    // If we enabled chat integration through the update
    if (!oldConfiguration.chatIntegration.enabled && chatIntegarationEnabled) {
      TwitchBot.getInstance().join(oldConfiguration.chatIntegration.channelName);
    }

    // If we disabled chat integration through the update
    if (oldConfiguration.chatIntegration.enabled && !chatIntegarationEnabled) {
      TwitchBot.getInstance().part(oldConfiguration.chatIntegration.channelName);
    }

    return Success(updateResult.data);
  }
}
