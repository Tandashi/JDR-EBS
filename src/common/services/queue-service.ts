import getLogger from '@common/logging';
import { Result, Success, Failure, FailureResult } from '@common/result';

import { QueueDoc, IQueueEntry } from '@mongo/schema/queue';
import StreamerDataDao from '@mongo/dao/streamer-data-dao';
import QueueDao from '@mongo/dao/queue-dao';
import StreamerConfigurationDao from '@mongo/dao/streamer-configuration-dao';
import AnnounceService from '@services/announce-service';
import QueueUpdatedEmitEvent from '@socket-io/events/v1/emit/queue/updated';
import SocketIOServer from '@socket-io/index';
import NextUpClearedEmitEvent from '@socket-io/events/v1/emit/next-up/clear';

const logger = getLogger('Queue Service');

type AddToQueueErrors = 'maximum-requests-exceeded' | 'song-already-queued' | 'song-is-banned' | 'queue-is-closed';

export default class QueueService {
  /**
   * Get the {@link QueueDoc Queue} of a specific channel by it's Id.
   *
   * @param channelId The id of the channel to get the {@link QueueDoc Queue} from
   *
   * @returns The {@link QueueDoc Queue} if successful else a {@link FailureResult Failure Result}
   */
  public static async getQueue(channelId: string): Promise<Result<QueueDoc>> {
    logger.debug(`Getting Queue for channel '${channelId}'`);

    const streamDataResult = await StreamerDataDao.getOrCreateStreamerData(channelId, [{ path: 'queue' }]);
    if (streamDataResult.type === 'error') {
      logger.debug(`Getting StreamerData failed in getQueue: ${JSON.stringify(streamDataResult)}`);
      return streamDataResult;
    }

    return Success(streamDataResult.data.queue);
  }

  /**
   * Set the {@link QueueDoc Queue} status of a specific channel by it's Id.
   *
   * @param channelId The id of the channel to set the {@link QueueDoc Queue} status for
   * @param enabled If the {@link QueueDoc Queue} is open or not
   *
   * @returns The updated {@link QueueDoc Queue} if successful else a {@link FailureResult Failure Result}
   */
  public static async setQueueStatus(channelId: string, enabled: boolean): Promise<Result<QueueDoc>> {
    const queueResult = await this.getQueue(channelId);
    if (queueResult.type === 'error') {
      logger.debug(`Getting Queue for channel '${channelId}' failed in setQueueStatus: ${JSON.stringify(queueResult)}`);
      return queueResult;
    }

    const queue = queueResult.data;
    const queueSetResult = await QueueDao.setQueue(queue, enabled, queue.entries);
    if (queueSetResult.type === 'error') {
      logger.debug(`Setting Queue failed in setQueueStatus: ${JSON.stringify(queueSetResult)}`);
      return queueSetResult;
    }

    const newQueue = queueSetResult.data;
    SocketIOServer.getInstance().emitEvent(channelId, new QueueUpdatedEmitEvent(newQueue));

    AnnounceService.announce(
      channelId,
      'Queue is now ' + (enabled ? 'open' : 'closed'),
      enabled ? 'queue.status.opened' : 'queue.status.closed'
    );
    return Success(newQueue);
  }

  /**
   * Clear the {@link QueueDoc Queue} of a specific channel by it's Id.
   *
   * @param channelId The id of the channel to clear the {@link QueueDoc Queue} for
   *
   * @returns The updated {@link QueueDoc Queue} if successful else a {@link FailureResult Failure Result}
   */
  public static async clearQueue(channelId: string): Promise<Result<QueueDoc>> {
    const queueResult = await this.getQueue(channelId);
    if (queueResult.type === 'error') {
      logger.debug(`Getting Queue for channel '${channelId}' failed in clearQueue: ${JSON.stringify(queueResult)}`);
      return queueResult;
    }

    const queue = queueResult.data;
    const queueSetResult = await QueueDao.setQueue(queue, queue.enabled, []);
    if (queueSetResult.type === 'error') {
      logger.debug(`Setting Queue failed in clearQueue: ${JSON.stringify(queueSetResult)}`);
      return queueSetResult;
    }

    const newQueue = queueSetResult.data;
    SocketIOServer.getInstance().emitEvent(channelId, new QueueUpdatedEmitEvent(newQueue));
    SocketIOServer.getInstance().emitEvent(channelId, new NextUpClearedEmitEvent());

    AnnounceService.announce(channelId, 'Queue has been cleared', 'queue.status.cleared');
    return Success(newQueue);
  }

