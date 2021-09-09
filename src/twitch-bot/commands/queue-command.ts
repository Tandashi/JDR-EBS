import getLogger from '@common/logging';

import { IChatIntegrationCommandConfiguration } from '@db/schema/streamer-configuration';

import QueueService from '@services/queue-service';

import ICommand, { ICommandParameters } from '@twitch-bot/command';
import Messages from '@twitch-bot/messages';

const logger = getLogger('SongRequest Command');

export default class QueueCommand implements ICommand {
  enabled(configuration: IChatIntegrationCommandConfiguration): boolean {
    return configuration.queue.enabled;
  }

  async process({ channel, userstate, bot }: ICommandParameters): Promise<void> {
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
