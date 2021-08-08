import express from 'express';
import { Schema } from 'express-validator';

import ResponseService, { ErrorResponseCode } from '@services/response-service';
import ProfileService from '@common/services/profile-service';
import ProfileDto from '@common/db/dto/v1/profile-dto';

export const updateRequestValidationSchema: Schema = {
  name: {
    in: 'body',
    isString: {
      errorMessage: 'Field `name` must be a string',
      bail: true,
    },
  },
  ids: {
    in: 'body',
    isArray: {
      errorMessage: 'Field `ids` must be an array',
      bail: true,
    },
  },
  'ids.*': {
    isString: {
      errorMessage: 'Field `ids` values must be a string',
      bail: true,
    },
  },
  configuration: {
    in: 'body',
    isObject: {
      errorMessage: 'Field `configuration` must be an object',
      bail: true,
    },
  },
  'configuration.song': {
    in: 'body',
    isObject: {
      errorMessage: 'Field `configuration.song` must be an object',
      bail: true,
    },
  },
  'configuration.song.unlimited': {
    isBoolean: {
      errorMessage: 'Field `configuration.song.unlimited` must be a boolean',
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
          return ResponseService.sendBadRequest(res, `There is no profile with the name: ${req.body.name}`);
        case 'internal':
        default:
          return ResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_GET_PROFILE);
      }
    }

    const profile = profileResult.data;
    const updateResult = await ProfileService.update(profile, req);
    if (updateResult.type === 'error') {
      switch (updateResult.error) {
        case 'invalid-song-id':
          return ResponseService.sendBadRequest(res, "Some song ids don't exists.");
        case 'internal':
        default:
          return ResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_UPDATE_PROFILE);
      }
    }

    ResponseService.sendOk(res, {
      data: ProfileDto.getJSON(updateResult.data),
    });
  }
}
