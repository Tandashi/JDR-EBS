import express from 'express';

import getLogger from '@common/logging';
import messages from '@twitch-bot/messages';
const logger = getLogger('Response Service');

export enum ErrorResponseCode {
  UNAUTHORIZED_REQUEST = 'E1000',
  BAD_REQUEST = 'E1001',
  CONFLICT = 'E1002',
  INTERNAL_ERROR = 'E1003',

  COULD_NOT_AUTH_WITH_SECRET = 'E2000',
  COULD_NOT_AUTH_NO_USERID = 'E2001',

  COULD_NOT_RETRIVE_SONGDATA = 'E3000',
  COULD_NOT_RETRIVE_STREAMER_CONFIGURATION = 'E3001',
  COULD_NOT_RETRIVE_GAMES = 'E3002',
  COULD_NOT_RETRIVE_QUEUE = 'E3003',
  COULD_NOT_RETRIVE_CHANNEL_INFORMATION = 'E3004',
  COULD_NOT_RETRIVE_PROFILE = 'E3005',

  COULD_NOT_ADD_TO_QUEUE = 'E4000',
  COULD_NOT_RESOLVE_USERNAME_FOR_QUEUE = 'E4001',

  COULD_NOT_UPDATE_CHANNEL_NAME = 'E5000',
  COULD_NOT_UPDATE_PROFILE = 'E5001',
  COULD_NOT_UPDATE_SECRET = 'E5001',
  COULD_NOT_UPDATE_ENABLED_QUEUE = 'E5003',

  COULD_NOT_REMOVE_FROM_QUEUE = 'E5500',
  COULD_NOT_CLEAR_QUEUE = 'E5501',

  COULD_NOT_FILTER_SONGS = 'E6000',
}

enum StatusCode {
  OK = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

interface ResponseData {
  data: any;
}

interface ResponseError {
  error: {
    code: string;
    message: string;
  };
}

type Response = { code: StatusCode } & (ResponseData | ResponseError);

export type SocketIOResponseCallback = (response: Response) => void;

export default class ResponseService {
  private static apiInstance: APIResponseService;
  private static socketInstance: SocketIOResponseService;

  public static getAPIInstance(): APIResponseService {
    if (!this.apiInstance) {
      this.apiInstance = new APIResponseService();
    }
    return this.apiInstance;
  }

  public static getSocketInstance(): SocketIOResponseService {
    if (!this.socketInstance) {
      this.socketInstance = new SocketIOResponseService();
    }
    return this.socketInstance;
  }
}

abstract class AbstractResponseService<T> {
  protected abstract send(res: T, statusCode: StatusCode, data: ResponseData | ResponseError): void;

  public sendError(res: T, statusCode: StatusCode, errorResponseCode: ErrorResponseCode, message: string): void {
    this.send(res, statusCode, {
      error: {
        code: errorResponseCode,
        message: message,
      },
    });
  }

  sendInternalError(res: T, errorResponseCode: ErrorResponseCode): void {
    this.sendError(
      res,
      StatusCode.INTERNAL_SERVER_ERROR,
      errorResponseCode,
      'An internal error has occured. We are sorry :('
    );
  }

  sendOk(res: T, data: ResponseData): void {
    this.send(res, StatusCode.OK, data);
  }

  sendUnauthorized(res: T, message: string, errorResponseCode?: ErrorResponseCode): void {
    this.sendError(res, StatusCode.UNAUTHORIZED, errorResponseCode ?? ErrorResponseCode.UNAUTHORIZED_REQUEST, message);
  }

  sendBadRequest(res: T, message: string): void {
    this.sendError(res, StatusCode.BAD_REQUEST, ErrorResponseCode.BAD_REQUEST, message);
  }

  sendConflictRequest(res: T, message: string): void {
    this.sendError(res, StatusCode.CONFLICT, ErrorResponseCode.CONFLICT, message);
  }
}

class APIResponseService extends AbstractResponseService<express.Response> {
  protected send(res: express.Response, statusCode: StatusCode, data: ResponseData | ResponseError): void {
    logger.debug(`Sending API Response ${JSON.stringify({ statusCode: statusCode, data: data })}`);
    res.status(statusCode).json(<Response>{
      code: statusCode,
      ...data,
    });
  }
}

class SocketIOResponseService extends AbstractResponseService<SocketIOResponseCallback> {
  protected send(res: SocketIOResponseCallback, statusCode: StatusCode, data: ResponseData | ResponseError): void {
    logger.debug(`Sending SocketIO Response ${JSON.stringify({ statusCode: statusCode, data: data })}`);
    res(<Response>{
      code: statusCode,
      ...data,
    });
  }
}
