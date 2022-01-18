import express from 'express';

import getLogger from '@common/logging';
import { Failure, FailureResult, Result, Success } from '@common/result';

import { ProfileDoc } from '@mongo/schema/profile';
import { SongDataDoc } from '@mongo/schema/song-data';
import ProfileDao from '@mongo/dao/profile-dao';
import SongDataDao, { GetErrors as SongDataGetErrors } from '@mongo/dao/song-data-dao';
import StreamerConfigurationDao from '@mongo/dao/streamer-configuration-dao';

const logger = getLogger('Profile Service');

type UpdateErrors = 'invalid-song-id';
type GetErrors = 'no-such-name';

export default class ProfileService {
  /**
   * Get the {@link ProfileDoc Profile} of a specific channel by it's name and the channel Id.
   *
   * @param channelId The id of the channel to get the {@link ProfileDoc Profile} of
   * @param name The name of the {@link ProfileDoc Profile}
   *
   * @returns The {@link ProfileDoc Profile} if successful or a {@link FailureResult Failure Result}
   */
  public static async getById(channelId: string, name: string): Promise<Result<ProfileDoc, GetErrors>> {
    const configurationResult = await StreamerConfigurationDao.get(channelId);
    if (configurationResult.type === 'error') {
      logger.debug(`Getting StreamerConfiguration failed in getById: ${JSON.stringify(configurationResult)}`);
      return configurationResult;
    }

    const configuration = configurationResult.data;
    const profilesFiltered = configuration.profile.profiles.filter((e) => e.name === name);

    if (profilesFiltered.length === 0) {
      logger.debug(
        `Profile name does not exist: ${JSON.stringify({ profiles: configuration.profile.profiles, name: name })}`
      );
      return Failure<GetErrors>('no-such-name', `Profile name (${name}) does not exist`);
    }

    return Success(profilesFiltered[0]);
  }

  /**
   * Get the active {@link ProfileDoc Profile} of a specific channel by it's Id.
   *
   * @param channelId The id of the channel to get the active {@link ProfileDoc Profile} of
   *
   * @returns The {@link ProfileDoc Profile} if successful or a {@link FailureResult Failure Result}
   */
  public static async getActive(channelId: string): Promise<Result<ProfileDoc>> {
    const configurationResult = await StreamerConfigurationDao.get(channelId);
    if (configurationResult.type === 'error') {
      logger.debug(`Getting StreamerConfiguration failed in getActive: ${JSON.stringify(configurationResult)}`);
      return configurationResult;
    }

    return Success(configurationResult.data.profile.active);
  }

  /**
   * Update the {@link ProfileDoc Profile} using the given {@link express.Request Request}.
   *
   * @param oldProfile The old {@link ProfileDoc Profile}
   * @param req The {@link express.Request Request} to update the {@link ProfileDoc Profile} with.
   *
   * @returns The updated {@link ProfileDoc Profile} if successful or a {@link FailureResult Failure Result}
   */
  public static async update(oldProfile: ProfileDoc, req: express.Request): Promise<Result<ProfileDoc, UpdateErrors>> {
    const promises: Promise<Result<SongDataDoc, SongDataGetErrors>>[] = [];

    const songDatas: SongDataDoc[] = [];

    const ids = req.body.ids;

    if (ids === undefined || ids === null) {
      songDatas.push(...oldProfile.banlist);
    } else {
      (ids as string[]).forEach((id) => {
        promises.push(SongDataDao.getSong(id));
      });

      const results = await Promise.all(promises);

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
          songDatas.push(r.data);
        }

        return r.type === 'success';
      });

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

    const updateResult = await ProfileDao.update(
      oldProfile._id,
      {
        $set: {
          banlist: songDatas,
          'configuration.song.game': req.body.configuration.song.game ?? oldProfile.configuration.song.game,
          'configuration.song.unlimited':
            req.body.configuration.song.unlimited ?? oldProfile.configuration.song.unlimited,
        },
      },
      [
        {
          path: 'banlist',
        },
      ]
    );

    if (updateResult.type === 'error') {
      return updateResult;
    }

    return Success(updateResult.data);
  }

  /**
   * Get all Songs for a specific channel by it's Id.
   *
   * If {@link excludeBanlist} is true the banlist of the active profile is ignored.
   * Else the songs will be excluded.
   *
   * @param channelId The id of the channel to filter the songs of
   * @param excludeBanlist If the banlist should be excluded from the filter
   *
   * @returns The filtered List of {@link SongDataDoc Songs} if successful or a {@link FailureResult Failure Result}
   */
  public static async filterSongsWithChannelId(
    channelId: string,
    excludeBanlist: boolean
  ): Promise<Result<SongDataDoc[]>> {
    const profileResult = await this.getActive(channelId);
    if (profileResult.type === 'error') {
      logger.debug(`Getting active Profile failed in filterSongs: ${JSON.stringify(profileResult)}`);
      return profileResult;
    }

    return this.filterSongsWithProfile(profileResult.data, excludeBanlist);
  }

  /**
   * Get all Songs for a specific profile.
   *
   * If {@link excludeBanlist} is true the banlist of the profile is ignored.
   * Else the songs will be excluded.
   *
   * @param profile The profile to filter the songs with
   * @param excludeBanlist If the banlist should be excluded from the filter
   *
   * @returns The filtered List of {@link SongDataDoc Songs} if successful or a {@link FailureResult Failure Result}
   */
  public static async filterSongsWithProfile(
    profile: ProfileDoc,
    excludeBanlist: boolean
  ): Promise<Result<SongDataDoc[]>> {
    const songConfiguration = profile.configuration.song;
    const songResult = await SongDataDao.getAllFiltered(
      excludeBanlist ? [] : profile.banlist.map((e) => e._id),
      songConfiguration.game,
      songConfiguration.unlimited
    );

    if (songResult.type === 'error') {
      logger.debug(`Getting filtered songs failed in filterSongs: ${JSON.stringify(songResult)}`);
      return songResult;
    }

    return Success(songResult.data);
  }
}
