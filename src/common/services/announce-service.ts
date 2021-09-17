import getLogger from '@common/logging';

import StreamerConfigurationDao from '@mongo/dao/streamer-configuration-dao';
import TwitchBot from '@twitch-bot/index';

const logger = getLogger('Announce Service');

export default class AnnounceService {
  public static async announce(channelId: string, message: string): Promise<void> {
    const streamerConfigurationResult = await StreamerConfigurationDao.get(channelId);

    if (streamerConfigurationResult.type === 'error') {
      return;
    }

    const configuration = streamerConfigurationResult.data;

    if (configuration.chatIntegration.enabled) {
      if (configuration.chatIntegration.channelName === '') {
        logger.error(
          `Configuration (${channelId}) is malformed. Chat Integration is activated but channel name is emtpy.`
        );

        return;
      }

      logger.debug(`Announcing in channel (${configuration.chatIntegration.channelName}): ${message}`);
      TwitchBot.getInstance().sendMessage(configuration.chatIntegration.channelName, message);
    }
  }

  public static getChatFiendlyString(str: string): string {
    return str.replace(/(?<=\w)\.(?=\w)/g, ' ');
  }
}
