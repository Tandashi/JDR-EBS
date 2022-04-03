import getLogger from '@common/logging';
import QueueService from '@common/services/queue-service';

import { IChatIntegrationCommandConfiguration } from '@mongo/schema/streamer-configuration';

import ICommand, { ICommandParameters } from '@twitch-bot/command';
import Messages from '@twitch-bot/messages';

const logger = getLogger('Banlist Command');

export default class ToggleQueueCommand implements ICommand {
  private toggleStatus: boolean;

  constructor(toggleStatus: boolean) {
    this.toggleStatus = toggleStatus;
  }

  enabled(configuration: IChatIntegrationCommandConfiguration): boolean {
    return configuration.toggleQueue.enabled;
  }

  async process({ channel, userstate, bot }: ICommandParameters): Promise<void> {
    if (!userstate['room-id']) {
      logger.error(`Userstate was malformed: ${userstate}`);
      return bot.sendMessage(channel, Messages.INTERNAL_ERROR, userstate);
    }

    if (!(userstate.mod || userstate['user-id'] === userstate['room-id'])) {
      return;
    }

    const queueResult = await QueueService.setQueueStatus(userstate['room-id'], this.toggleStatus);

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
  }
}
