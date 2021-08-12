import logger from '@common/logging';

import StreamerConfigurationDao from '@db/dao/streamer-configuration-dao';
import TwitchBot from '@twitch-bot/index';

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

      TwitchBot.getInstance().sendMessage(configuration.chatIntegration.channelName, message);
    }
  }
}
