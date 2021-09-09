import { UpdateQuery } from 'mongoose';

import getLogger from '@common/logging';
import { Result, Success, Failure } from '@common/result';

import StreamerConfiguration, {
  StreamerConfigurationDoc,
  IStreamerConfiguration,
} from '@db/schema/streamer-configuration';
import StreamerDataDao, { ConfigurationProfilePopulateOptions } from '@db/dao/streamer-data-dao';
import ProfileDao from '@db/dao/profile-dao';

const logger = getLogger('Streamer Configuration Dao');

export default class StreamerConfigurationDao {
  private static DEFAULT_CONFIGURATION: Omit<IStreamerConfiguration, 'profile'> = {
    version: 'v1.2',
    chatIntegration: {
      enabled: false,
      channelName: '',
      commands: {
        songRequest: {
          enabled: true,
        },
        queue: {
          enabled: false,
        },
        queuePosition: {
          enabled: false,
        },
        banlist: {
          enabled: true,
          format: '{TITLE} - {ARTIST}',
        },
      },
    },
    requests: {
      perUser: 1,
      duplicates: false,
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
    const streamerDataResult = await StreamerDataDao.getOrCreateStreamerData(channelId, [
      {
        path: 'configuration',
        populate: [
          {
            path: 'profile.active',
            populate: {
              path: 'banlist',
            },
          },
          {
            path: 'profile.profiles',
            populate: {
              path: 'banlist',
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
    populate: ConfigurationProfilePopulateOptions[]
  ): Promise<Result<StreamerConfigurationDoc>> {
    try {
      const configuration = await StreamerConfiguration.findByIdAndUpdate(id, updateQuery, { new: true });

      if (!configuration) {
        throw new Error('Could not update StreamerConfiguration. findOneAndUpdate returned null.');
      }

      const populatedConfiguration = await configuration.populate(populate).execPopulate();
      return Success(populatedConfiguration);
    } catch (e) {
      return Failure('internal', 'Could not update Streamer Configuration');
    }
  }

  public static async createStreamerConfiguration(): Promise<Result<StreamerConfigurationDoc>> {
    try {
      const defaultProfileResult = await ProfileDao.createProfile('default');
      if (defaultProfileResult.type === 'error') {
        return defaultProfileResult;
      }

      const defaultProfile = defaultProfileResult.data;
      const configurationData: IStreamerConfiguration = {
        ...this.DEFAULT_CONFIGURATION,
        profile: {
          active: defaultProfile._id,
          profiles: [defaultProfile._id],
        },
      };
      const configuration = await new StreamerConfiguration(configurationData).save();
      return Success(configuration);
    } catch (e) {
      logger.error(e);
      return Failure('internal', 'Could not create Streamer Configuration');
    }
  }
}
