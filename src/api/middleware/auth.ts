import express from 'express';
import jsonwebtoken from 'jsonwebtoken';

import logger from '@common/logging';
import config from '@common/config';
import ResponseService from '@services/response-service';

const BearerPrefix = 'Bearer ';

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
    const jwt = jsonwebtoken.verify(token, Buffer.from(config.twitch.jwtSecret, 'base64'), {
      algorithms: ['HS256'],
    });

    // Set the User on the request
    req.user = jwt as TwitchUser;
    next();
  } catch (e) {
    logger.error(e);
    return ResponseService.sendUnauthorized(res, 'Unauthorized');
  }
};
