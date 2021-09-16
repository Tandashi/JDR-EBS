import jsonwebtoken from 'jsonwebtoken';

import config from '@common/config';
import { Failure, Result, Success } from '@common/result';

import StreamerDataDao from '@mongo/dao/streamer-data-dao';

export const AuthJWT = (token: string): Result<TwitchUser> => {
  try {
    // Verify if the token is correct
    // Decode the secret since Twitch provides it as a base64 string
    const jwt = jsonwebtoken.verify(token, Buffer.from(config.twitch.extension.jwtSecret, 'base64'), {
      algorithms: ['HS256'],
    });

    // Return the Twitch User
    return Success(jwt as TwitchUser);
  } catch (e) {
    return Failure('internal', e);
  }
};

export const AuthSecret = async (key: string): Promise<Result<TwitchUser, 'internal' | 'no-such-entity'>> => {
  const streamerDataResult = await StreamerDataDao.getBySecret(key as string);
  if (streamerDataResult.type === 'error') {
    return streamerDataResult;
  }

  // Return the Twitch User
  return Success({
    channel_id: streamerDataResult.data.channelId,
    role: 'broadcaster',
    user_id: '-1',
    opaque_user_id: '-1',
  });
};
