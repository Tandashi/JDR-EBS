// Needs to be the first thing that happens
// Registers the import aliases
import 'module-alias/register';
import express from 'express';
import mongoose from 'mongoose';

import cors from 'cors';

import config from '@common/config';
import getLogger from '@common/logging';
import BaseRouter from '@api/routes/router';
import StreamlabsRouter from '@api/routes/streamlabs/router';
import { logErrors } from '@api/middleware/error-handler';

const logger = getLogger('API');

const DEFAULT_MONGOOSE_CONNECTION_PARAMS = {
  keepAlive: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
};

export default class APIServer {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.config();
    this.routes();
    this.mongo();
  }

  public routes(): void {
    this.app.use('/api', BaseRouter);
    this.app.use('/streamlabs', StreamlabsRouter);
  }

  public config(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use('/static', express.static(config.esb.static.rootDir));
    this.app.use(cors());
    this.app.use(logErrors);
  }

  private mongo(): void {
    const connection = mongoose.connection;

    connection.on('connected', () => {
      logger.info('Mongo Connection Established');
    });

    connection.on('reconnected', () => {
      logger.info('Mongo Connection Reestablished');
    });

    connection.on('disconnected', () => {
      logger.info('Mongo Connection Disconnected');
      logger.info('Trying to reconnect to Mongo ...');

      setTimeout(() => {
        mongoose.connect(config.mongodb.uri, {
          socketTimeoutMS: 3000,
          connectTimeoutMS: 3000,
          ...DEFAULT_MONGOOSE_CONNECTION_PARAMS,
        });
      }, 3000);
    });

    connection.on('close', () => {
      logger.info('Mongo Connection Closed');
    });

    connection.on('error', (error: Error) => {
      logger.error('Mongo Connection ERROR: ' + error.message);
    });

    const run = async () => {
      await mongoose.connect(config.mongodb.uri, DEFAULT_MONGOOSE_CONNECTION_PARAMS);
    };

    run().catch((e) => logger.error(e));
  }

  public start(): void {
    this.app.listen(config.esb.port, config.esb.hostname, () => {
      logger.info(`API is running at ${config.esb.protocol}://${config.esb.hostname}:${config.esb.port}`);
    });
  }
}
