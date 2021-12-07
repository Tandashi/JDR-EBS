import mongoose, { ClientSession, PopulateOptions } from 'mongoose';

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
type GetByChannelNameErrors = 'no-such-entity';

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
   * Get Streamer Data by Channel Name.
   *
   * @param channelName The channel name of the streamer data
   *
   * @returns The result of the operation
   */
  public static async getByChannelName(
    channelName: string,
    populate?: PopulationParams[]
  ): Promise<Result<StreamerDataDoc, GetByChannelNameErrors>> {
    try {
      const streamerDatas = await StreamerData.find().populate('configuration').populate(populate).exec();
      const streamerData = streamerDatas.filter(
        (data) => data.configuration.chatIntegration.channelName.toLowerCase() === channelName.toLowerCase()
      );

      if (!streamerData.length) {
        return Failure<GetByChannelNameErrors>('no-such-entity', `Invalid channel name '${channelName}'`);
      }

      return Success(streamerData[0]);
    } catch (e) {
      logger.error(e);

      return Failure('internal', 'Could not get Streamer Data by channel name');
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
    const session = await mongoose.connection.startSession();
    session.startTransaction({ writeConcern: { w: 'majority' } });

    try {
      let result: Result<StreamerDataDoc> | undefined = undefined;
      const streamerData = await StreamerData.findOne(
        {
          channelId: channelId,
        },
        {},
        { session }
      ).populate(populate);

      if (!streamerData) {
        logger.info('Streamer Data was not found creating.');
        result = await this.createStreamerData(channelId, session, populate);
      } else {
        result = Success(streamerData);
      }

      await session.commitTransaction();

      if (!result) {
        throw Error('Result should have been set');
      }

      return result;
    } catch (e) {
      logger.error(e);

      return Failure('internal', 'Could not retrive StreamerData');
    } finally {
      session.endSession();
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
    session: ClientSession,
    populate?: PopulationParams[]
  ): Promise<Result<StreamerDataDoc>> {
    const queueResult = await QueueDao.createQueue(session);
    if (queueResult.type === 'error') {
      return queueResult;
    }

    const configurationResult = await StreamerConfigurationDao.createStreamerConfiguration(session);
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

      const streamerData = await new StreamerData(streamerDataData).save({ session });

      const populatedData = await streamerData.populate(populate ?? []).execPopulate();

      return Success(populatedData);
    } catch (e) {
      logger.error(e);

      return Failure('internal', 'Could not create Streamer Data');
    }
  }
}
