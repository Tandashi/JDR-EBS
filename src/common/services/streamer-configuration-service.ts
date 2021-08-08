import express from 'express';

import TwitchBot from '@twitch-bot/index';

import { Result, Success } from '@common/result';
import TwitchAPIService from '@services/twitch-api-service';
import { StreamerConfigurationDoc, IStreamerConfiguration } from '@common/db/schema/streamer-configuration';
import StreamerConfigurationDao from '@common/db/dao/streamer-configuration-dao';

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
    const chatIntegarationEnabled = req.body.chatIntegration?.enabled ?? oldConfiguration.chatIntegration.enabled;
    const requestsPerUser = req.body.requests?.perUser ?? oldConfiguration.requests.perUser;
    const requestsDuplicates = req.body.requests?.duplicates ?? oldConfiguration.requests.duplicates;

    const updatedConfiguration: IStreamerConfiguration = {
      version: oldConfiguration.version,
      chatIntegration: {
        enabled: chatIntegarationEnabled,
        channelName: oldConfiguration.chatIntegration.channelName,
      },
      requests: {
        perUser: requestsPerUser,
        duplicates: requestsDuplicates,
      },
      banlist: oldConfiguration.banlist,
    };

    const updateResult = await StreamerConfigurationDao.update(oldConfiguration._id, updatedConfiguration, [
      {
        path: 'banlist.active',
      },
      {
        path: 'banlist.banlists',
      },
    ]);

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
