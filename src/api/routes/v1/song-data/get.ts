import express from 'express';

import SongDataDto from '@common/db/dto/v1/song-data-dto';
import SongDataDao from '@common/db/dao/song-data-dao';
import ResponseService, { ErrorResponseCode } from '@services/response-service';

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
}
