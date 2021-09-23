import { PopulateOptions } from 'mongoose';

import getLogger from '@common/logging';
import { Result, Success, Failure } from '@common/result';

import SecretService from '@services/secret-service';

import StreamerData, { StreamerDataDoc, IStreamerData } from '@mongo/schema/streamer-data';
import QueueDao from '@mongo/dao/queue-dao';
import StreamerConfigurationDao from '@mongo/dao/streamer-configuration-dao';

type QueuePopulateOption = {
  path: 'queue';
} & PopulateOptions;

type ConfigurationProfileActivePopulateOption = {
  path: 'profile.active';
  populate?: ConfigurationProfileBanlistPopulateOption;
} & PopulateOptions;

type ConfigurationProfileBanlistPopulateOption = {
  path: 'banlist';
} & PopulateOptions;

type ConfigurationProfileProfilesPopulateOption = {
  path: 'profile.profiles';
  populate?: ConfigurationProfileBanlistPopulateOption;
} & PopulateOptions;

export type ConfigurationProfilePopulateOptions =
  | ConfigurationProfileActivePopulateOption
  | ConfigurationProfileProfilesPopulateOption;

type ConfigurationPopulateOption = {
  path: 'configuration';
  populate?: ConfigurationProfilePopulateOptions[];
} & PopulateOptions;

type PopulationParams = QueuePopulateOption | ConfigurationPopulateOption;

type GetBySecretErrors = 'no-such-entity';

const logger = getLogger('Streamer Data Dao');

export default class StreamerDataDao {
  /**
   * Get Streamer Data by Secret.
   *
   * @param secret The secret to get the StreamerData by
   *
   * @returns The result of the operation
   */
  public static async getBySecret(secret: string): Promise<Result<StreamerDataDoc, GetBySecretErrors>> {
    try {
      const streamerData = await StreamerData.findOne({ secret: secret });

      if (!streamerData) {
        return Failure<GetBySecretErrors>('no-such-entity', 'Invalid secret');
      }

      return Success(streamerData);
    } catch (e) {
      logger.error(e);

      return Failure('internal', 'Could not get Streamer Data with secret');
    }
  }

  /**
   * Update the Secret for a given channel by it's Id
   *
   * @param channelId The id of the channel to update the secret for
   * @param newSecret The new secret
   *
   * @returns The result of the operation
   */
  public static async updateSecret(channelId: string, newSecret: string): Promise<Result<StreamerDataDoc>> {
    try {
      const streamerData = await StreamerData.findOneAndUpdate(
        { channelId: channelId },
        { $set: { secret: newSecret } },
        { new: true }
      );

      if (!streamerData) {
        throw new Error('Could not update StreamerData secret. findOneAndUpdate returned null.');
      }

      return Success(streamerData);
    } catch (e) {
      logger.error(e);

      return Failure('internal', 'Could not update StreamerData secret');
    }
  }

  /**
   * Get the Streamer Data for a given channel or
   * create it if the Streamer Data for that channel doesn't exist yet.
   *
   * @param channelId The id of the channel to get / create the Streamer Data for
   * @param populate The population options
   *
   * @returns The result of the operation
   */
  public static async getOrCreateStreamerData(
    channelId: string,
    populate?: PopulationParams[]
  ): Promise<Result<StreamerDataDoc>> {
    try {
      const streamerData = await StreamerData.findOne({
        channelId: channelId,
      }).populate(populate);

      if (!streamerData) {
        return await this.createStreamerData(channelId, populate);
      }

      return Success(streamerData);
    } catch (e) {
      logger.error(e);

      return Failure('internal', 'Could not retrive StreamerData');
    }
  }

  /**
   * Create the StreamerData for the given channel by it's Id.
   *
   * @param channelId The id of the channel the StreamerData should be created for
   * @param populate The population options
   *
   * @returns The result of the operation
   */
  private static async createStreamerData(
    channelId: string,
    populate?: PopulationParams[]
  ): Promise<Result<StreamerDataDoc>> {
    const queueResult = await QueueDao.createQueue();
    if (queueResult.type === 'error') {
      return queueResult;
    }

    const configurationResult = await StreamerConfigurationDao.createStreamerConfiguration();
    if (configurationResult.type === 'error') {
      return configurationResult;
    }

    try {
      const streamerDataData: IStreamerData = {
        channelId: channelId,
        secret: SecretService.generateSecret(),
        queue: queueResult.data._id,
        configuration: configurationResult.data._id,
      };

      const streamerData = await new StreamerData(streamerDataData).save();

      const populatedData = await streamerData.populate(populate ?? []).execPopulate();

      return Success(populatedData);
    } catch (e) {
      logger.error(e);

      return Failure('internal', 'Could not create Streamer Data');
    }
  }
}
