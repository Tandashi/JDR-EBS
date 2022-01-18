import express from 'express';

import ResponseService, { ErrorResponseCode } from '@services/response-service';

import UserDataDao from '@mongo/dao/user-data-dao';
import UserDataDto from '@mongo/dto/v1/user-data-dto';
import { UserDataDocPopulated } from '@mongo/schema/user-data';

const APIResponseService = ResponseService.getAPIInstance();

export default class UserDataGetEndpoint {
  public static async get(req: express.Request, res: express.Response): Promise<void> {
    const userDataResult = await UserDataDao.getOrCreateUserData<UserDataDocPopulated>(req.user.user_id, [
      {
        path: 'favouriteSongs',
      },
    ]);

    if (userDataResult.type === 'error') {
      return APIResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_RETRIVE_USERDATA);
    }

    APIResponseService.sendOk(res, {
      data: UserDataDto.getJSON(userDataResult.data),
    });
  }
}
