import StreamerDataDao from '@db/dao/streamer-data-dao';

import { Result, Success, Failure } from '@common/result';
import { QueueDoc, IQueueEntrySongData } from '@db/schema/queue';
import QueueDao from '@common/db/dao/queue-dao';

type AddToQueueErrors = 'maximum-requests-exceeded' | 'song-already-queued';

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
    if (queue.entries.some((v) => v.userId === userId)) {
      return Failure('maximum-requests-exceeded', 'Too many songs in queue');
    }

    if (queue.entries.some((v) => v.song.id === songdata.id && songdata.fromChat !== true)) {
      return Failure('song-already-queued', 'Song already in queue');
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
