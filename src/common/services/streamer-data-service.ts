import getLogger from '@common/logging';
import { Result } from '@common/result';

import SecretService from '@services/secret-service';

import StreamerDataDao from '@mongo/dao/streamer-data-dao';
import { IStreamerData } from '@mongo/schema/streamer-data';

const logger = getLogger('StreamerData Service');

export default class StreamerDataService {
  /**
   * Regenerate the secret for a specific channel by it's Id.
   *
   * @see {@link SecretService.generateSecret}
   *
   * @param channelId The id of the channel to regenerate the secret for
   *
   * @returns The updated {@link IStreamerData StreamerData} if successful else a Failure Result
   */
  public static async regenerateSecret(channelId: string): Promise<Result<IStreamerData>> {
    logger.debug(`Regenerating Secret for channel (${channelId})`);
    return await StreamerDataDao.updateSecret(channelId, SecretService.generateSecret());
  }
}
