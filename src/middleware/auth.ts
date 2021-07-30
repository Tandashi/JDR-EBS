import express from 'express';
import jsonwebtoken from 'jsonwebtoken';

import config from '@base/config';
import ResponseService from '@base/services/response-service';

const BearerPrefix = 'Bearer ';

export const AuthJWT = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return ResponseService.sendUnauthorized(res, 'Unauthorized');
    }

    if (!authHeader.startsWith(BearerPrefix)) {
      return ResponseService.sendUnauthorized(res, 'Wrong token format!');
    }

    const token = authHeader.substring(BearerPrefix.length);
    const jwt = jsonwebtoken.verify(token, Buffer.from(config.twitch.secret, 'base64'), {
      algorithms: ['HS256'],
    });

    req.user = jwt as any;
    next();
  } catch (e: any) {
    return ResponseService.sendUnauthorized(res, 'Unauthorized');
  }
};
