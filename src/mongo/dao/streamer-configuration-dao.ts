import { ClientSession, FilterQuery, UpdateQuery } from 'mongoose';

import getLogger from '@common/logging';
import { Result, Success, Failure } from '@common/result';

import StreamerConfiguration, {
  StreamerConfigurationDoc,
  IStreamerConfiguration,
} from '@mongo/schema/streamer-configuration';
import StreamerDataDao, { ConfigurationProfilePopulateOptions } from '@mongo/dao/streamer-data-dao';
import ProfileDao from '@mongo/dao/profile-dao';

const logger = getLogger('Streamer Configuration Dao');

export default class StreamerConfigurationDao {
  private static DEFAULT_CONFIGURATION: Omit<IStreamerConfiguration, 'profile'> = {
    version: 'v1.6',
    theme: {
      liveConfig: {
        css: '',
      },
    },
    chatIntegration: {
      enabled: false,
      channelName: '',
      announcements: {
        queue: {
          status: {
            opened: true,
            closed: true,
            cleared: true,
          },
          song: {
            fromChat: true,
            fromExtension: true,
            nextUp: true,
          },
        },
      },
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
        leave: {
          enabled: false,
        },
        toggleQueue: {
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

  /**
   * Get all Streamer Configurations that have ChatIntegration enabled.
   *
   * @returns The result of the operation
   */
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

  /**
   * Get the Streamer Configuration of a specific channel using their channel Id.
   *
   * @param channelId The id of the channel
   *
   * @returns The result of the operation
   */
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

  /**
   * Update Streamer Configuration by channel name
   *
   * @param channelName The users channel name
   * @param updateQuery The update query
   * @param populate The population options
   *
   * @returns The result of the operation
   */
  public static async updateByChannelName(
    channelName: string,
    updateQuery: UpdateQuery<IStreamerConfiguration>,
    populate: ConfigurationProfilePopulateOptions[]
  ): Promise<Result<StreamerConfigurationDoc>> {
    return this.update(
      { 'chatIntegration.channelName': { $regex: channelName, $options: 'i' } },
      updateQuery,
      populate
    );
  }

  /**
   * Update Streamer Configuration by id
   *
   * @param id The configuration id
   * @param updateQuery The update query
   * @param populate The population options
   *
   * @returns The result of the operation
   */
  public static async updateById(
    id: string,
    updateQuery: UpdateQuery<IStreamerConfiguration>,
    populate: ConfigurationProfilePopulateOptions[]
  ): Promise<Result<StreamerConfigurationDoc>> {
    return this.update({ _id: id }, updateQuery, populate);
  }

  /**
   * Update Streamer Configuration using a FilterQuery
   *
   * @param filterQuery The filter query
   * @param updateQuery The update query
   * @param populate The population options
   *
   * @returns The result of the operation
   */
  private static async update(
    filterQuery: FilterQuery<StreamerConfigurationDoc>,
    updateQuery: UpdateQuery<IStreamerConfiguration>,
    populate: ConfigurationProfilePopulateOptions[]
  ): Promise<Result<StreamerConfigurationDoc>> {
    try {
      const configuration = await StreamerConfiguration.findOneAndUpdate(filterQuery, updateQuery, { new: true });

      if (!configuration) {
        throw new Error('Could not update StreamerConfiguration because findOneAndUpdate returned null.');
      }

      const populatedConfiguration = await configuration.populate(populate).execPopulate();
      return Success(populatedConfiguration);
    } catch (e) {
      return Failure('internal', `Could not update Streamer Configuration. ${e}`);
    }
  }

  /**
   * Create a new Streamer Configuration.
   *
   * @returns The result of the operation
   */
  public static async createStreamerConfiguration(session: ClientSession): Promise<Result<StreamerConfigurationDoc>> {
    try {
      const defaultProfileResult = await ProfileDao.createProfile('default', session);
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
      const configuration = await new StreamerConfiguration(configurationData).save({ session });
      return Success(configuration);
    } catch (e) {
      logger.error(e);
      return Failure('internal', 'Could not create Streamer Configuration');
    }
  }
}
