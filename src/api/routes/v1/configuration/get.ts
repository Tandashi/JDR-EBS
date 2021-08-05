import express from 'express';

import ResponseService, { ErrorResponseCode } from '@services/response-service';
import StreamerConfigurationDao from '@common/db/dao/streamer-configuration-dao';
import StreamerConfigurationDto from '@common/db/dto/v1/streamer-configuration-dto';

export default class StreamerConfigurationGetEndpoint {
  public static async get(req: express.Request, res: express.Response): Promise<void> {
    if (req.user.role !== 'broadcaster') {
      return ResponseService.sendUnauthorized(res, 'Unauthorized. Only Broadcaster can get the configuration.');
    }

    const configurationResult = await StreamerConfigurationDao.get(req.user.channel_id);
    if (configurationResult.type === 'error') {
      return ResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_RETRIVE_STREAMER_CONFIGURATION);
    }

    ResponseService.sendOk(res, { data: StreamerConfigurationDto.getJSON(configurationResult.data) });
  }
}