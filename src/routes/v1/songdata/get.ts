import express from 'express';

import SongData, { ISongData } from '@base/models/schema/songdata';
import ResponseService, { ErrorResponseCode } from '@base/services/response-service';
import SongDataDTO from '@base/models/dto/v1/songdata-dto';
import logger from '@base/logging';

export default class SongDataGetEndpoint {
  public static getAll(req: express.Request, res: express.Response): void {
    SongData.find({})
      .exec()
      .catch((error) => {
        const error_response_code = ErrorResponseCode.COULD_NOT_RETRIVE_SONGDATA;
        logger.error(`${error_response_code} - ${error}`);
        ResponseService.sendInternalError(res, error_response_code);
      })
      .then((songdatas: ISongData[]) => {
        const dtos = songdatas
          .map((songdata) => new SongDataDTO().getJSON(songdata))
          .sort((a, b) => (a.title > b.title ? 1 : -1));
        ResponseService.sendOk(res, {
          data: dtos,
        });
      });
  }
}
