import { Result } from '@common/result';

import SecretService from '@services/secret-service';

import StreamerDataDao from '@db/dao/streamer-data-dao';
import { IStreamerData } from '@db/schema/streamer-data';

export default class StreamerDataService {
  public static async regenerateSecret(channelId: string): Promise<Result<IStreamerData>> {
    return await StreamerDataDao.updateSecret(channelId, SecretService.generateSecret());
  }
}
