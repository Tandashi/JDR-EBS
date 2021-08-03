import logger from '@common/logging';

import Queue, { IQueue, IQueueEntry } from '@db/schema/queue';
import { DBResult, Success, Failure } from '@db/dao/dao';

export default class QueueDao {
  public static async createQueue(): Promise<DBResult<IQueue>> {
    try {
      const queue = await new Queue({
        entries: [],
      }).save();

      return Success(queue);
    } catch (e) {
      logger.error(e);
      return Failure('internal', 'Could not create Queue');
    }
  }

  public static async addToQueue(queue: IQueue, entry: IQueueEntry): Promise<DBResult<IQueue>> {
    try {
      const newQueue = await Queue.findByIdAndUpdate(queue._id, { $push: { entries: entry } }, { new: true });
      return Success(newQueue);
    } catch (e) {
      logger.error(e);
      return Failure('internal', 'Could not add entry to the queue');
    }
  }
}
