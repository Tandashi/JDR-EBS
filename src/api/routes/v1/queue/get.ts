import express from 'express';

import ResponseService, { ErrorResponseCode } from '@services/response-service';
import QueueService from '@services/queue-service';

import QueueDto from '@mongo/dto/v1/queue-dto';

export default class QueueGetEndpoint {
  public static async get(req: express.Request, res: express.Response): Promise<void> {
    const queueResult = await QueueService.getQueue(req.user.channel_id);
    if (queueResult.type === 'error') {
      return ResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_RETRIVE_QUEUE);
    }

    ResponseService.sendOk(res, {
      data: QueueDto.getJSON(queueResult.data),
    });
  }
}
