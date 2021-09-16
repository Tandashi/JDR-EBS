// Needs to be the first thing that happens
// Registers the import aliases
import 'module-alias/register';
import express from 'express';

import cors from 'cors';

import config from '@common/config';
import getLogger from '@common/logging';
import BaseRouter from '@api/routes/router';
import StreamlabsRouter from '@api/routes/streamlabs/router';
import { logErrors } from '@api/middleware/error-handler';

const logger = getLogger('API');

export default class APIServer {
  private static instance: APIServer;
  public app: express.Application;

  private constructor() {
    this.app = express();
    this.registerMiddleware();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.app.use('/api', BaseRouter);
    this.app.use('/streamlabs', StreamlabsRouter);
  }

  private registerMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use('/static', express.static(config.esb.static.rootDir));
    this.app.use(cors());
    this.app.use(logErrors);
  }

  public static getInstance(): APIServer {
    if (!this.instance) {
      this.instance = new APIServer();
    }

    return this.instance;
  }
}
