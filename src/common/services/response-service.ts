import express from 'express';

export enum ErrorResponseCode {
  UNAUTHORIZED_REQUEST = 'E1000',
  BAD_REQUEST = 'E1001',
  CONFLICT = 'E1002',
  INTERNAL_ERROR = 'E1003',

  COULD_NOT_AUTH_WITH_SECRET = 'E2000',

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

enum HTTPCode {
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

export default class ResponseService {
  private static send(res: express.Response, http_code: HTTPCode, data: ResponseData | ResponseError): void {
    res.status(http_code).json({
      code: http_code,
      ...data,
    });
  }

  private static sendError(
    res: express.Response,
    http_code: HTTPCode,
    error_response_code: ErrorResponseCode,
    message: string
  ): void {
    this.send(res, http_code, {
      error: {
        code: error_response_code,
        message: message,
      },
    });
  }

  public static sendInternalError(res: express.Response, error_response_code: ErrorResponseCode): void {
    this.sendError(
      res,
      HTTPCode.INTERNAL_SERVER_ERROR,
      error_response_code,
      'An internal error has occured. We are sorry :('
    );
  }

  public static sendOk(res: express.Response, data: ResponseData): void {
    this.send(res, HTTPCode.OK, data);
  }

  public static sendUnauthorized(res: express.Response, message: string): void {
    this.sendError(res, HTTPCode.UNAUTHORIZED, ErrorResponseCode.UNAUTHORIZED_REQUEST, message);
  }

  public static sendBadRequest(res: express.Response, message: string): void {
    this.sendError(res, HTTPCode.BAD_REQUEST, ErrorResponseCode.BAD_REQUEST, message);
  }

  public static sendConflictRequest(res: express.Response, message: string): void {
    this.sendError(res, HTTPCode.CONFLICT, ErrorResponseCode.CONFLICT, message);
  }
}
