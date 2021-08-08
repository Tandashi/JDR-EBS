import { Failure, FailureResult, Result, Success } from '@common/result';
import BanlistDao from '@db/dao/banlist-dao';
import { BanlistDoc } from '@db/schema/banlist';
import SongDataDao, { GetErrors as SongDataGetErrors } from '@common/db/dao/song-data-dao';
import { SongDataDoc } from '@common/db/schema/song-data';
import StreamerConfigurationDao from '@common/db/dao/streamer-configuration-dao';

type UpdateErrors = 'invalid-song-id';
type GetErrors = 'no-such-name';

export default class BanlistService {
  public static async get(channelId: string, name: string): Promise<Result<BanlistDoc, GetErrors>> {
    const configurationResult = await StreamerConfigurationDao.get(channelId);
    if (configurationResult.type === 'error') {
      return configurationResult;
    }

    const configuration = configurationResult.data;
    const banlistsFiltered = configuration.banlist.banlists.filter((e) => e.name === name);

    if (banlistsFiltered.length === 0) {
      return Failure<GetErrors>('no-such-name', `Banlist name (${name}) does not exist`);
    }

    return Success(banlistsFiltered[0]);
  }

  public static async update(oldBanlist: BanlistDoc, ids: string[]): Promise<Result<BanlistDoc, UpdateErrors>> {
    const promises: Promise<Result<SongDataDoc, SongDataGetErrors>>[] = [];

    ids.forEach((id) => {
      promises.push(SongDataDao.getSong(id));
    });

    const results = await Promise.all(promises);

    const internalErrors: FailureResult<any>[] = [];
    const invalidIdErrors: FailureResult<any>[] = [];

    const songDatas: SongDataDoc[] = [];
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

    const updateResult = await BanlistDao.update(
      oldBanlist._id,
      {
        $set: {
          entries: songDatas,
        },
      },
      [
        {
          path: 'entries',
        },
      ]
    );

    if (updateResult.type === 'error') {
      return updateResult;
    }

    return Success(updateResult.data);
  }

  public static async filterSongs(channelId: string): Promise<Result<SongDataDoc[]>> {
    const configurationResult = await StreamerConfigurationDao.get(channelId);
    if (configurationResult.type === 'error') {
      return configurationResult;
    }

    const banlist = configurationResult.data.banlist.active;

    const songResult = await SongDataDao.getAllExcept(banlist.entries.map((e) => e._id));
    if (songResult.type === 'error') {
      return songResult;
    }

    console.log(songResult.data);
    return Success(songResult.data);
  }
}
