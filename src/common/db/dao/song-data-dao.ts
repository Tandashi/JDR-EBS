import logger from '@common/logging';

import { Result, Success, Failure } from '@common/result';
import SongData, { SongDataDoc } from '@db/schema/song-data';

export type GetErrors = 'no-such-entity';

export default class SongDataDao {
  public static async getSong(songId: string): Promise<Result<SongDataDoc, GetErrors>> {
    try {
      const songdata = await SongData.findById(songId);

      if (!songdata) {
        return Failure<GetErrors>('no-such-entity', `No song with id (${songId}) exists.`);
      }
      return Success(songdata);
    } catch (e) {
      logger.error((e as Error).message);

      return Failure('internal', 'Could not retrive SongData');
    }
  }

  public static async getAllSongs(): Promise<Result<SongDataDoc[]>> {
    try {
      return Success(await SongData.find({}));
    } catch (e) {
      logger.error((e as Error).message);

      return Failure('internal', 'Could not retrive SongDatas');
    }
  }
}
