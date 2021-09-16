import getLogger from '@common/logging';
const logger = getLogger('Configuration');

//#region Interface definitions
interface IStaticConfig {
  rootDir: string;
  imageDir: string;
  videoDir: string;
}

interface ISocketIOConfig {
  cors: {
    origin: string | boolean;
    allowedHeaders: string;
    methods: string;
    credentials: boolean;
  };
}

interface IESBConfig {
  protocol: string;
  hostname: string;
  port: number;

  publicAddress: string;

  socketIO: ISocketIOConfig;

  static: IStaticConfig;
}

interface IMongoDBConfig {
  uri: string;
}

interface TwitchReleaseVersion {
  isDev: false;
  versionNumber: string;
  fileHash: string;
}

interface TwitchDevelopVersion {
  isDev: true;
}

interface ITwitchConfig {
  api: {
    clientId: string;
    clientSecret: string;
  };
  extension: {
    version: TwitchDevelopVersion | TwitchReleaseVersion;
    clientId: string;
    jwtSecret: string;
  };
  bot: {
    username: string;
    oauthToken: string;
  };
}

export interface IConfig {
  esb: IESBConfig;
  mongodb: IMongoDBConfig;
  twitch: ITwitchConfig;
}
//#endregion

/**
 * Parses the origin from the configuration file
 *
 * @param origin The origin to parse
 *
 * @returns The correct value type
 */
function parseOrigin(origin: string | undefined): string | boolean {
  if (origin === 'true') return true;

  if (origin !== undefined) return origin;

  // Disable CORS
  return false;
}

//#region Environment Variables processing and validation

//#region App
const APP_PROTOCOL = process.env['APP_PROTOCOL'] || 'http';
const APP_HOSTNAME = process.env['APP_HOSTNAME'] || 'localhost';
const APP_PORT = parseInt(process.env['APP_PORT'] || '3000');

const APP_PUBLIC_ADDRESS = process.env['APP_PUBLIC_ADDRESS'];
if (!APP_PUBLIC_ADDRESS) {
  logger.error('No public address provided. Set APP_PUBLIC_ADDRESS environment variable.');
  process.exit(1);
}

const STATIC_ROOT_DIR = process.env['STATIC_ROOT_DIR'] || 'static';
const STATIC_IMAGE_DIR = process.env['STATIC_IMAGE_DIR'] || 'images';
const STATIC_VIDEO_DIR = process.env['STATIC_VIDEO_DIR'] || 'videos';

const SOCKETIO_CORS_ORIGIN = parseOrigin(process.env.SOCKETIO_CORS_ORIGINS);
const SOCKETIO_CORS_ALLOWED_HEADERS = process.env.SOCKETIO_CORS_ALLOWED_HEADERS || '';
const SOCKETIO_CORS_ALLOWED_METHODS = process.env.SOCKETIO_CORS_METHODS || 'GET,HEAD,PUT,PATCH,POST,DELETE';
const SOCKETIO_CORS_CREDENTIALS = process.env.SOCKETIO_CORS_CREDENTIALS === 'true' || true;
//#endregion

//#region Twitch
const BOT_USERNAME = process.env['BOT_USERNAME'];
if (!BOT_USERNAME) {
  logger.error('No bot username provided. Set BOT_USERNAME environment variable.');
  process.exit(1);
}

const BOT_OAUTH_TOKEN = process.env['BOT_OAUTH_TOKEN'];
if (!BOT_OAUTH_TOKEN) {
  logger.error('No bot oauth token provided. Set BOT_OAUTH_TOKEN environment variable.');
  process.exit(1);
}

const API_CLIENT_ID = process.env['API_CLIENT_ID'];
if (!API_CLIENT_ID) {
  logger.error('No api client id provided. Set API_CLIENT_ID environment variable.');
  process.exit(1);
}

const API_CLIENT_SECRET = process.env['API_CLIENT_SECRET'];
if (!API_CLIENT_SECRET) {
  logger.error('No api client secret provided. Set API_CLIENT_SECRET environment variable.');
  process.exit(1);
}

const EXTENSION_VERSION = process.env['EXTENSION_VERSION'];
if (!EXTENSION_VERSION) {
  logger.error('No extension version provided. Set EXTENSION_VERSION environment variable.');
  process.exit(1);
}

const EXTENSION_FILE_HASH = process.env['EXTENSION_FILE_HASH'];
if (!EXTENSION_FILE_HASH) {
  logger.error('No extension file hash provided. Set EXTENSION_FILE_HASH environment variable.');
  process.exit(1);
}

const EXTENSION_CLIENT_ID = process.env['EXTENSION_CLIENT_ID'];
if (!EXTENSION_CLIENT_ID) {
  logger.error('No extension client id provided. Set EXTENSION_CLIENT_ID environment variable.');
  process.exit(1);
}

const JWT_SECRET = process.env['JWT_SECRET'];
if (!JWT_SECRET) {
  logger.error('No jsonwebtoken secret provided. Set JWT_SECRET environment variable.');
  process.exit(1);
}
//#endregion

//#region MongoDB
const MONGODB_URI = process.env['MONGODB_URI'];
if (!MONGODB_URI) {
  logger.error('No mongo connection string. Set MONGODB_URI environment variable.');
  process.exit(1);
}
//#endregion

//#endregion

const config: IConfig = {
  esb: {
    protocol: APP_PROTOCOL,
    hostname: APP_HOSTNAME,
    port: APP_PORT,

    publicAddress: APP_PUBLIC_ADDRESS,

    socketIO: {
      cors: {
        origin: SOCKETIO_CORS_ORIGIN,
        methods: SOCKETIO_CORS_ALLOWED_METHODS,
        allowedHeaders: SOCKETIO_CORS_ALLOWED_HEADERS,
        credentials: SOCKETIO_CORS_CREDENTIALS,
      },
    },

    static: {
      rootDir: STATIC_ROOT_DIR,
      imageDir: STATIC_IMAGE_DIR,
      videoDir: STATIC_VIDEO_DIR,
    },
  },
  mongodb: {
    uri: MONGODB_URI,
  },
  twitch: {
    api: {
      clientId: API_CLIENT_ID,
      clientSecret: API_CLIENT_SECRET,
    },
    extension: {
      version:
        EXTENSION_VERSION === 'dev'
          ? { isDev: true }
          : { isDev: false, versionNumber: EXTENSION_VERSION, fileHash: EXTENSION_FILE_HASH },
      clientId: EXTENSION_CLIENT_ID,
      jwtSecret: JWT_SECRET,
    },
    bot: {
      username: BOT_USERNAME,
      oauthToken: BOT_OAUTH_TOKEN,
    },
  },
};
export default config;
