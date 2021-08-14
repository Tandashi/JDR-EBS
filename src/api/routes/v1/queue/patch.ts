import express from 'express';
import { Schema } from 'express-validator';

import ResponseService, { ErrorResponseCode } from '@services/response-service';
import QueueService from '@services/queue-service';

import QueueDto from '@db/dto/v1/queue-dto';

export const patchRequestValidationSchema: Schema = {
  enabled: {
    in: ['body'],
    exists: {
      errorMessage: 'Field `enabled` can not be empty',
      bail: true,
    },
    isBoolean: {
      errorMessage: 'Field `enabled` must be a number',
      bail: true,
    },
    toBoolean: true,
  },
};

export default class QueuePatchEndpoint {
  public static async patch(req: express.Request, res: express.Response): Promise<void> {
    const enabled = req.body.enabled;

    const queueResult = await QueueService.setQueueStatus(req.user.channel_id, enabled);
    if (queueResult.type === 'error') {
      return ResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_UPDATE_ENABLED_QUEUE);
    }

    ResponseService.sendOk(res, {
      data: QueueDto.getJSON(queueResult.data),
    });
  }
}