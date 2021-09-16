import { Socket } from 'socket.io';

import getLogger from '@common/logging';
import * as Auth from '@common/auth';

enum AuthMethod {
  JWT = 'jwt',
  SECRET = 'secret',
}

const logger = getLogger('Authentication SocketIO Middleware');

export const AuthJWTOrSecret = async (socket: Socket, next: () => void): Promise<void> => {
  const authMethod: AuthMethod = socket.handshake.auth.method;
  const authToken: string = socket.handshake.auth.token;

  switch (authMethod) {
    case AuthMethod.JWT:
      return AuthJWT(socket, authToken, next);

    case AuthMethod.SECRET:
      return AuthSecret(socket, authToken, next);

    default:
      break;
  }
};

const AuthSecret = async (socket: Socket, token: string, next: () => void): Promise<void> => {
  if (!token) {
    // TODO: Send Error
  }

  const twitchUserResult = await Auth.AuthSecret(token);
  if (twitchUserResult.type === 'error') {
    switch (twitchUserResult.error) {
      case 'no-such-entity':
      // TODO: Send response
      case 'internal':
      default:
      // TODO: Send response
    }
  }

  // TODO Set User

  next();
};

const AuthJWT = (socket: Socket, token: string, next: () => void): void => {
  const user = Auth.AuthJWT(token);

  // TODO: Set the User on the request

  next();
};
