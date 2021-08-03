import logger from '@common/logging';

import SongData, { ISongData } from '@db/schema/song-data';
import { DBResult, Failure, Success } from '@db/dao/dao';

type GetErrors = 'no-such-entity';

export default class SongDataDao {
  public static async getSong(songId: string): Promise<DBResult<ISongData, GetErrors>> {
    try {
      return Success(await SongData.findById(songId));
    } catch (e) {
      logger.error(e);

      return Failure('internal', 'Could not retrive SongData');
    }
  }

  public static async getAllSongs(): Promise<DBResult<ISongData[]>> {
    try {
      return Success(await SongData.find({}));
    } catch (e) {
      logger.error(e);

      return Failure('internal', 'Could not retrive SongData');
    }
  }
}
