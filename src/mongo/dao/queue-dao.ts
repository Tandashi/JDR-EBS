import getLogger from '@common/logging';
import { Result, Success, Failure } from '@common/result';

import Queue, { QueueDoc, IQueueEntry, IQueue } from '@mongo/schema/queue';

const logger = getLogger('Queue Dao');

export default class QueueDao {
  public static async createQueue(): Promise<Result<QueueDoc>> {
    try {
      const queueData: IQueue = {
        enabled: false,
        entries: [],
      };
      const queue = await new Queue(queueData).save();

      return Success(queue);
    } catch (e) {
      logger.error(e);
      return Failure('internal', 'Could not create Queue');
    }
  }

  public static async setQueue(queue: QueueDoc, enabled: boolean, entries: IQueueEntry[]): Promise<Result<QueueDoc>> {
    try {
      const newQueue = await Queue.findByIdAndUpdate(
        queue._id,
        { $set: { enabled: enabled, entries: entries } },
        { new: true }
      );

      if (!newQueue) {
        throw new Error('Could not setQueue. findOneAndUpdate returned null.');
      }

      return Success(newQueue);
    } catch (e) {
      logger.error(e);
      return Failure('internal', 'Could not set queue entries');
    }
  }
}