  /**
   * Remove a {@link IQueueEntry QueueEntry} by it's index from the {@link QueueDoc Queue} of a specific channel by it's Id.
   *
   * @param channelId The id of the channel from whoms {@link QueueDoc Queue} the {@link IQueueEntry QueueEntry} should be removed
   * @param index The index of the {@link IQueueEntry QueueEntry} that should be removed from the {@link QueueDoc Queue}
   *
   * @returns The updated {@link QueueDoc Queue} if successful else a {@link FailureResult Failure Result}
   */
  public static async removeFromQueue(channelId: string, index: number): Promise<Result<QueueDoc>> {
    const queueResult = await this.getQueue(channelId);
    if (queueResult.type === 'error') {
      logger.debug(
        `Getting Queue for channel '${channelId}' failed in removeFromQueue: ${JSON.stringify(queueResult)}`
      );
      return queueResult;
    }
    const queue = queueResult.data;

    const entries = queue.entries;
    entries.splice(index, 1);

    const queueSetResult = await QueueDao.setQueue(queue, queue.enabled, entries);
    if (queueSetResult.type === 'error') {
      logger.debug(`Setting Queue failed in removeFromQueue: ${JSON.stringify(queueSetResult)}`);
      return queueSetResult;
    }

    const newQueue = queueSetResult.data;
    SocketIOServer.getInstance().emitEvent(channelId, new QueueUpdatedEmitEvent(newQueue));

    return Success(newQueue);
  }

  /**
   * Add a {@link IQueueEntry QueueEntry} to the {@link QueueDoc Queue} of a specific channel by it's Id.
   *
   * @param channelId The id of the channel to whoms {@link QueueDoc Queue} the {@link IQueueEntry QueueEntry} should be added
   * @param entry The {@link IQueueEntry QueueEntry} that should be added
   * @param userId The id of the user that wants to add the entry
   *
   * @returns The updated {@link QueueDoc Queue} if successful else a {@link FailureResult Failure Result}
   */
  public static async addToQueue(
    channelId: string,
    entry: IQueueEntry,
    userId: string
  ): Promise<Result<QueueDoc, AddToQueueErrors>> {
    const queueResult = await this.getQueue(channelId);
    if (queueResult.type === 'error') {
      return queueResult;
    }
    const queue = queueResult.data;

    if (!queue.enabled) {
      logger.debug('Adding to Queue failed because the Queue is closed');
      return Failure<AddToQueueErrors>('queue-is-closed', 'The queue is closed');
    }

    const configurationResult = await StreamerConfigurationDao.get(channelId);
    if (configurationResult.type === 'error') {
      logger.debug(`Getting StreamerConfiguration failed in addToQueue: ${JSON.stringify(configurationResult)}`);
      return configurationResult;
    }
    const configuration = configurationResult.data;

    const requestCount = queue.entries.filter((v) => v.userId === userId);
    if (requestCount.length >= configuration.requests.perUser) {
      logger.debug(
        `Adding to Queue failed because request limit was reached ${JSON.stringify({
          count: requestCount,
          perUser: configuration.requests.perUser,
        })}`
      );
      return Failure<AddToQueueErrors>('maximum-requests-exceeded', 'Too many songs in queue');
    }

    if (
      queue.entries.some((v) => v.song.id === entry.song.id) &&
      !configuration.requests.duplicates &&
      entry.fromChat !== true
    ) {
      logger.debug(
        `Adding to Queue failed because the song is already in the queue ${JSON.stringify({
          queue: queue,
          allowDuplicates: configuration.requests.duplicates,
          entry: entry,
        })}`
      );
      return Failure<AddToQueueErrors>('song-already-queued', 'Song already in queue');
    }

    const profile = configuration.profile.active;
    const banned = profile.banlist.some((e) => e._id.toString() === entry.song.id);
    if (banned) {
      logger.debug('Adding to Queue failed because the song is banned');
      return Failure<AddToQueueErrors>('song-is-banned', 'Song is banned. Not allowed to queue it.');
    }

    const entries = queue.entries;
    entries.push(entry);

    const queueSetResult = await QueueDao.setQueue(queue, queue.enabled, entries);
    if (queueSetResult.type === 'error') {
      logger.debug(`Setting Queue failed in addToQueue: ${JSON.stringify(queueSetResult)}`);
      return queueSetResult;
    }

    const newQueue = queueSetResult.data;
    SocketIOServer.getInstance().emitEvent(channelId, new QueueUpdatedEmitEvent(newQueue));

    return Success(newQueue);
  }
}
