import logger from '@common/logging';

import StreamerData, { IStreamerData } from '@db/schema/streamer-data';
import { DBResult, Success, Failure } from '@db/dao/dao';
import QueueDao from '@db/dao/queue-dao';

type PopulationParameters = 'queue';

export default class StreamerDataDao {
  public static async getOrCreateStreamerData(
    channelId: string,
    populate?: PopulationParameters[]
  ): Promise<DBResult<IStreamerData>> {
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

  public static async createStreamerData(
    channelId: string,
    populate?: PopulationParameters[]
  ): Promise<DBResult<IStreamerData>> {
    const queueResult = await QueueDao.createQueue();

    if (queueResult.type === 'error') {
      return queueResult;
    }

    try {
      const streamerData = await new StreamerData({
        channelId: channelId,
        queue: queueResult.data._id,
      }).save();

      const populatedData = await streamerData
        .populate(
          populate.map((v) => {
            return { path: v };
          })
        )
        .execPopulate();

      return Success(populatedData);
    } catch (e) {
      logger.error(e);

      return Failure('internal', 'Could not create Streamer Data');
    }
  }
}
