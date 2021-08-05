import logger from '@common/logging';

import { Result, Success, Failure } from '@common/result';
import SongData, { ISongData } from '@db/schema/song-data';

type GetErrors = 'no-such-entity';

export default class SongDataDao {
  public static async getSong(songId: string): Promise<Result<ISongData, GetErrors>> {
    try {
      return Success(await SongData.findById(songId));
    } catch (e) {
      logger.error(e);

      return Failure('internal', 'Could not retrive SongData');
    }
  }

  public static async getAllSongs(): Promise<Result<ISongData[]>> {
    try {
      return Success(await SongData.find({}));
    } catch (e) {
      logger.error(e);

      return Failure('internal', 'Could not retrive SongData');
    }
  }
}
