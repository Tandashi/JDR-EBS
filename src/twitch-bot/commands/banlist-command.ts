import getLogger from '@common/logging';

import StreamerConfigurationDao from '@mongo/dao/streamer-configuration-dao';
import { IChatIntegrationCommandConfiguration } from '@mongo/schema/streamer-configuration';

import FormatService from '@services/format-service';

import ICommand, { ICommandParameters } from '@twitch-bot/command';
import Messages from '@twitch-bot/messages';

const logger = getLogger('Banlist Command');

export default class BanlistCommand implements ICommand {
  enabled(configuration: IChatIntegrationCommandConfiguration): boolean {
    return configuration.banlist.enabled;
  }

  async process({ channel, userstate, bot }: ICommandParameters): Promise<void> {
    if (!userstate['room-id']) {
      logger.error(`Userstate was malformed: ${userstate}`);
      return bot.sendMessage(channel, Messages.INTERNAL_ERROR, userstate);
    }

    const configurationResult = await StreamerConfigurationDao.get(userstate['room-id']);

    if (configurationResult.type === 'error') {
      let message;
      switch (configurationResult.error) {
        case 'internal':
        default:
          message = 'There was an error retriving the banlist. I am sorry :(.';
          break;
      }

      return bot.sendMessage(channel, message, userstate);
    }

    const configuration = configurationResult.data;
    const profile = configuration.profile.active;
    const format = configuration.chatIntegration.commands.banlist.format;
    const bannedSongs = profile.banlist.map((v) => FormatService.getFormattedSongData(format, v)).join(', ') || '-';
    // No need for the Announcement Service since we already have the channel name
    // And the command can only be executed when chatIntegration is on
    return bot.sendMessage(channel, `The following songs are banned: ${bannedSongs}`, userstate);
  }
}
