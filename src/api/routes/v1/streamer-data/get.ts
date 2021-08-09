import express from 'express';
import { Schema } from 'express-validator';

import ResponseService, { ErrorResponseCode } from '@services/response-service';
import StreamerDataDao from '@common/db/dao/streamer-data-dao';
import StreamerDataDto from '@common/db/dto/v1/streamer-data-dto';

export const getRequestValidationSchema: Schema = {
  channelId: {
    in: ['params'],
    exists: {
      errorMessage: 'Field `channelId` can not be empty',
      bail: true,
    },
    isInt: {
      errorMessage: 'Field `channelId` must be a number',
    },
  },
};

export default class StreamerDataGetEndpoint {
  public static async get(req: express.Request, res: express.Response): Promise<void> {
    const streamerDataResult = await StreamerDataDao.getOrCreateStreamerData(req.user.channel_id, [
      {
        path: 'queue',
      },
      {
        path: 'configuration',

        populate: [
          {
            path: 'profile.active',
          },
          {
            path: 'profile.profiles',
          },
        ],
      },
    ]);

    if (streamerDataResult.type === 'error') {
      return ResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_GET_QUEUE);
    }

    ResponseService.sendOk(res, {
      data: StreamerDataDto.getJSON(streamerDataResult.data),
    });
  }
}
