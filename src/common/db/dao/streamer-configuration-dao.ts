import logger from '@common/logging';

import { Result, Success, Failure } from '@common/result';
import StreamerConfiguration, {
  IStreamerConfiguration,
  RawStreamerConfiguration,
} from '@db/schema/streamer-configuration';
import StreamerDataDao from '@db/dao/streamer-data-dao';
import { UpdateQuery } from 'mongoose';

export default class StreamerConfigurationDao {
  private static DEFAULT_CONFIGURATION: RawStreamerConfiguration = {
    version: 'v1.0',
    chatIntegration: {
      enabled: false,
      channelName: '',
    },
    requests: {
      perUser: 1,
      duplicates: false,
    },
  };

  public static async getAllWithChatIntegrationEnabled(): Promise<Result<IStreamerConfiguration[]>> {
    try {
      const streamerConfigurations = await StreamerConfiguration.find({
        'chatIntegration.enabled': true,
      });

      return Success(streamerConfigurations);
    } catch (e) {
      logger.error(e);
      return Failure('internal', 'Could not retrive StreamerData');
    }
  }

  public static async get(channelId: string): Promise<Result<IStreamerConfiguration>> {
    const streamerDataResult = await StreamerDataDao.getOrCreateStreamerData(channelId, ['configuration']);
    if (streamerDataResult.type === 'error') {
      return streamerDataResult;
    }

    const configuration = streamerDataResult.data.configuration;
    if (!configuration) {
      return Failure(
        'internal',
        `Streamer Configuration for channel (${channelId}) was undefined. This should have not been the case.`
      );
    }

    return Success(configuration);
  }

  public static async update(
    id: string,
    updateQuery: UpdateQuery<RawStreamerConfiguration>
  ): Promise<Result<IStreamerConfiguration>> {
    try {
      const configuration = await StreamerConfiguration.findOneAndUpdate({ _id: id }, updateQuery, { new: true });
      return Success(configuration);
    } catch (e) {
      logger.error(e);
      return Failure('internal', 'Could not update Streamer Configuration');
    }
  }

  public static async createStreamerConfiguration(): Promise<Result<IStreamerConfiguration>> {
    try {
      const configuration = await new StreamerConfiguration(this.DEFAULT_CONFIGURATION).save();
      return Success(configuration);
    } catch (e) {
      logger.error(e);
      return Failure('internal', 'Could not create Streamer Configuration');
    }
  }
}
