import express from 'express';

import ResponseService, { ErrorResponseCode } from '@services/response-service';

import QueueDto from '@db/dto/v1/queue-dto';
import SongDataDao from '@common/db/dao/song-data-dao';
import { IQueueEntrySongData } from '@common/db/schema/queue';
import QueueService from '@common/services/queue-service';

export default class QueuePostEndpoint {
  public static async add(req: express.Request, res: express.Response): Promise<void> {
    const songId = req.body.id;

    if (!songId) {
      return ResponseService.sendBadRequest(res, 'No songId provided');
    }

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
