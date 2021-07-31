import logger from '@base/logging';
import Queue, { IQueue, IQueueEntry, IQueueEntrySongData } from '@base/models/schema/queue';

import MaximumRequestsExceededError from '@base/errors/maximum-requests-exceeded-error';
import SongAlreadyInQueueError from '@base/errors/song-already-in-queue-error';

export default class QueueService {
  public static async createQueue(channelId: string): Promise<IQueue> {
    return new Queue({
      channelId: channelId,
      entries: [],
    }).save();
  }

  public static async getQueue(channelId: string): Promise<IQueue> {
    return new Promise((resolve, reject) => {
      Queue.findOne({ channelId: channelId })
        .then((queue) => {
          if (queue === null) {
            // Queue non-existent create
            return QueueService.createQueue(channelId)
              .then((queue) => {
                resolve(queue);
              })
              .catch(reject);
          }
          // Queue existing just resolve
          resolve(queue);
        })
        .catch(reject);
    });
  }

  public static async addToQueue(channelId: string, songdata: IQueueEntrySongData, userId: string): Promise<IQueue> {
    return new Promise((resolve, reject) => {
      this.getQueue(channelId)
        .then((queue) => {
          if (queue.entries.some((v) => v.userId === userId)) {
            return reject(new MaximumRequestsExceededError('Too many requests already in queue.'));
          }

          if (queue.entries.some((v) => v.song.id === songdata.id && songdata.fromChat !== true)) {
            return reject(new SongAlreadyInQueueError('Song is already queued.'));
          }

          const entry: IQueueEntry = {
            userId: userId,
            song: songdata,
          };

          Queue.findByIdAndUpdate(queue._id, { $push: { entries: entry } }, { new: true })
            .exec()
            .then(resolve)
            .catch((err: Error) => {
              logger.error(err);
              reject(err);
            });
        })
        .catch((err: Error) => {
          logger.error(err);
          reject(err);
        });
    });
  }
}
