import tmi from 'tmi.js';

import TwitchBot from './index';

import { IChatIntegrationCommandConfiguration } from '@mongo/schema/streamer-configuration';

export interface ICommandParameters {
  channel: string;
  userstate: tmi.Userstate;
  message: string;
  bot: TwitchBot;
}

export default interface ICommand {
  enabled(configuration: IChatIntegrationCommandConfiguration): boolean;
  process(params: ICommandParameters): Promise<void>;
}
