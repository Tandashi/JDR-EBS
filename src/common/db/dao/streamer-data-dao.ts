import { PopulateOptions } from 'mongoose';

import logger from '@common/logging';

import { Result, Success, Failure } from '@common/result';
import StreamerData, { StreamerDataDoc, IStreamerData } from '@db/schema/streamer-data';
import QueueDao from '@db/dao/queue-dao';
import StreamerConfigurationDao from '@db/dao/streamer-configuration-dao';

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

export default class StreamerDataDao {
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
      logger.error((e as Error).message);

      return Failure('internal', 'Could not retrive StreamerData');
    }
  }

  public static async createStreamerData(
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
      const streamerData = await new StreamerData(<IStreamerData>{
        channelId: channelId,
        queue: queueResult.data._id,
        configuration: configurationResult.data._id,
      }).save();

      const populatedData = await streamerData.populate(populate).execPopulate();

      return Success(populatedData);
    } catch (e) {
      logger.error((e as Error).message);

      return Failure('internal', 'Could not create Streamer Data');
    }
  }
}
