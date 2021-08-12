import logger from '@common/logging';
import { Result, Success, Failure } from '@common/result';

import Queue, { QueueDoc, IQueueEntry, IQueue } from '@db/schema/queue';

export default class QueueDao {
  public static async createQueue(): Promise<Result<QueueDoc>> {
    try {
      const queueData: IQueue = {
        entries: [],
      };
      const queue = await new Queue(queueData).save();

      return Success(queue);
    } catch (e) {
      logger.error((e as Error).message);
      return Failure('internal', 'Could not create Queue');
    }
  }

  public static async setQueue(queue: QueueDoc, entries: IQueueEntry[]): Promise<Result<QueueDoc>> {
    try {
      const newQueue = await Queue.findByIdAndUpdate(queue._id, { $set: { entries: entries } }, { new: true });
      return Success(newQueue);
    } catch (e) {
      logger.error((e as Error).message);
      return Failure('internal', 'Could not set queue entries');
    }
  }
}
