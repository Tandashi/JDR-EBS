import express from 'express';

import TwitchBot from '@twitch-bot/index';

import { Failure, Result, Success } from '@common/result';
import TwitchAPIService from '@services/twitch-api-service';
import { IStreamerConfiguration, RawStreamerConfiguration } from '@common/db/schema/streamer-configuration';
import StreamerConfigurationDao from '@common/db/dao/streamer-configuration-dao';

type UpdateErrors = 'invalid-request';

export default class StreamerConfigurationService {
  public static async updateChannelName(
    configurationId: string,
    channelId: string
  ): Promise<Result<IStreamerConfiguration>> {
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
    oldConfiguration: IStreamerConfiguration,
    req: express.Request
  ): Promise<Result<IStreamerConfiguration, UpdateErrors>> {
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

    const updatedConfiguration: RawStreamerConfiguration = {
      version: oldConfiguration.version,
      chatIntegration: {
        enabled: chatIntegarationEnabled || oldConfiguration.chatIntegration.enabled,
        channelName: oldConfiguration.chatIntegration.channelName,
      },
      requests: {
        perUser: requestsPerUser || oldConfiguration.requests.perUser,
        duplicates: requestsDuplicates || oldConfiguration.requests.duplicates,
      },
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
