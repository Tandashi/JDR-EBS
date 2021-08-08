import express from 'express';
import { Schema } from 'express-validator';

import ResponseService, { ErrorResponseCode } from '@services/response-service';
import StreamerConfigurationDao from '@common/db/dao/streamer-configuration-dao';
import StreamerConfigurationDto from '@common/db/dto/v1/streamer-configuration-dto';
import StreamerConfigurationService from '@common/services/streamer-configuration-service';
import BanlistService from '@common/services/banlist-service';
import BanlistDto from '@common/db/dto/v1/banlist-dto';

export const updateRequestValidationSchema: Schema = {
  name: {
    in: 'body',
    isString: {
      errorMessage: 'Field `name` must be a string',
      bail: true,
    },
  },
  ids: {
    in: 'body',
    isArray: {
      errorMessage: 'Field `ids` must be an array',
      bail: true,
    },
  },
  'ids.*': {
    isString: {
      errorMessage: 'Field `ids` values must be a string',
      bail: true,
    },
  },
};

export default class BanlistPatchEndpoint {
  public static async update(req: express.Request, res: express.Response): Promise<void> {
    const banlistResult = await BanlistService.getById(req.user.channel_id, req.body.name);
    if (banlistResult.type === 'error') {
      switch (banlistResult.error) {
        case 'no-such-name':
          return ResponseService.sendBadRequest(res, `There is no banlist with the name: ${req.body.name}`);
        case 'internal':
        default:
          return ResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_GET_BANLIST);
      }
    }

    const banlist = banlistResult.data;
    const updateResult = await BanlistService.update(banlist, req.body.ids);
    if (updateResult.type === 'error') {
      switch (updateResult.error) {
        case 'invalid-song-id':
          return ResponseService.sendBadRequest(res, "Some song ids don't exists.");
        case 'internal':
        default:
          return ResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_UPDATE_BANLIST);
      }
    }

    ResponseService.sendOk(res, {
      data: BanlistDto.getJSON(updateResult.data),
    });
  }
}
