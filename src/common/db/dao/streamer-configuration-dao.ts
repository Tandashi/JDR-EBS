import logger from '@common/logging';

import { Result, Success, Failure } from '@common/result';
import StreamerConfiguration, {
  StreamerConfigurationDoc,
  IStreamerConfiguration,
} from '@db/schema/streamer-configuration';
import StreamerDataDao from '@db/dao/streamer-data-dao';
import { UpdateQuery } from 'mongoose';
import BanlistDao from './banlist-dao';

export default class StreamerConfigurationDao {
  private static DEFAULT_CONFIGURATION: IStreamerConfiguration = {
    version: 'v1.0',
    chatIntegration: {
      enabled: false,
      channelName: '',
    },
    requests: {
      perUser: 1,
      duplicates: false,
    },
    banlist: {
      active: undefined,
      banlists: [],
    },
  };

  public static async getAllWithChatIntegrationEnabled(): Promise<Result<StreamerConfigurationDoc[]>> {
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

  public static async get(channelId: string): Promise<Result<StreamerConfigurationDoc>> {
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
    updateQuery: UpdateQuery<IStreamerConfiguration>
  ): Promise<Result<StreamerConfigurationDoc>> {
    try {
      const configuration = await StreamerConfiguration.findOneAndUpdate({ _id: id }, updateQuery, { new: true });
      return Success(configuration);
    } catch (e) {
      logger.error(e);
      return Failure('internal', 'Could not update Streamer Configuration');
    }
  }

  public static async createStreamerConfiguration(): Promise<Result<StreamerConfigurationDoc>> {
    try {
      const defaultBanlistResult = await BanlistDao.createBanlist('default');
      if (defaultBanlistResult.type === 'error') {
        return defaultBanlistResult;
      }

      const defaultBanlist = defaultBanlistResult.data;
      const configuration = await new StreamerConfiguration(<IStreamerConfiguration>{
        ...this.DEFAULT_CONFIGURATION,
        banlist: {
          active: defaultBanlist._id,
          banlists: [defaultBanlist._id],
        },
      }).save();
      return Success(configuration);
    } catch (e) {
      logger.error(e);
      return Failure('internal', 'Could not create Streamer Configuration');
    }
  }
}
