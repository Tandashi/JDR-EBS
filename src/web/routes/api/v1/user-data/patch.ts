import express from 'express';
import { Schema } from 'express-validator';

import ResponseService, { ErrorResponseCode } from '@services/response-service';
import UserDataDao from '@mongo/dao/user-data-dao';
import UserDataDto from '@mongo/dto/v1/user-data-dto';
import UserDataService from '@common/services/user-data-service';

const APIResponseService = ResponseService.getAPIInstance();

export const updateRequestValidationSchema: Schema = {
  favouriteSongs: {
    in: 'body',
    optional: { options: { nullable: true } },
    exists: {
      errorMessage: 'Field `favouriteSongs` can not be empty',
      bail: true,
    },
    isArray: {
      errorMessage: 'Field `favouriteSongs` must be an array',
      bail: true,
    },
  },
};

export default class ProfilePatchEndpoint {
  public static async update(req: express.Request, res: express.Response): Promise<void> {
    const userDataResult = await UserDataDao.getOrCreateUserData(req.user.user_id, [
      {
        path: 'favouriteSongs',
      },
    ]);
    if (userDataResult.type === 'error') {
      switch (userDataResult.error) {
        case 'internal':
        default:
          return APIResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_RETRIVE_USERDATA);
      }
    }

    const userData = userDataResult.data;
    const updateResult = await UserDataService.update(userData, req);
    if (updateResult.type === 'error') {
      switch (updateResult.error) {
        case 'invalid-song-id':
          return APIResponseService.sendBadRequest(res, "Some song ids don't exists.");
        case 'internal':
        default:
          return APIResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_UPDATE_USERDATA);
      }
    }

    APIResponseService.sendOk(res, {
      data: UserDataDto.getJSON(updateResult.data),
    });
  }
}
