import express from 'express';
import { Schema } from 'express-validator';

import ResponseService, { ErrorResponseCode } from '@services/response-service';
import QueueService from '@services/queue-service';

import QueueDto from '@db/dto/v1/queue-dto';

export const deleteRequestValidationSchema: Schema = {
  index: {
    in: ['body'],
    exists: {
      errorMessage: 'Field `index` can not be empty',
      bail: true,
    },
    isInt: {
      errorMessage: 'Field `index` must be a number',
      bail: true,
    },
  },
};

export default class QueueDeleteEndpoint {
  public static async delete(req: express.Request, res: express.Response): Promise<void> {
    const index = req.body.index;

    const queueResult = await QueueService.removeFromQueue(req.user.channel_id, index);
    if (queueResult.type === 'error') {
      return ResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_REMOVE_FROM_QUEUE);
    }

    ResponseService.sendOk(res, {
      data: QueueDto.getJSON(queueResult.data),
    });
  }
}
