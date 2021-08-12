import express from 'express';
import { Schema } from 'express-validator';

import ResponseService, { ErrorResponseCode } from '@services/response-service';
import QueueService from '@common/services/queue-service';
import QueueDto from '@common/db/dto/v1/queue-dto';

export const getRequestValidationSchema: Schema = {
  channelId: {
    in: ['params'],
    exists: {
      errorMessage: 'Field `channelId` can not be empty',
      bail: true,
    },
    isInt: {
      errorMessage: 'Field `channelId` must be a number',
      bail: true,
    },
  },
};

export default class QueueGetEndpoint {
  public static async get(req: express.Request, res: express.Response): Promise<void> {
    const channelId = req.params.channelId;

    const queueResult = await QueueService.getQueue(channelId);
    if (queueResult.type === 'error') {
      return ResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_GET_QUEUE);
    }

    ResponseService.sendOk(res, {
      data: QueueDto.getJSON(queueResult.data),
    });
  }
}
