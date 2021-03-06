import express from 'express';

import ResponseService, { ErrorResponseCode } from '@services/response-service';

import StreamerConfigurationDao from '@mongo/dao/streamer-configuration-dao';
import StreamerConfigurationDto from '@mongo/dto/v1/streamer-configuration-dto';

const APIResponseService = ResponseService.getAPIInstance();

export default class StreamerConfigurationGetEndpoint {
  public static async get(req: express.Request, res: express.Response): Promise<void> {
    const configurationResult = await StreamerConfigurationDao.get(req.user.channel_id);
    if (configurationResult.type === 'error') {
      return APIResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_RETRIVE_STREAMER_CONFIGURATION);
    }

    APIResponseService.sendOk(res, { data: StreamerConfigurationDto.getJSON(configurationResult.data) });
  }
}
