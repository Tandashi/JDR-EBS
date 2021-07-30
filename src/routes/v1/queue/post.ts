import express from 'express';

import logger from '@base/logging';
import SongData, { ISongData } from '@base/models/schema/songdata';
import ResponseService, { ErrorResponseCode } from '@base/services/response-service';
import SongDataService from '@base/services/song-service';
import QueueService from '@base/services/queue-service';
import InternalError from '@base/errors/internal-error';
import SongAlreadyInQueueError from '@base/errors/song-already-in-queue-error';
import MaximumRequestsExceededError from '@base/errors/maximum-requests-exceeded-error';

export default class QueuePostEndpoint {
  public static add(req: express.Request, res: express.Response): void {
    const songId = req.params.id;

    if (!songId) {
      return ResponseService.sendBadRequest(res, 'No songId provided');
    }

    SongDataService.getSongData(songId)
      .then((songdata: ISongData) => {
        QueueService.addToQueue(req.user.channel_id, songdata, req.user.user_id)
          .then((queue) => {
            return ResponseService.sendOk(res, {
              data: queue,
            });
          })
          .catch((err: Error) => {
            if (err instanceof InternalError) {
              logger.error(err);
              return ResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_ADD_TO_QUEUE);
            } else if (err instanceof SongAlreadyInQueueError) {
              return ResponseService.sendBadRequest(res, 'Song is already in Queue.');
            } else if (err instanceof MaximumRequestsExceededError) {
              return ResponseService.sendBadRequest(res, 'Maximum number of songs to request exceeded.');
            }

            logger.error(err);
            return ResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_ADD_TO_QUEUE);
          });
      })
      .catch((err: Error) => {
        logger.error(err);
        return ResponseService.sendBadRequest(res, 'Invalid songId provided');
      });
  }
}
