import tmi from 'tmi.js';

import TwitchBot from '@twitch-bot/index';
import BanlistService from '@common/services/banlist-service';

export default class BanlistCommand {
  public static async process(channel: string, userstate: tmi.Userstate, bot: TwitchBot): Promise<void> {
    const banlistResult = await BanlistService.getActive(userstate['room-id']);

    if (banlistResult.type === 'error') {
      let message;
      switch (banlistResult.error) {
        case 'internal':
        default:
          message = 'There was an error retriving the banlist. I am sorry :(.';
          break;
      }

      return bot.sendMessage(channel, message, userstate);
    }

    const bannedSongs = banlistResult.data.entries.map((v) => `${v.title} - ${v.artist}`).join(', ') || '-';
    return bot.sendMessage(channel, `The following songs are banned: ${bannedSongs}`, userstate);
  }
}
