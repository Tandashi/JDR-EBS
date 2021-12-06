import getLogger from '@common/logging';
import QueueService from '@common/services/queue-service';

import { IChatIntegrationCommandConfiguration } from '@mongo/schema/streamer-configuration';

import ICommand, { ICommandParameters } from '@twitch-bot/command';
import Messages from '@twitch-bot/messages';

const logger = getLogger('Leave Command');

export default class LeaveCommand implements ICommand {
  enabled(configuration: IChatIntegrationCommandConfiguration): boolean {
    return configuration.leave.enabled;
  }

  async process({ channel, userstate, bot, message }: ICommandParameters): Promise<void> {
    if (!userstate['room-id']) {
      logger.error(`Userstate was malformed: ${userstate}`);
      return bot.sendMessage(channel, Messages.INTERNAL_ERROR, userstate);
    }

    const removePosition = message.split(' ')[1];

    const queueResult = await QueueService.getQueue(userstate['room-id']);
    if (queueResult.type === 'error') {
      let message;
      switch (queueResult.error) {
        case 'internal':
        default:
          message = 'There was an error retriving the queue. I am sorry :(.';
          break;
      }

      return bot.sendMessage(channel, message, userstate);
    }

    const queue = queueResult.data;
    const queueEntriesOfUser = queue.entries
      .map((entry, index) => {
        return { entry, index };
      })
      .filter((entry) => entry.entry.userId === userstate['user-id']);

    // Check if user has songs requested
    if (queueEntriesOfUser.length === 0) {
      return bot.sendMessage(channel, "You don't have any requested song(s) in the queue.", userstate);
    }

    // Check if user tries to remove a higher position then he has
    if (removePosition && parseInt(removePosition) > queueEntriesOfUser.length) {
      return bot.sendMessage(
        channel,
        `You can't remove your number ${removePosition} entry. You only have ${queueEntriesOfUser.length}.`,
        userstate
      );
    }

    // Implicitly remove index 0
    let indexToRemove: number = 0;

    // If entry list is bigger however update indexToRemove
    if (queueEntriesOfUser.length > 1) {
      const parsedRemovePosition = parseInt(removePosition);

      if (isNaN(parsedRemovePosition)) {
        return bot.sendMessage(channel, `Please provide a number as the position you'd like to remove.`, userstate);
      }

      indexToRemove = parsedRemovePosition - 1;
    }

    const removeEntry = queueEntriesOfUser[indexToRemove];
    const queueRemoveResult = await QueueService.removeFromQueue(userstate['room-id'], removeEntry.index);
    if (queueRemoveResult.type === 'error') {
      let message;
      switch (queueRemoveResult.error) {
        case 'internal':
        default:
          message = 'There was an error deleting your entry from the queue. I am sorry :(.';
          break;
      }

      return bot.sendMessage(channel, message, userstate);
    }

    return bot.sendMessage(
      channel,
      `Your song '${removeEntry.entry.song.title}' was successfully removed from the Queue.`,
      userstate
    );
  }
}
