import express from 'express';
import { Schema } from 'express-validator';

import SocketIOServer from '@socket-io/index';
import NextUpSetEmitEvent from '@socket-io/events/v1/emit/next-up/set';

import ResponseService, { ErrorResponseCode } from '@services/response-service';
import QueueService from '@services/queue-service';
import AnnounceService from '@services/announce-service';

import QueueDto from '@mongo/dto/v1/queue-dto';
import SongDataDao from '@mongo/dao/song-data-dao';
import { IQueueEntryFromExtension } from '@mongo/schema/queue';

const APIResponseService = ResponseService.getAPIInstance();

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
  /* Add again once the mobile bug is fixed
  username: {
    in: 'body',
    exists: {
      errorMessage: 'Field `username` can not be empty',
      bail: true,
    },
    isString: {
      errorMessage: 'Field `username` must be a string',
      bail: true,
    },
  },
  */
};

export const announceRequestValidationSchema: Schema = {
  index: {
    in: ['body'],
    exists: {
      errorMessage: 'Field `index` can not be empty',
      bail: true,
    },
    isInt: {
      errorMessage: 'Field `index` must be a number',
      bail: true,
    },
  },
};

export default class QueuePostEndpoint {
  public static async announce(req: express.Request, res: express.Response): Promise<void> {
    const index = req.body.index;
    const queueResult = await QueueService.getQueue(req.user.channel_id);

    if (queueResult.type === 'error') {
      return APIResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_RETRIVE_QUEUE);
    }

    const entry = queueResult.data.toObject().entries[index];
    if (entry) {
      AnnounceService.announce(req.user.channel_id, `Next up: ${entry.song.title}`, 'queue.song.nextUp');
      SocketIOServer.getInstance().emitChannelEvent(req.user.channel_id, new NextUpSetEmitEvent(entry));
    }

    return APIResponseService.sendOk(res, {
      data: QueueDto.getJSON(queueResult.data),
    });
  }

  public static async clear(req: express.Request, res: express.Response): Promise<void> {
    const clearResult = await QueueService.clearQueue(req.user.channel_id);

    if (clearResult.type === 'error') {
      return APIResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_CLEAR_QUEUE);
    }

    return APIResponseService.sendOk(res, {
      data: QueueDto.getJSON(clearResult.data),
    });
  }

  public static async add(req: express.Request, res: express.Response): Promise<void> {
    const songId = req.body.id;

    const getSongResult = await SongDataDao.getSong(songId);
    if (getSongResult.type === 'error') {
      switch (getSongResult.error) {
        case 'no-such-entity':
          return APIResponseService.sendBadRequest(res, 'Invalid songId provided');

        case 'internal':
        default:
          return APIResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_ADD_TO_QUEUE);
      }
    }

    const songdata = getSongResult.data;
    const queueSongData: IQueueEntryFromExtension = {
      userId: req.user.user_id,
      username: req.body.username ?? 'Unknown (Mobile)',
      userState: req.body.username
        ? {
            inChat: true,
            lastSeen: undefined,
          }
        : undefined,
      fromChat: false,
      song: {
        id: songdata.id,
        title: `${songdata.title} - ${songdata.artist}`,
      },
    };

    const addResult = await QueueService.addToQueue(req.user.channel_id, queueSongData, req.user.user_id);
    if (addResult.type === 'error') {
      switch (addResult.error) {
        case 'maximum-requests-exceeded':
          return APIResponseService.sendBadRequest(res, 'Maximum number of songs to request exceeded.');

        case 'song-already-queued':
          return APIResponseService.sendBadRequest(res, 'Song is already in Queue.');

        case 'song-is-banned':
          return APIResponseService.sendBadRequest(res, 'Song is banned.');

        case 'queue-is-closed':
          return APIResponseService.sendConflictRequest(res, 'Queue is currently closed.');

        case 'internal':
        default:
          return APIResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_ADD_TO_QUEUE);
      }
    }

    AnnounceService.announce(
      req.user.channel_id,
      `Song "${queueSongData.song.title}" was added to the Queue`,
      'queue.song.fromExtension'
    );

    return APIResponseService.sendOk(res, {
      data: QueueDto.getJSON(addResult.data),
    });
  }
}
