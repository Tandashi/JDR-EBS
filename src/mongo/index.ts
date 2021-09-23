// Needs to be the first thing that happens
// Registers the import aliases
import 'module-alias/register';
import mongoose from 'mongoose';

import getLogger from '@common/logging';
import config from '@common/config';

const logger = getLogger('Mongo Server');

const DEFAULT_MONGOOSE_CONNECTION_PARAMS = {
  keepAlive: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
};

/**
 * The MongoServer class.
 * Manages everything related to the mongoDB Server.
 */
export default class MongoServer {
  private static instance: MongoServer;

  private constructor() {
    this.registerHandlers();
  }

  /**
   * Register Connection Handlers.
   */
  private registerHandlers(): void {
    const connection = mongoose.connection;

    connection.on('connected', () => {
      logger.info('Connection Established');
    });

    connection.on('reconnected', () => {
      logger.info('Connection Reestablished');
    });

    connection.on('disconnected', () => {
      logger.info('Connection Disconnected');
      logger.info('Trying to reconnect ...');

      setTimeout(() => {
        mongoose.connect(config.mongodb.uri, {
          socketTimeoutMS: 3000,
          connectTimeoutMS: 3000,
          ...DEFAULT_MONGOOSE_CONNECTION_PARAMS,
        });
      }, 3000);
    });

    connection.on('close', () => {
      logger.info('Connection Closed');
    });

    connection.on('error', (error: Error) => {
      logger.error('Connection ERROR: ' + error.message);
    });
  }

  /**
   * Connect to the mongo database.
   */
  public connect(): void {
    const run = async () => {
      mongoose.connect(config.mongodb.uri, DEFAULT_MONGOOSE_CONNECTION_PARAMS);
    };

    run().catch((e) => logger.error(e));
  }

  /**
   * Get the MongoServer Instance.
   *
   * @returns The MongoServer Instance
   */
  public static getInstance(): MongoServer {
    if (!this.instance) {
      this.instance = new MongoServer();
    }

    return this.instance;
  }
}
