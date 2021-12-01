import lodash from 'lodash';

import getLogger from '@common/logging';

import StreamerConfigurationDao from '@mongo/dao/streamer-configuration-dao';
import TwitchBot from '@twitch-bot/index';
import { Userstate } from 'tmi.js';

const logger = getLogger('Announce Service');

export type IAnnouncementEvent =
  | 'queue.status.opened'
  | 'queue.status.closed'
  | 'queue.status.cleared'
  | 'queue.song.fromChat'
  | 'queue.song.fromExtension'
  | 'queue.song.nextUp';

export default class AnnounceService {
  /**
   * Announce a message in a specific channel by it's Id.
   *
   * **Note:** Will only announce the message if the channel has the {@link IChatIntegrationConfiguration.enabled ChatIntegration} turned on
   *           and the event type was enabled.
   *
   * @param channelId The id of the channel to announce the message in
   * @param message The message that should be announced
   */
  public static async announce(
    channelId: string,
    message: string,
    event: IAnnouncementEvent,
    replyTo?: Userstate
  ): Promise<void> {
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

      const isEventEnabled = lodash.get(configuration.chatIntegration.announcements, event, false);
      if (!isEventEnabled) {
        logger.debug(`Not announcing since announcements for event type ${event} are not enabled.`);
        return;
      }

      logger.debug(
        `Announcing: ${JSON.stringify({ channelName: configuration.chatIntegration.channelName, message: message })}`
      );
      TwitchBot.getInstance().sendMessage(configuration.chatIntegration.channelName, message, replyTo);
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
