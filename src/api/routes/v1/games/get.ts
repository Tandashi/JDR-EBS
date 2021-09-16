import express from 'express';

import ResponseService, { ErrorResponseCode } from '@services/response-service';

import SongDataDao from '@mongo/dao/song-data-dao';
import GamesDto from '@mongo/dto/v1/games-dto';

const APIResponseService = ResponseService.getAPIInstance();

export default class GamesGetEndpoint {
  public static async get(req: express.Request, res: express.Response): Promise<void> {
    const gamesResult = await SongDataDao.getAllGames();
    if (gamesResult.type === 'error') {
      return APIResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_RETRIVE_GAMES);
    }

    APIResponseService.sendOk(res, { data: GamesDto.getJSON(gamesResult.data) });
  }
}
