import tmi from 'tmi.js';

import getLogger from '@common/logging';

import QueueService from '@services/queue-service';

import TwitchBot from '@twitch-bot/index';
import Messages from '@twitch-bot/messages';

const logger = getLogger('SongRequest Command');

export default class SRCommand {
  public static async process(
    channel: string,
    userstate: tmi.Userstate,
    message: string,
    bot: TwitchBot
  ): Promise<void> {
    const songTitle = message.split('!sr ')[1];
    if (!songTitle) {
      return bot.sendMessage(channel, Messages.NO_SONG_TITLE_PROVIDED, userstate);
    }

    if (!userstate['room-id'] || !userstate['user-id'] || !userstate['display-name']) {
      logger.error(`Userstate was malformed: ${userstate}`);
      return bot.sendMessage(channel, Messages.INTERNAL_ERROR, userstate);
    }

    const queueAddResult = await QueueService.addToQueue(
      userstate['room-id'],
      {
        userId: userstate['user-id'],
        username: userstate['display-name'],
        fromChat: true,
        song: {
          title: songTitle,
        },
      },
      userstate['user-id']
    );

    if (queueAddResult.type === 'error') {
      let message;
      switch (queueAddResult.error) {
        case 'maximum-requests-exceeded':
          message = Messages.MAXIMUM_REQUESTS_EXCEEDED;
          break;

        case 'song-already-queued':
          message = Messages.SONG_ALREADY_IN_QUEUE;
          break;

        case 'queue-is-closed':
          message = Messages.QUEUE_CLOSED;
          break;

        case 'internal':
        default:
          message = Messages.INTERNAL_ERROR;
          break;
      }

      return bot.sendMessage(channel, message, userstate);
    }

    return bot.sendMessage(channel, `Song "${songTitle}" was added to the Queue`, userstate);
  }
}
