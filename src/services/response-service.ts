import express from 'express';

export enum ErrorResponseCode {
  COULD_NOT_RETRIVE_SONGDATA = 'E1000',
}

enum HTTPCode {
  OK = 200,
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
}
