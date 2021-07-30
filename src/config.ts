//#region Interface definitions
interface AppConfig {
  protocol: string;
  hostname: string;
  port: number;
}

interface MongoDBConfig {
  uri: string;
}

interface TwitchConfig {
  secret: string;
}

interface Config {
  app: AppConfig;
  mongodb: MongoDBConfig;
  twitch: TwitchConfig;
}
//#endregion

//#region Environment Variables processing and validation

//#region App
const APP_PROTOCOL = process.env['APP_PROTOCOL'] || 'http';
const APP_HOSTNAME = process.env['APP_HOSTNAME'] || 'localhost';
const APP_PORT = parseInt(process.env['APP_PORT'] || '3000');
//#endregion

//#region Twitch
const JWT_SECRET = process.env['JWT_SECRET'];
if (!JWT_SECRET) {
  console.log('No jsonwebtoken secret provided. Set JWT_SECRET environment variable.');
  process.exit(1);
}
//#endregion

//#region MongoDB
const MONGODB_URI = process.env['MONGODB_URI'];
if (!MONGODB_URI) {
  console.log('No mongo connection string. Set MONGODB_URI environment variable.');
  process.exit(1);
}
//#endregion

//#endregion

const config: Config = {
  app: {
    protocol: APP_PROTOCOL,
    hostname: APP_HOSTNAME,
    port: APP_PORT,
  },
  mongodb: {
    uri: MONGODB_URI,
  },
  twitch: {
    secret: JWT_SECRET,
  },
};
export default config;
