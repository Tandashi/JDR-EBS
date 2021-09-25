import getLogger from '@common/logging';

import type { IChatIntegrationConfiguration } from '@mongo/schema/streamer-configuration';
import StreamerConfigurationDao from '@mongo/dao/streamer-configuration-dao';
import TwitchBot from '@twitch-bot/index';

const logger = getLogger('Announce Service');

export default class AnnounceService {
  /**
   * Announce a message in a specific channel by it's Id.
   *
   * **Note:** Will only announce the message if the channel has the {@link IChatIntegrationConfiguration.enabled ChatIntegration} turned on.
   *
   * @param channelId The id of the channel to announce the message in
   * @param message The message that should be announced
   */
  public static async announce(channelId: string, message: string): Promise<void> {
    const streamerConfigurationResult = await StreamerConfigurationDao.get(channelId);

    if (streamerConfigurationResult.type === 'error') {
      logger.debug(`Getting StreamerConfiguration failed in announce: ${JSON.stringify(streamerConfigurationResult)}`);
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

      logger.debug(
        `Announcing: ${JSON.stringify({ channelName: configuration.chatIntegration.channelName, message: message })}`
      );
      TwitchBot.getInstance().sendMessage(configuration.chatIntegration.channelName, message);
    }
  }

  /**
   * Convert the provided string to an IRC friendly string.
   *
   * @param str The input string
   *
   * @returns The sanitised IRC frieldly string.
   */
  public static getChatFiendlyString(str: string): string {
    return str.replace(/(?<=\w)\.(?=\w)/g, ' ');
  }
}
