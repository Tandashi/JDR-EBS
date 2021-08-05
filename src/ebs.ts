// Needs to be the first thing that happens
// Registers the import aliases
import 'module-alias/register';
import APIServer from '@api/index';
import TwitchBot from '@twitch-bot/index';

new APIServer().start();
TwitchBot.getInstance().start();
