import { FilterQuery, ObjectId } from 'mongoose';

import getLogger from '@common/logging';
import { Result, Success, Failure } from '@common/result';

import SongData, { GameVersion, SongDataDoc } from '@mongo/schema/song-data';

export type GetErrors = 'no-such-entity';

const logger = getLogger('SongData Dao');

export default class SongDataDao {
  /**
   * Get Song by Id.
   *
   * @param songId The id of the song to get
   *
   * @returns The result of the operation
   */
  public static async getSong(songId: string): Promise<Result<SongDataDoc, GetErrors>> {
    try {
      const songdata = await SongData.findById(songId);

      if (!songdata) {
        return Failure<GetErrors>('no-such-entity', `No song with id (${songId}) exists.`);
      }
      return Success(songdata);
    } catch (e) {
      logger.error(e);

      return Failure('internal', 'Could not retrive SongData');
    }
  }

  /**
   * Get Songs using a filter Query.
   *
   * @param query The query for getting the Songs
   *
   * @returns The result of the operation
   */
  private static async getSongs(query: FilterQuery<SongDataDoc> = {}): Promise<Result<SongDataDoc[]>> {
    try {
      const songData = await SongData.find(query);

      // Filter out duplicate songs
      const filteredSongData: SongDataDoc[] = songData.reduce<SongDataDoc[]>((acc, current) => {
        const x = acc.find((item) => item.code_name === current.code_name);
        if (!x) {
          return acc.concat([current]);
        }

        return acc;
      }, []);

      return Success(filteredSongData);
    } catch (e) {
      logger.error(e);

      return Failure('internal', 'Could not retrive SongDatas');
    }
  }

  /**
   * Get all Songs.
   *
   * @returns The result of the operation
   */
  public static async getAllSongs(): Promise<Result<SongDataDoc[]>> {
    return await this.getSongs();
  }

  /**
   * Get all Songs and filter them by properties.
   *
   * @param ids The ids that should not be included in the result set
   * @param game The Game the songs should be filtered for
   * @param unlimited Wether unlimited song should be included
   *
   * @returns The result of the operation
   */
  public static async getAllFiltered(
    ids: ObjectId[],
    game: GameVersion,
    unlimited: boolean
  ): Promise<Result<SongDataDoc[]>> {
    if (unlimited) {
      return await this.getSongs({ _id: { $nin: ids }, $or: [{ game: game }, { game: 'Just Dance Unlimited' }] });
    } else {
      return await this.getSongs({ _id: { $nin: ids }, game: game });
    }
  }

  /**
   * Get all supported Games.
   *
   * @returns The result of the operation
   */
  public static async getAllGames(): Promise<Result<string[]>> {
    try {
      const games = await SongData.distinct('game');

      return Success(games);
    } catch (e) {
      logger.error(e);

      return Failure('internal', 'Could not retrive Games');
    }
  }
}
