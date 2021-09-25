import express from 'express';

import getLogger from '@common/logging';
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

interface ResponseData<D> {
  /**
   * The Response data
   */
  data: D;
}

interface ResponseError {
  /**
   * The error information
   */
  error: {
    /**
     * The error code
     */
    code: string;
    /**
     * The error message
     */
    message: string;
  };
}

type Response<D> = { code: StatusCode } & (ResponseData<D> | ResponseError);

export type SocketIOResponseCallback<D> = (response: Response<D>) => void;

export default class ResponseService {
  private static apiInstance: APIResponseService;
  private static socketInstance: SocketIOResponseService;

  /**
   * Get the {@link APIResponseService API Response Service} Instance.
   *
   * @returns The API Response Service Instance
   */
  public static getAPIInstance(): APIResponseService {
    if (!this.apiInstance) {
      this.apiInstance = new APIResponseService();
    }
    return this.apiInstance;
  }

  /**
   * Get the {@link SocketIOResponseService SocketIO Response Service} Instance.
   *
   * @returns The SocketIO Response Service Instance
   */
  public static getSocketInstance(): SocketIOResponseService {
    if (!this.socketInstance) {
      this.socketInstance = new SocketIOResponseService();
    }
    return this.socketInstance;
  }
}

abstract class AbstractResponseService<T> {
  /**
   * Send a {@link Response} via the Response method.
   *
   * @param res The Response method
   * @param statusCode The StatusCode of the message
   * @param data The data of the message
   */
  protected abstract send<D>(res: T, statusCode: StatusCode, data: ResponseData<D> | ResponseError): void;

  /**
   * Send an Error Response.
   *
   * @param res The Response method
   * @param statusCode The StatusCode of the message
   * @param errorResponseCode The error response code
   * @param message The error message
   */
  public sendError(res: T, statusCode: StatusCode, errorResponseCode: ErrorResponseCode, message: string): void {
    this.send(res, statusCode, <ResponseError>{
      error: {
        code: errorResponseCode,
        message: message,
      },
    });
  }

  /**
   * Send an Internal Error Response.
   *
   * @param res The Response method
   * @param errorResponseCode The error response code
   */
  public sendInternalError(res: T, errorResponseCode: ErrorResponseCode): void {
    this.sendError(
      res,
      StatusCode.INTERNAL_SERVER_ERROR,
      errorResponseCode,
      'An internal error has occured. We are sorry :('
    );
  }

  /**
   * Send an Okay Response.
   *
   * @param res The Response method
   * @param data The data for the Response
   */
  public sendOk<D>(res: T, data: ResponseData<D>): void {
    this.send(res, StatusCode.OK, data);
  }

  /**
   * Send an Unauthorized Response.
   *
   * @param res The Response method
   * @param message The error message
   * @param errorResponseCode The error response code
   */
  public sendUnauthorized(res: T, message: string, errorResponseCode?: ErrorResponseCode): void {
    this.sendError(res, StatusCode.UNAUTHORIZED, errorResponseCode ?? ErrorResponseCode.UNAUTHORIZED_REQUEST, message);
  }

  /**
   * Send an Bad Request Response.
   *
   * @param res The Response method
   * @param message The error message
   */
  public sendBadRequest(res: T, message: string): void {
    this.sendError(res, StatusCode.BAD_REQUEST, ErrorResponseCode.BAD_REQUEST, message);
  }

  /**
   * Send a Conflict Request Response.
   *
   * @param res The Response method
   * @param message The error message
   */
  public sendConflictRequest(res: T, message: string): void {
    this.sendError(res, StatusCode.CONFLICT, ErrorResponseCode.CONFLICT, message);
  }
}

class APIResponseService extends AbstractResponseService<express.Response> {
  /**
   * Send an API Response.
   *
   * @param res The Response method
   * @param statusCode The StatusCode of the message
   * @param data The data of the message
   */
  protected send<D>(res: express.Response, statusCode: StatusCode, data: ResponseData<D> | ResponseError): void {
    logger.debug(`Sending API Response ${JSON.stringify({ statusCode: statusCode, data: data })}`);
    res.status(statusCode).json(<Response<D>>{
      code: statusCode,
      ...data,
    });
  }
}

class SocketIOResponseService extends AbstractResponseService<SocketIOResponseCallback<any>> {
  /**
   * Send a SocketIO Response.
   *
   * @param res The Response method
   * @param statusCode The StatusCode of the message
   * @param data The data of the message
   */
  protected send<D>(
    res: SocketIOResponseCallback<D>,
    statusCode: StatusCode,
    data: ResponseData<D> | ResponseError
  ): void {
    logger.debug(`Sending SocketIO Response ${JSON.stringify({ statusCode: statusCode, data: data })}`);
    res(<Response<D>>{
      code: statusCode,
      ...data,
    });
  }
}
