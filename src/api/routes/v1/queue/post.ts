import express from 'express';
import { Schema } from 'express-validator';

import ResponseService, { ErrorResponseCode } from '@services/response-service';
import QueueService from '@services/queue-service';
import AnnounceService from '@services/announce-service';

import QueueDto from '@db/dto/v1/queue-dto';
import SongDataDao from '@db/dao/song-data-dao';
import { IQueueEntryFromExtension, IQueueEntrySongData } from '@db/schema/queue';
import TwitchAPIService from '@common/services/twitch-api-service';

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
  username: {
    in: 'body',
  },
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
      return ResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_RETRIVE_QUEUE);
    }

    const entry = queueResult.data.entries[index];
    if (entry) {
      AnnounceService.announce(req.user.channel_id, `Next up: ${entry.song.title}`);
    }

    return ResponseService.sendOk(res, {
      data: QueueDto.getJSON(queueResult.data),
    });
  }

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

    let username = req.body.username;

    if (!username) {
      const channelInfoResult = await TwitchAPIService.getInstance().getChannelInfo(req.user.user_id);
      if (channelInfoResult.type === 'error') {
        return ResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_RESOLVE_USERNAME_FOR_QUEUE);
      }

      username = channelInfoResult.data.displayName;
    }

    const songdata = getSongResult.data;
    const queueSongData: IQueueEntryFromExtension = {
      userId: req.user.user_id,
      username: username,
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
