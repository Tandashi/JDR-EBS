import logger from '@common/logging';

import { Result, Success, Failure } from '@common/result';
import Queue, { QueueDoc, IQueueEntry, IQueue } from '@db/schema/queue';

export default class QueueDao {
  public static async createQueue(): Promise<Result<QueueDoc>> {
    try {
      const queue = await new Queue(<IQueue>{
        entries: [],
      }).save();

      return Success(queue);
    } catch (e) {
      logger.error((e as Error).message);
      return Failure('internal', 'Could not create Queue');
    }
  }

  public static async addToQueue(queue: QueueDoc, entry: IQueueEntry): Promise<Result<QueueDoc>> {
    try {
      const newQueue = await Queue.findByIdAndUpdate(queue._id, { $push: { entries: entry } }, { new: true });
      return Success(newQueue);
    } catch (e) {
      logger.error((e as Error).message);
      return Failure('internal', 'Could not add entry to the queue');
    }
  }
}
