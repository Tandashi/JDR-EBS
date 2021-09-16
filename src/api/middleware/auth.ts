import express from 'express';

import getLogger from '@common/logging';
import * as Auth from '@common/auth';
import ResponseService, { ErrorResponseCode } from '@services/response-service';

const BearerPrefix = 'Bearer ';
const logger = getLogger('Authentication API Middleware');

const APIResponseService = ResponseService.getAPIInstance();

export const AuthJWTOrSecret = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<void> => {
  // Get the authorization header from the request
  const apiKey = req.headers['x-api-key'];

  // If no header is specified they are not authorized
  if (apiKey) {
    return AuthSecret(req, res, next);
  }

  // Get the authorization header from the request
  const authHeader = req.headers.authorization;

  // If no header is specified they are not authorized
  if (authHeader) {
    return AuthJWT(req, res, next);
  }

  return APIResponseService.sendUnauthorized(res, 'Unauthorized');
};

export const AuthSecret = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<void> => {
  // Get the authorization header from the request
  const apiKey = req.headers['x-api-key'];

  // If no header is specified they are not authorized
  if (!apiKey) {
    return APIResponseService.sendUnauthorized(res, 'Unauthorized');
  }

  const twitchUserResult = await Auth.AuthSecret(apiKey as string);
  if (twitchUserResult.type === 'error') {
    switch (twitchUserResult.error) {
      case 'no-such-entity':
        return APIResponseService.sendUnauthorized(res, 'Unauthorized');
      case 'internal':
      default:
        return APIResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_AUTH_WITH_SECRET);
    }
  }

  req.user = twitchUserResult.data;
  next();
};

export const AuthJWT = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  // Get the authorization header from the request
  const authHeader = req.headers.authorization;

  // If no header is specified they are not authorized
  if (!authHeader) {
    return APIResponseService.sendUnauthorized(res, 'Unauthorized');
  }

  // If no bearer token was provided the wrong format was provided
  if (!authHeader.startsWith(BearerPrefix)) {
    return APIResponseService.sendUnauthorized(res, 'Wrong token format!');
  }

  // Get the token without the Bearer Prefix
  const token = authHeader.substring(BearerPrefix.length);

  const authResult = Auth.AuthJWT(token);
  if (authResult.type === 'error') {
    return APIResponseService.sendUnauthorized(res, 'Unauthorized');
  }

  // Set the User on the request
  req.user = authResult.data;

  // Check if the userId we need was linked
  if (!req.user.user_id) {
    return APIResponseService.sendUnauthorized(res, 'Unauthorized', ErrorResponseCode.COULD_NOT_AUTH_NO_USERID);
  }

  next();
};

export const BroadcasterOnly = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  if (!req.user) {
    logger.error('No user present in broadcaster only middleware. Did you forget to authenticate jwt before?');
    return APIResponseService.sendUnauthorized(res, 'Unauthorized');
  }

  if (req.user.role !== 'broadcaster') {
    return APIResponseService.sendUnauthorized(
      res,
      'Unauthorized. Only Broadcasters are allowed to use this endpoint.'
    );
  }

  next();
};
