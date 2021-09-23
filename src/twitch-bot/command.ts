import tmi from 'tmi.js';

import TwitchBot from './index';

import { IChatIntegrationCommandConfiguration } from '@mongo/schema/streamer-configuration';

export interface ICommandParameters {
  /**
   * The channel name the message was sent in
   */
  channel: string;
  /**
   * The user state of the person who sent the message
   */
  userstate: tmi.Userstate;
  /**
   * The message that was sent
   */
  message: string;
  /**
   * The Twitch Bot instance
   */
  bot: TwitchBot;
}

export default interface ICommand {
  /**
   * Get the enabled status of the command for the provided command configuration
   *
   * @param configuration The configuration to check in if the command is enabled
   *
   * @returns Wether the command is enabled or not
   */
  enabled(configuration: IChatIntegrationCommandConfiguration): boolean;

  /**
   * Process the command with the given paramters
   *
   * @param params The command parameters
   */
  process(params: ICommandParameters): Promise<void>;
}
