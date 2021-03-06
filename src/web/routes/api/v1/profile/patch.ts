import express from 'express';
import { Schema } from 'express-validator';

import SocketIOServer from '@socket-io/index';

import ResponseService, { ErrorResponseCode } from '@services/response-service';
import ProfileService from '@services/profile-service';

import ProfileDto from '@mongo/dto/v1/profile-dto';
import SongDataFilteredUpdatedEmitEvent from '@socket-io/events/v1/emit/songdata/updated';

const APIResponseService = ResponseService.getAPIInstance();

export const updateRequestValidationSchema: Schema = {
  name: {
    in: 'body',
    exists: {
      errorMessage: 'Field `name` can not be empty',
      bail: true,
    },
    isString: {
      errorMessage: 'Field `name` must be a string',
      bail: true,
    },
  },
  ids: {
    in: 'body',
    exists: {
      errorMessage: 'Field `ids` can not be empty',
      bail: true,
    },
    isArray: {
      errorMessage: 'Field `ids` must be an array',
      bail: true,
    },
  },
  'ids.*': {
    in: 'body',
    isString: {
      errorMessage: 'Field `ids` values must be a string',
      bail: true,
    },
  },
  configuration: {
    in: 'body',
    exists: {
      errorMessage: 'Field `configuration` can not be empty',
      bail: true,
    },
    isObject: {
      errorMessage: 'Field `configuration` must be an object',
      bail: true,
    },
  },
  'configuration.song': {
    in: 'body',
    exists: {
      errorMessage: 'Field `configuration.song` can not be empty',
      bail: true,
    },
    isObject: {
      errorMessage: 'Field `configuration.song` must be an object',
      bail: true,
    },
  },
  'configuration.song.game': {
    in: 'body',
    exists: {
      errorMessage: 'Field `configuration.song.game` can not be empty',
      bail: true,
    },
    isString: {
      errorMessage: 'Field `configuration.song.game` must be a string',
      bail: true,
    },
  },
  'configuration.song.unlimited': {
    in: 'body',
    exists: {
      errorMessage: 'Field `configuration.song.unlimited` can not be empty',
      bail: true,
    },
    isBoolean: {
      errorMessage: 'Field `configuration.song.unlimited` must be a boolean',
      bail: true,
    },
    toBoolean: true,
  },
};

export default class ProfilePatchEndpoint {
  public static async update(req: express.Request, res: express.Response): Promise<void> {
    const profileResult = await ProfileService.getById(req.user.channel_id, req.body.name);
    if (profileResult.type === 'error') {
      switch (profileResult.error) {
        case 'no-such-name':
          return APIResponseService.sendBadRequest(res, `There is no profile with the name: ${req.body.name}`);
        case 'internal':
        default:
          return APIResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_RETRIVE_PROFILE);
      }
    }

    const profile = profileResult.data;
    const updateResult = await ProfileService.update(profile, req);
    if (updateResult.type === 'error') {
      switch (updateResult.error) {
        case 'invalid-song-id':
          return APIResponseService.sendBadRequest(res, "Some song ids don't exists.");
        case 'internal':
        default:
          return APIResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_UPDATE_PROFILE);
      }
    }

    APIResponseService.sendOk(res, {
      data: ProfileDto.getJSON(updateResult.data),
    });

    const songDatasResult = await ProfileService.filterSongsWithProfile(updateResult.data, false);
    if (songDatasResult.type === 'success') {
      SocketIOServer.getInstance().emitChannelEvent(
        req.user.channel_id,
        new SongDataFilteredUpdatedEmitEvent(songDatasResult.data)
      );
    }
  }
}
