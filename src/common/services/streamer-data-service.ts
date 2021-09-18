import getLogger from '@common/logging';
import { Result } from '@common/result';

import SecretService from '@services/secret-service';

import StreamerDataDao from '@mongo/dao/streamer-data-dao';
import { IStreamerData } from '@mongo/schema/streamer-data';

const logger = getLogger('StreamerData Service');

export default class StreamerDataService {
  public static async regenerateSecret(channelId: string): Promise<Result<IStreamerData>> {
    logger.debug(`Regenerating Secret`);
    return await StreamerDataDao.updateSecret(channelId, SecretService.generateSecret());
  }
}
