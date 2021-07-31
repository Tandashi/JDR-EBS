import tmi from 'tmi.js';

import logger from '@base/logging';
import TwitchBot from '@base/twitch-bot';
import QueueService from '@base/services/queue-service';

import InternalError from '@base/errors/internal-error';
import MaximumRequestsExceededError from '@base/errors/maximum-requests-exceeded-error';
import SongAlreadyInQueueError from '@base/errors/song-already-in-queue-error';

export default class SRCommand {
  public static process(channel: string, userstate: tmi.Userstate, message: string, bot: TwitchBot): void {
    const songTitle = message.split(' ')[1];

    if (!songTitle) {
      return bot.sendMessage(channel, 'No song title provided.');
    }

    QueueService.addToQueue(
      userstate['room-id'],
      {
        fromChat: true,
        title: songTitle,
      },
      userstate['user-id']
    )
      .then(() => {
        bot.sendMessage(channel, `Song "${songTitle}" was added to the Queue`, userstate);
      })
      .catch((err: Error) => {
        if (err instanceof InternalError) {
          logger.error(err);
          return bot.sendMessage(
            channel,
            'There was an error adding your song to the queue. I am sorry :(.',
            userstate
          );
        } else if (err instanceof SongAlreadyInQueueError) {
          return bot.sendMessage(channel, 'This song is already in the queue.', userstate);
        } else if (err instanceof MaximumRequestsExceededError) {
          return bot.sendMessage(
            channel,
            "You can't request any more songs right now. Wait till one of your songs has been played.",
            userstate
          );
        }

        logger.error(err);
        return bot.sendMessage(channel, 'There was an error adding your song to the queue. I am sorry :(.', userstate);
      });
  }
}
