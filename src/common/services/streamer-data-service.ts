import { Result } from '@common/result';

import { IStreamerData } from '@common/db/schema/streamer-data';
import StreamerDataDao from '@common/db/dao/streamer-data-dao';
import SecretService from './secret-service';

export default class StreamerDataService {
  public static async regenerateSecret(channelId: string): Promise<Result<IStreamerData>> {
    return await StreamerDataDao.updateSecret(channelId, SecretService.generateSecret());
  }
}
