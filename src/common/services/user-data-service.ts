import express from 'express';

import getLogger from '@common/logging';
import { Failure, FailureResult, Result, Success } from '@common/result';
import UserDataDao from '@mongo/dao/user-data-dao';
import SongDataDao, { GetErrors as SongDataGetErrors } from '@mongo/dao/song-data-dao';
import { SongDataDoc } from '@mongo/schema/song-data';
import { IUserDataUnpopulated, UserDataDoc, UserDataDocPopulated } from '@mongo/schema/user-data';

const logger = getLogger('UserData Service');

type UpdateErrors = 'invalid-song-id';

export default class UserDataService {
  public static async setFavouriteSongs(
    channelId: string,
    songs: SongDataDoc[]
  ): Promise<Result<UserDataDocPopulated>> {
    logger.debug(`Setting favourite songs from userdata for channel (${channelId})`);
    return await UserDataDao.updateByChannelId(
      channelId,
      {
        favouriteSongs: songs.map((e) => e._id),
      },
      [
        {
          path: 'favouriteSongs',
        },
      ]
    );
  }

  /**
   * Update the {@link ProfileDoc Profile} using the given {@link express.Request Request}.
   *
   * @param oldProfile The old {@link ProfileDoc Profile}
   * @param req The {@link express.Request Request} to update the {@link ProfileDoc Profile} with.
   *
   * @returns The updated {@link ProfileDoc Profile} if successful or a {@link FailureResult Failure Result}
   */
  public static async update(
    oldUserData: UserDataDoc,
    req: express.Request
  ): Promise<Result<UserDataDocPopulated, UpdateErrors>> {
    const promises: Promise<Result<SongDataDoc, SongDataGetErrors>>[] = [];

    let songDatas: string[] = [];
    const requestUserData: Partial<IUserDataUnpopulated> = req.body;

    // Check if favouriteSongs were specified
    // If so we need to check if the id's are all valid
    if (requestUserData.favouriteSongs === undefined && requestUserData.favouriteSongs === null) {
      songDatas = oldUserData.favouriteSongs.map((e) => {
        switch (typeof e) {
          case 'string':
            return e;
          case 'object':
            return e._id;
        }
      });
    } else {
      // Try to get all the Songs by their Id's
      (requestUserData.favouriteSongs as string[]).forEach((id) => {
        promises.push(SongDataDao.getSong(id));
      });

      // Wait for all Song promises to resolve
      const results = await Promise.all(promises);

      // Check if any query has failed
      const internalErrors: FailureResult<any>[] = [];
      const invalidIdErrors: FailureResult<any>[] = [];
      const valid = results.every((r) => {
        if (r.type === 'error') {
          switch (r.error) {
            case 'internal':
              internalErrors.push(r);
              break;
            case 'no-such-entity':
              invalidIdErrors.push(r);
              break;
          }
        }

        if (r.type === 'success') {
          songDatas.push(r.data._id);
        }

        return r.type === 'success';
      });

      // Check if all results were of type success
      // If not report the error
      if (!valid) {
        if (internalErrors.length > 0) {
          return Failure(
            'internal',
            `An internal error occured while checking the songIds: ${internalErrors[0].message}`
          );
        }

        return Failure<UpdateErrors>('invalid-song-id', "Some song ids don't exist.");
      }
    }

    const updateUserData: IUserDataUnpopulated = {
      channelId: oldUserData.channelId,
      favouriteSongs: songDatas,
    };

    const updateResult = await UserDataDao.updateByChannelId<UserDataDocPopulated>(
      updateUserData.channelId,
      updateUserData,
      [
        {
          path: 'favouriteSongs',
        },
      ]
    );

    if (updateResult.type === 'error') {
      return updateResult;
    }

    return Success(updateResult.data);
  }
}
