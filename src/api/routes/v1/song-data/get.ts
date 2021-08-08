import express from 'express';
import { Schema } from 'express-validator';

import SongDataDto from '@common/db/dto/v1/song-data-dto';
import SongDataDao from '@common/db/dao/song-data-dao';
import ResponseService, { ErrorResponseCode } from '@services/response-service';
import ProfileService from '@common/services/profile-service';

export const getRequestValidationSchema: Schema = {
  excludeBanlist: {
    in: 'query',
    optional: true,
    isBoolean: {
      errorMessage: 'Field `excludeBanlist` must be a boolean',
      bail: true,
    },
    toBoolean: true,
  },
};

export default class SongDataGetEndpoint {
  public static async getAll(req: express.Request, res: express.Response): Promise<void> {
    const getAllResult = await SongDataDao.getAllSongs();

    if (getAllResult.type === 'error') {
      return ResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_RETRIVE_SONGDATA);
    }

    const dtos = getAllResult.data
      .map((songdata) => SongDataDto.getJSON(songdata))
      .sort((a, b) => (a.title > b.title ? 1 : -1));

    ResponseService.sendOk(res, {
      data: dtos,
    });
  }

  public static async getFiltered(req: express.Request, res: express.Response): Promise<void> {
    const excludeBanlist = req.query.excludeBanlist;

    const filteredResult = await ProfileService.filterSongs(
      req.user.channel_id,
      (excludeBanlist as unknown as boolean) ?? false
    );

    if (filteredResult.type === 'error') {
      return ResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_FILTER_SONGS);
    }

    const dtos = filteredResult.data
      .map((songdata) => SongDataDto.getJSON(songdata))
      .sort((a, b) => (a.title > b.title ? 1 : -1));

    ResponseService.sendOk(res, {
      data: dtos,
    });
  }
}
