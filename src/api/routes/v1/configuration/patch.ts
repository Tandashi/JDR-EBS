import express from 'express';

import ResponseService, { ErrorResponseCode } from '@services/response-service';
import StreamerConfigurationDao from '@common/db/dao/streamer-configuration-dao';
import StreamerConfigurationDto from '@common/db/dto/v1/streamer-configuration-dto';
import StreamerConfigurationService from '@common/services/streamer-configuration-service';

export default class StreamerConfigurationPatchEndpoint {
  public static async update(req: express.Request, res: express.Response): Promise<void> {
    if (req.user.role !== 'broadcaster') {
      return ResponseService.sendUnauthorized(res, 'Unauthorized. Only Broadcaster can update the configuration.');
    }

    const configurationResult = await StreamerConfigurationDao.get(req.user.channel_id);
    if (configurationResult.type === 'error') {
      return ResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_RETRIVE_STREAMER_CONFIGURATION);
    }

    let configuration = configurationResult.data;
    if (!configuration.chatIntegration.channelName) {
      const configurationResult = await StreamerConfigurationService.updateChannelName(
        configuration._id,
        req.user.channel_id
      );

      if (configurationResult.type === 'error') {
        return ResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_UPDATE_CHANNEL_NAME);
      }

      configuration = configurationResult.data;
    }

    const updateResult = await StreamerConfigurationService.update(configuration, req);
    if (updateResult.type === 'error') {
      switch (updateResult.error) {
        case 'internal':
          return ResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_UPDATE_CHANNEL_NAME);
        case 'invalid-request':
          return ResponseService.sendBadRequest(res, updateResult.message);
      }
    }

    configuration = updateResult.data;
    ResponseService.sendOk(res, { data: StreamerConfigurationDto.getJSON(configuration) });
  }
}
