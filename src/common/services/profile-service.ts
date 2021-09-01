import express from 'express';

import { Failure, FailureResult, Result, Success } from '@common/result';

import { IProfile, ProfileDoc } from '@db/schema/profile';
import { SongDataDoc } from '@db/schema/song-data';
import ProfileDao from '@db/dao/profile-dao';
import SongDataDao, { GetErrors as SongDataGetErrors } from '@db/dao/song-data-dao';
import StreamerConfigurationDao from '@db/dao/streamer-configuration-dao';

type UpdateErrors = 'invalid-song-id';
type GetErrors = 'no-such-name';

export default class ProfileService {
  public static async getById(channelId: string, name: string): Promise<Result<ProfileDoc, GetErrors>> {
    const configurationResult = await StreamerConfigurationDao.get(channelId);
    if (configurationResult.type === 'error') {
      return configurationResult;
    }

    const configuration = configurationResult.data;
    const profilesFiltered = configuration.profile.profiles.filter((e) => e.name === name);

    if (profilesFiltered.length === 0) {
      return Failure<GetErrors>('no-such-name', `Profile name (${name}) does not exist`);
    }

    return Success(profilesFiltered[0]);
  }

  public static async getActive(channelId: string): Promise<Result<ProfileDoc>> {
    const configurationResult = await StreamerConfigurationDao.get(channelId);
    if (configurationResult.type === 'error') {
      return configurationResult;
    }

    return Success(configurationResult.data.profile.active);
  }

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

  public static async filterSongs(channelId: string, excludeBanlist: boolean): Promise<Result<SongDataDoc[]>> {
    const profileResult = await this.getActive(channelId);
    if (profileResult.type === 'error') {
      return profileResult;
    }

    const songConfiguration = profileResult.data.configuration.song;
    const songResult = await SongDataDao.getAllFiltered(
      excludeBanlist ? [] : profileResult.data.banlist.map((e) => e._id),
      songConfiguration.game,
      songConfiguration.unlimited
    );

    if (songResult.type === 'error') {
      return songResult;
    }

    return Success(songResult.data);
  }
}
