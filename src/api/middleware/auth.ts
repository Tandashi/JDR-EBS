import express from 'express';
import jsonwebtoken from 'jsonwebtoken';

import logger from '@common/logging';
import config from '@common/config';
import ResponseService, { ErrorResponseCode } from '@services/response-service';
import StreamerDataDao from '@common/db/dao/streamer-data-dao';

const BearerPrefix = 'Bearer ';

export const AuthSecret = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<void> => {
  // Get the authorization header from the request
  const authHeader = req.headers['x-api-key'];

  // If no header is specified they are not authorized
  if (!authHeader) {
    return ResponseService.sendUnauthorized(res, 'Unauthorized');
  }

  const streamerDataResult = await StreamerDataDao.getBySecret(authHeader as string);
  if (streamerDataResult.type === 'error') {
    switch (streamerDataResult.error) {
      case 'no-such-entity':
        return ResponseService.sendUnauthorized(res, 'Unauthorized');
      case 'internal':
      default:
        return ResponseService.sendInternalError(res, ErrorResponseCode.COULD_NOT_AUTH_WITH_SECRET);
    }
  }

  req.user = {
    channel_id: streamerDataResult.data.channelId,
    role: 'broadcaster',
    user_id: '-1',
    opaque_user_id: '-1',
  };

  next();
};

export const BroadcasterOnly = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  if (!req.user) {
    logger.error('No user present in broadcaster only middleware. Did you forget to authenticate jwt before?');
    return ResponseService.sendUnauthorized(res, 'Unauthorized');
  }

  if (req.user.role !== 'broadcaster') {
    return ResponseService.sendUnauthorized(res, 'Unauthorized. Only Broadcasters are allowed to use this endpoint.');
  }

  next();
};

export const AuthJWT = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  try {
    // Get the authorization header from the request
    const authHeader = req.headers.authorization;

    // If no header is specified they are not authorized
    if (!authHeader) {
      return ResponseService.sendUnauthorized(res, 'Unauthorized');
    }

    // If no bearer token was provided the wrong format was provided
    if (!authHeader.startsWith(BearerPrefix)) {
      return ResponseService.sendUnauthorized(res, 'Wrong token format!');
    }

    // Get the token without the Bearer Prefix
    const token = authHeader.substring(BearerPrefix.length);
    // Verify if the token is correct
    // Decode the secret since Twitch provides it as a base64 string
    const jwt = jsonwebtoken.verify(token, Buffer.from(config.twitch.extension.jwtSecret, 'base64'), {
      algorithms: ['HS256'],
    });

    // Set the User on the request
    req.user = jwt as TwitchUser;
    next();
  } catch (e) {
    logger.error((e as Error).message);
    return ResponseService.sendUnauthorized(res, 'Unauthorized');
  }
};
