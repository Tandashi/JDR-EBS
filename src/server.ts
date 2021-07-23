// Needs to be the first thing that happens
// Registers the import aliases
import 'module-alias/register';
import express from 'express';
import mongoose from 'mongoose';

import config from './config';

import cors from 'cors';

import BaseRouter from '@routes/router';

const DEFAULT_MONGOOSE_CONNECTION_PARAMS = {
  keepAlive: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
};

class Server {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.config();
    this.routes();
    this.mongo();
  }

  public routes(): void {
    this.app.use('/api', BaseRouter);
  }

  public config(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(cors());
  }

  private mongo() {
    const connection = mongoose.connection;
    connection.on('connected', () => {
      console.log('Mongo Connection Established');
    });
    connection.on('reconnected', () => {
      console.log('Mongo Connection Reestablished');
    });
    connection.on('disconnected', () => {
      console.log('Mongo Connection Disconnected');
      console.log('Trying to reconnect to Mongo ...');
      setTimeout(() => {
        mongoose.connect(config.mongodb.uri, {
          socketTimeoutMS: 3000,
          connectTimeoutMS: 3000,
          ...DEFAULT_MONGOOSE_CONNECTION_PARAMS,
        });
      }, 3000);
    });
    connection.on('close', () => {
      console.log('Mongo Connection Closed');
    });
    connection.on('error', (error: Error) => {
      console.log('Mongo Connection ERROR: ' + error);
    });

    const run = async () => {
      await mongoose.connect(config.mongodb.uri, DEFAULT_MONGOOSE_CONNECTION_PARAMS);
    };
    run().catch((error) => console.error(error));
  }

  public start(): void {
    this.app.listen(config.app.port, config.app.hostname, () => {
      console.log('API is running at %s://%s:%d', config.app.protocol, config.app.hostname, config.app.port);
    });
  }
}

new Server().start();
