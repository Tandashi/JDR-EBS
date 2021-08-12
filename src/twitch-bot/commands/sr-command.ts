import tmi from 'tmi.js';

import TwitchBot from '@twitch-bot/index';
import QueueService from '@services/queue-service';

export default class SRCommand {
  public static async process(
    channel: string,
    userstate: tmi.Userstate,
    message: string,
    bot: TwitchBot
  ): Promise<void> {
    const songTitle = message.split(' ')[1];

    if (!songTitle) {
      return bot.sendMessage(channel, 'No song title provided.');
    }

    const queueAddResult = await QueueService.addToQueue(
      userstate['room-id'],
      {
        fromChat: true,
        title: songTitle,
      },
      userstate['user-id']
    );

    if (queueAddResult.type === 'error') {
      let message;
      switch (queueAddResult.error) {
        case 'maximum-requests-exceeded':
          message = "You can't request any more songs right now. Wait till one of your songs has been played.";
          break;

        case 'song-already-queued':
          message = 'This song is already in the queue.';
          break;

        case 'queue-is-closed':
          message = 'The queue is currently closed';
          break;

        case 'internal':
        default:
          message = 'There was an error adding your song to the queue. I am sorry :(.';
          break;
      }

      return bot.sendMessage(channel, message, userstate);
    }

    return bot.sendMessage(channel, `Song "${songTitle}" was added to the Queue`, userstate);
  }
}
