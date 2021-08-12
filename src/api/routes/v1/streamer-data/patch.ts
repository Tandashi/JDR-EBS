import express from 'express';

import ResponseService, { ErrorResponseCode } from '@services/response-service';
import StreamerDataService from '@services/streamer-data-service';

export default class StreamerDataPatchEndpoint {
  public static async updateSecret(req: express.Request, res: express.Response): Promise<void> {
    const updateResult = await StreamerDataService.regenerateSecret(req.user.channel_id);
    if (updateResult.type === 'error') {
      return ResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_UPDATE_SECRET);
    }

    ResponseService.sendOk(res, { data: true });
  }
}
