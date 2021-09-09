import getLogger from '@common/logging';

import { IChatIntegrationCommandConfiguration } from '@db/schema/streamer-configuration';
import queue, { IQueueEntry } from '@db/schema/queue';

import QueueService from '@services/queue-service';

import ICommand, { ICommandParameters } from '@twitch-bot/command';
import Messages from '@twitch-bot/messages';

const logger = getLogger('Queue Position Command');

export default class QueuePositionCommand implements ICommand {
  enabled(configuration: IChatIntegrationCommandConfiguration): boolean {
    return configuration.queuePosition.enabled;
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

    const queueEntries = queueResult.data.entries
      .filter((e) => e.userId === userstate['user-id'])
      .map((e, i) => `${i + 1}.: ${e.song.title}`);

    if (queueEntries.length === 0) {
      return bot.sendMessage(channel, "You haven't requested any songs yet.", userstate);
    }

    return bot.sendMessage(channel, queueEntries.join(', '), userstate);
  }
}
