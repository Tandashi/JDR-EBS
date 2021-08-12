import { Result, Success, Failure } from '@common/result';

import { QueueDoc, IQueueEntrySongData } from '@db/schema/queue';
import StreamerDataDao from '@db/dao/streamer-data-dao';
import QueueDao from '@db/dao/queue-dao';
import StreamerConfigurationDao from '@db/dao/streamer-configuration-dao';
import AnnounceService from './announce-service';

type AddToQueueErrors = 'maximum-requests-exceeded' | 'song-already-queued' | 'song-is-banned' | 'queue-is-closed';

export default class QueueService {
  public static async getQueue(channelId: string): Promise<Result<QueueDoc>> {
    const streamDataResult = await StreamerDataDao.getOrCreateStreamerData(channelId, [{ path: 'queue' }]);

    if (streamDataResult.type === 'error') {
      return streamDataResult;
    }

    return Success(streamDataResult.data.queue);
  }

  public static async setQueueStatus(channelId: string, enabled: boolean): Promise<Result<QueueDoc>> {
    const queueResult = await this.getQueue(channelId);
    if (queueResult.type === 'error') {
      return queueResult;
    }

    const queue = queueResult.data;
    const queueSetResult = await QueueDao.setQueue(queue, enabled, queue.entries);
    if (queueSetResult.type === 'error') {
      return queueSetResult;
    }

    AnnounceService.announce(channelId, 'Queue is now ' + (enabled ? 'open' : 'closed'));
    return Success(queueSetResult.data);
  }

  public static async clearQueue(channelId: string): Promise<Result<QueueDoc>> {
    const queueResult = await this.getQueue(channelId);
    if (queueResult.type === 'error') {
      return queueResult;
    }

    const queue = queueResult.data;
    const queueSetResult = await QueueDao.setQueue(queue, queue.enabled, []);
    if (queueSetResult.type === 'error') {
      return queueSetResult;
    }

    AnnounceService.announce(channelId, 'Queue has been cleared');
    return Success(queueSetResult.data);
  }

  public static async removeFromQueue(channelId: string, index: number): Promise<Result<QueueDoc>> {
    const queueResult = await this.getQueue(channelId);
    if (queueResult.type === 'error') {
      return queueResult;
    }
    const queue = queueResult.data;

    const entries = queue.entries;
    entries.splice(index, 1);

    const queueSetResult = await QueueDao.setQueue(queue, queue.enabled, entries);
    if (queueSetResult.type === 'error') {
      return queueSetResult;
    }

    return Success(queueSetResult.data);
  }

  public static async addToQueue(
    channelId: string,
    songdata: IQueueEntrySongData,
    userId: string
  ): Promise<Result<QueueDoc, AddToQueueErrors>> {
    const queueResult = await this.getQueue(channelId);
    if (queueResult.type === 'error') {
      return queueResult;
    }
    const queue = queueResult.data;

    if (!queue.enabled) {
      return Failure<AddToQueueErrors>('queue-is-closed', 'The queue is closed');
    }

    const configurationResult = await StreamerConfigurationDao.get(channelId);
    if (configurationResult.type === 'error') {
      return configurationResult;
    }
    const configuration = configurationResult.data;

    const requestCount = queue.entries.filter((v) => v.userId === userId);
    if (requestCount.length >= configuration.requests.perUser) {
      return Failure<AddToQueueErrors>('maximum-requests-exceeded', 'Too many songs in queue');
    }

    if (
      queue.entries.some((v) => v.song.id === songdata.id) &&
      !configuration.requests.duplicates &&
      songdata.fromChat !== true
    ) {
      return Failure<AddToQueueErrors>('song-already-queued', 'Song already in queue');
    }

    const profile = configuration.profile.active;
    const banned = profile.banlist.some((e) => e._id.toString() === songdata.id);

    if (banned) {
      return Failure<AddToQueueErrors>('song-is-banned', 'Song is banned. Not allowed to queue it.');
    }

    const entries = queue.entries;
    entries.push({
      userId: userId,
      song: songdata,
    });

    const queueSetResult = await QueueDao.setQueue(queue, queue.enabled, entries);
    if (queueSetResult.type === 'error') {
      return queueSetResult;
    }

    return Success(queueSetResult.data);
  }
}
