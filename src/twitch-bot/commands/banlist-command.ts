import tmi from 'tmi.js';

import TwitchBot from '@twitch-bot/index';
import ProfileService from '@services/profile-service';
import AnnounceService from '@common/services/announce-service';

export default class BanlistCommand {
  public static async process(channel: string, userstate: tmi.Userstate, bot: TwitchBot): Promise<void> {
    const profileResult = await ProfileService.getActive(userstate['room-id']);

    if (profileResult.type === 'error') {
      let message;
      switch (profileResult.error) {
        case 'internal':
        default:
          message = 'There was an error retriving the banlist. I am sorry :(.';
          break;
      }

      return bot.sendMessage(channel, message, userstate);
    }

    const bannedSongs = profileResult.data.banlist.map((v) => `${v.title} - ${v.artist}`).join(', ') || '-';
    return bot.sendMessage(channel, `The following songs are banned: ${bannedSongs}`, userstate);
  }
}
