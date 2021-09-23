import { Socket } from 'socket.io';

import getLogger from '@common/logging';
import * as Auth from '@common/auth';

enum AuthMethod {
  JWT = 'jwt',
  SECRET = 'secret',
}

const logger = getLogger('Authentication SocketIO Middleware');

/**
 * Authenticate the Socket through JWT or Secret.
 *
 * On failed authentication and Error will be passed to the next middlware function.
 * On successful authentication the authenticated user can be accessed through (`socket.handshake.auth.user`)
 *
 * @param socket The socket which wants to connect to the server
 * @param token The provided authentication token
 * @param next The next middleware function
 */
export const AuthJWTOrSecret = async (socket: Socket, next: (err?: Error) => void): Promise<void> => {
  const authMethod: AuthMethod = socket.handshake.auth.method;
  const authToken: string = socket.handshake.auth.token;

  switch (authMethod) {
    case AuthMethod.JWT:
      return AuthJWT(socket, authToken, next);

    case AuthMethod.SECRET:
      return AuthSecret(socket, authToken, next);

    default:
      logger.info('Request with none valid authentication method');
      return next(new Error('Unsupported authentication method'));
  }
};

/**
 * Authenticate the Socket through Secret.
 *
 * On failed authentication and Error will be passed to the next middlware function.
 * On successful authentication the authenticated user can be accessed through (`socket.handshake.auth.user`)
 *
 * @param socket The socket which wants to connect to the server
 * @param token The provided authentication token
 * @param next The next middleware function
 */
const AuthSecret = async (socket: Socket, token: string, next: (err?: Error) => void): Promise<void> => {
  if (!token) {
    return next(new Error('No Token Provided'));
  }

  logger.debug('Authenticating with Secret');

  const twitchUserResult = await Auth.AuthSecret(token);
  if (twitchUserResult.type === 'error') {
    switch (twitchUserResult.error) {
      case 'no-such-entity':
        return next(new Error('Unauthroized'));
      case 'internal':
      default:
        return next(new Error('Internal Error while authenticating'));
    }
  }

  socket.handshake.auth.user = twitchUserResult.data;
  next();
};

/**
 * Authenticate the Socket through JWT.
 *
 * On failed authentication and Error will be passed to the next middlware function.
 * On successful authentication the authenticated user can be accessed through (`socket.handshake.auth.user`)
 *
 * @param socket The socket which wants to connect to the server
 * @param token The provided authentication token
 * @param next The next middleware function
 */
const AuthJWT = (socket: Socket, token: string, next: (err?: Error) => void): void => {
  if (!token) {
    return next(new Error('No Token Provided'));
  }

  logger.debug('Authenticating with JWT');

  const authResult = Auth.AuthJWT(token);
  if (authResult.type === 'error') {
    next(new Error('Unauthroized'));
    return;
  }

  socket.handshake.auth.user = authResult.data;
  next();
};
