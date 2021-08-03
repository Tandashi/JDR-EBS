import express from 'express';

import ResponseService, { ErrorResponseCode } from '@services/response-service';
import QueueService from '@common/services/queue-service';
import QueueDto from '@common/db/dto/v1/queue-dto';

export default class QueueGetEndpoint {
  public static async get(req: express.Request, res: express.Response): Promise<void> {
    const channelId = req.params.channelId;

    if (!channelId) {
      return ResponseService.sendBadRequest(res, 'No channelId provided');
    }

    const getQueueResult = await QueueService.getQueue(channelId);
    if (getQueueResult.type === 'error') {
      return ResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_GET_QUEUE);
    }

    ResponseService.sendOk(res, {
      data: QueueDto.getJSON(getQueueResult.data),
    });
  }
}
