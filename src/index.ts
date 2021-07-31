// Needs to be the first thing that happens
// Registers the import aliases
import 'module-alias/register';
import Server from '@base/server';
import TwitchBot from '@base/twitch-bot';

new Server().start();
new TwitchBot().start();
