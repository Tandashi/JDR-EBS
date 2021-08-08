import { UpdateQuery } from 'mongoose';

import logger from '@common/logging';

import { Result, Success, Failure } from '@common/result';
import StreamerConfiguration, {
  StreamerConfigurationDoc,
  IStreamerConfiguration,
} from '@db/schema/streamer-configuration';
import StreamerDataDao, { ConfigurationBanlistPopulateOptions } from '@db/dao/streamer-data-dao';
import BanlistDao from '@db/dao/banlist-dao';

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
    song: {
      unlimited: false,
    },
  };

  public static async getAllWithChatIntegrationEnabled(): Promise<Result<StreamerConfigurationDoc[]>> {
    try {
      const streamerConfigurations = await StreamerConfiguration.find({
        'chatIntegration.enabled': true,
      });

      return Success(streamerConfigurations);
    } catch (e) {
      logger.error((e as Error).message);
      return Failure('internal', 'Could not retrive StreamerData');
    }
  }

  public static async get(channelId: string): Promise<Result<StreamerConfigurationDoc>> {
    const streamerDataResult = await StreamerDataDao.getOrCreateStreamerData(channelId, [
      {
        path: 'configuration',
        populate: [
          {
            path: 'banlist.active',
            populate: {
              path: 'entries',
            },
          },
          {
            path: 'banlist.banlists',
            populate: {
              path: 'entries',
            },
          },
        ],
      },
    ]);

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
    updateQuery: UpdateQuery<IStreamerConfiguration>,
    populate: ConfigurationBanlistPopulateOptions[]
  ): Promise<Result<StreamerConfigurationDoc>> {
    try {
      const configuration = await StreamerConfiguration.findOneAndUpdate({ _id: id }, updateQuery, { new: true });

      const populatedConfiguration = await configuration.populate(populate).execPopulate();
      return Success(populatedConfiguration);
    } catch (e) {
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
      logger.error((e as Error).message);
      return Failure('internal', 'Could not create Streamer Configuration');
    }
  }
}
