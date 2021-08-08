import express from 'express';

export enum ErrorResponseCode {
  COULD_NOT_RETRIVE_SONGDATA = 'E1000',
  UNAUTHORIZED_REQUEST = 'E1001',
  BAD_REQUEST = 'E1002',
  COULD_NOT_GET_QUEUE = 'E1003',
  COULD_NOT_ADD_TO_QUEUE = 'E1004',
  COULD_NOT_RETRIVE_STREAMER_CONFIGURATION = 'E1005',
  COULD_NOT_GET_CHANNEL_INFORMATION = 'E1006',
  COULD_NOT_UPDATE_CHANNEL_NAME = 'E1007',
  COULD_NOT_GET_BANLIST = 'E1008',
  COULD_NOT_UPDATE_BANLIST = 'E1009',
  COULD_NOT_FILTER_SONGS = 'E1010',
}

enum HTTPCode {
  OK = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
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
}
