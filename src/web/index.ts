// Needs to be the first thing that happens
// Registers the import aliases
import 'module-alias/register';
import express from 'express';

import cors from 'cors';

import config from '@common/config';
import APIRouter from '@web/routes/api/router';
import StreamlabsRouter from '@web/routes/streamlabs/router';
import HealthRouter from '@web/routes/health/router';
import { logErrors } from '@web/middleware/error-handler';

export default class WebServer {
  private static instance: WebServer;
  public app: express.Application;

  private constructor() {
    this.app = express();
    this.registerMiddleware();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.app.use('/api', APIRouter);
    this.app.use('/streamlabs', StreamlabsRouter);
    this.app.use('/health', HealthRouter);
  }

  private registerMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use('/static', express.static(config.esb.static.rootDir));
    this.app.use(cors());
    this.app.use(logErrors);
  }

  public static getInstance(): WebServer {
    if (!this.instance) {
      this.instance = new WebServer();
    }

    return this.instance;
  }
}
