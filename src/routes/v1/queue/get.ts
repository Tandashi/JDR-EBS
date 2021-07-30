import express from 'express';

import logger from '@base/logging';
import ResponseService, { ErrorResponseCode } from '@base/services/response-service';
import QueueDTO from '@base/models/dto/v1/queue-dto';
import QueueService from '@base/services/queue-service';

export default class QueueGetEndpoint {
  public static get(req: express.Request, res: express.Response): void {
    QueueService.getQueue(req.user.channel_id)
      .then((queue) => {
        ResponseService.sendOk(res, {
          data: new QueueDTO().getJSON(queue),
        });
      })
      .catch((err: Error) => {
        logger.error(err);
        return ResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_GET_QUEUE);
      });
  }
}
