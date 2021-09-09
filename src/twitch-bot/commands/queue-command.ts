import tmi from 'tmi.js';

import getLogger from '@common/logging';

import QueueService from '@services/queue-service';

import TwitchBot from '@twitch-bot/index';
import Messages from '@twitch-bot/messages';

const logger = getLogger('SongRequest Command');

export default class QueueCommand {
  public static async process(channel: string, userstate: tmi.Userstate, bot: TwitchBot): Promise<void> {
    if (!userstate['room-id'] || !userstate['user-id'] || !userstate['display-name']) {
      logger.error(`Userstate was malformed: ${userstate}`);
      return bot.sendMessage(channel, Messages.INTERNAL_ERROR, userstate);
    }

    const queueResult = await QueueService.getQueue(userstate['room-id']);

    if (queueResult.type === 'error') {
      let message;
      switch (queueResult.error) {
        case 'internal':
        default:
          message = Messages.INTERNAL_ERROR;
          break;
      }

      return bot.sendMessage(channel, message, userstate);
    }

    const queue = queueResult.data.entries.map((e) => e.song.title);
    return bot.sendMessage(channel, `Queue: ${queue.join(', ')}`, userstate);
  }
}
