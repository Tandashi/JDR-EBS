import getLogger from '@common/logging';
import { Result, Success, Failure } from '@common/result';

import Queue, { QueueDoc, IQueueEntry, IQueue } from '@mongo/schema/queue';
import { ClientSession } from 'mongoose';

const logger = getLogger('Queue Dao');

export default class QueueDao {
  /**
   * Create a Queue.
   *
   * @returns The result of the operation
   */
  public static async createQueue(session: ClientSession): Promise<Result<QueueDoc>> {
    try {
      const queueData: IQueue = {
        enabled: false,
        entries: [],
      };
      const queue = await new Queue(queueData).save({ session });

      return Success(queue);
    } catch (e) {
      logger.error(e);
      return Failure('internal', 'Could not create Queue');
    }
  }

  /**
   * Set a values of the given Queue.
   *
   * @param queue The queue that should be updated
   * @param enabled Wether the queue is enabled or not
   * @param entries The entries in the Queue
   *
   * @returns The result of the operation
   */
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
