import StreamerDataDao from '@db/dao/streamer-data-dao';

import { Result, Success, Failure } from '@common/result';
import { QueueDoc, IQueueEntrySongData } from '@db/schema/queue';
import QueueDao from '@common/db/dao/queue-dao';
import BanlistService from './banlist-service';
import StreamerConfigurationDao from '@common/db/dao/streamer-configuration-dao';

type AddToQueueErrors = 'maximum-requests-exceeded' | 'song-already-queued' | 'song-is-banned';

export default class QueueService {
  public static async getQueue(channelId: string): Promise<Result<QueueDoc>> {
    const streamDataResult = await StreamerDataDao.getOrCreateStreamerData(channelId, [{ path: 'queue' }]);

    if (streamDataResult.type === 'error') {
      return streamDataResult;
    }

    return Success(streamDataResult.data.queue);
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

    const banlist = configuration.banlist.active;
    const banned = banlist.entries.some((e) => e._id.toString() === songdata.id);

    if (banned) {
      return Failure<AddToQueueErrors>('song-is-banned', 'Song is banned. Not allowed to queue it.');
    }

    const queueAddResult = await QueueDao.addToQueue(queue, {
      userId: userId,
      song: songdata,
    });

    if (queueAddResult.type === 'error') {
      return queueAddResult;
    }

    return Success(queueAddResult.data);
  }
}
