import express from 'express';

import ResponseService, { ErrorResponseCode } from '@services/response-service';

import SongDataDao from '@db/dao/song-data-dao';

export default class GamesGetEndpoint {
  public static async get(req: express.Request, res: express.Response): Promise<void> {
    const gamesResult = await SongDataDao.getAllGames();
    if (gamesResult.type === 'error') {
      return ResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_RETRIVE_GAMES);
    }

    ResponseService.sendOk(res, { data: gamesResult.data });
  }
}
