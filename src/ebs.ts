// Needs to be the first thing that happens
// Registers the import aliases
import 'module-alias/register';

import APIServer from '@api/index';
import TwitchBot from '@twitch-bot/index';
import SocketIOServer from '@socket-io/index';
import MongoServer from '@mongo/index';

const MONGO = MongoServer.getInstance();
const API = APIServer.getInstance();
const BOT = TwitchBot.getInstance();
const SOCKETIO = SocketIOServer.getInstance();

// Start MongoDB Connection
MONGO.connect();

// Start Socket.IO and API Server
SOCKETIO.start(API.app);

// Start Twitch Bot
BOT.start();
