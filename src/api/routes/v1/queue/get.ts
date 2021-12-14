import express from 'express';

import ResponseService, { ErrorResponseCode } from '@services/response-service';
import QueueService from '@services/queue-service';

import QueueDto from '@mongo/dto/v1/queue-dto';

const APIResponseService = ResponseService.getAPIInstance();

export default class QueueGetEndpoint {
  public static async get(req: express.Request, res: express.Response): Promise<void> {
    const queueResult = await QueueService.getQueue(req.user.channel_id);
    if (queueResult.type === 'error') {
      return APIResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_RETRIVE_QUEUE);
    }

    APIResponseService.sendOk(res, {
      // Convert to lean Object so we preserve undefined
      // Else undefined schema props will be converted to {}
      // from mongoose in Documents
      data: QueueDto.getJSON(queueResult.data.toObject()),
    });
  }
}
