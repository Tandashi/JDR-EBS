import { FilterQuery, ObjectId } from 'mongoose';

import logger from '@common/logging';

import { Result, Success, Failure } from '@common/result';
import SongData, { ISongData, SongDataDoc } from '@db/schema/song-data';

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

  private static async getSongs(query: FilterQuery<ISongData> = {}): Promise<Result<SongDataDoc[]>> {
    try {
      return Success(await SongData.find(query));
    } catch (e) {
      logger.error((e as Error).message);

      return Failure('internal', 'Could not retrive SongDatas');
    }
  }

  public static async getAllSongs(): Promise<Result<SongDataDoc[]>> {
    return await this.getSongs();
  }

  public static async getAllExcept(ids: ObjectId[], unlimited: boolean): Promise<Result<SongDataDoc[]>> {
    return await this.getSongs({ _id: { $nin: ids }, 'song.unlimited': unlimited });
  }
}
