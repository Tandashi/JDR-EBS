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
      const songData = await SongData.find(query);
      return Success(songData);
    } catch (e) {
      logger.error((e as Error).message);

      return Failure('internal', 'Could not retrive SongDatas');
    }
  }

  public static async getAllSongs(): Promise<Result<SongDataDoc[]>> {
    return await this.getSongs();
  }

  public static async getAllFiltered(
    ids: ObjectId[],
    game: string,
    unlimited: boolean
  ): Promise<Result<SongDataDoc[]>> {
    if (unlimited) {
      return await this.getSongs({ _id: { $nin: ids }, $or: [{ source: game }, { unlimited: unlimited }] });
    } else {
      return await this.getSongs({ _id: { $nin: ids }, source: game });
    }
  }

  public static async getAllGames(): Promise<Result<string[]>> {
    try {
      const games = await SongData.distinct('source');

      return Success(games);
    } catch (e) {
      logger.error((e as Error).message);

      return Failure('internal', 'Could not retrive Games');
    }
  }
}
