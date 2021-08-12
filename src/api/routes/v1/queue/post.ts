import express from 'express';
import { Schema } from 'express-validator';

import ResponseService, { ErrorResponseCode } from '@services/response-service';
import QueueService from '@services/queue-service';

import QueueDto from '@db/dto/v1/queue-dto';
import SongDataDao from '@db/dao/song-data-dao';
import { IQueueEntrySongData } from '@db/schema/queue';

export const addRequestValidationSchema: Schema = {
  id: {
    in: 'body',
    exists: {
      errorMessage: 'Field `id` can not be empty',
      bail: true,
    },
    isString: {
      errorMessage: 'Field `id` must be a string',
      bail: true,
    },
  },
};

export default class QueuePostEndpoint {
  public static async clear(req: express.Request, res: express.Response): Promise<void> {
    const clearResult = await QueueService.clearQueue(req.user.channel_id);

    if (clearResult.type === 'error') {
      return ResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_CLEAR_QUEUE);
    }

    return ResponseService.sendOk(res, {
      data: QueueDto.getJSON(clearResult.data),
    });
  }

  public static async add(req: express.Request, res: express.Response): Promise<void> {
    const songId = req.body.id;

    const getSongResult = await SongDataDao.getSong(songId);
    if (getSongResult.type === 'error') {
      switch (getSongResult.error) {
        case 'no-such-entity':
          return ResponseService.sendBadRequest(res, 'Invalid songId provided');

        case 'internal':
        default:
          return ResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_ADD_TO_QUEUE);
      }
    }

    const songdata = getSongResult.data;
    const queueSongData: IQueueEntrySongData = {
      id: songdata.id,
      title: songdata.title,
      fromChat: false,
    };

    const addResult = await QueueService.addToQueue(req.user.channel_id, queueSongData, req.user.user_id);
    if (addResult.type === 'error') {
      switch (addResult.error) {
        case 'maximum-requests-exceeded':
          return ResponseService.sendBadRequest(res, 'Maximum number of songs to request exceeded.');

        case 'song-already-queued':
          return ResponseService.sendBadRequest(res, 'Song is already in Queue.');

        case 'song-is-banned':
          return ResponseService.sendBadRequest(res, 'Song is banned.');

        case 'queue-is-closed':
          return ResponseService.sendConflictRequest(res, 'Queue is currently closed.');

        case 'internal':
        default:
          return ResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_ADD_TO_QUEUE);
      }
    }

    return ResponseService.sendOk(res, {
      data: QueueDto.getJSON(addResult.data),
    });
  }
}
