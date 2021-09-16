// Needs to be the first thing that happens
// Registers the import aliases
import 'module-alias/register';
import http from 'http';
import socketIO from 'socket.io';

import getLogger from '@common/logging';
import config from '@common/config';
import { AuthJWTOrSecret } from './middleware/auth';

const logger = getLogger('Socket.IO');

export default class SocketIOServer {
  private static instance: SocketIOServer;
  private server: http.Server;
  private io: socketIO.Server;

  private constructor() {
    this.io = new socketIO.Server({
      path: '/socket.io',
      serveClient: false,
      // below are engine.IO options
      pingInterval: 10000,
      pingTimeout: 5000,
      cookie: false,
      cors: config.esb.socketIO.cors,
    });

    this.registerHandlers();
    this.registerMiddleware();
  }

  private registerMiddleware(): void {
    this.io.use(AuthJWTOrSecret);
  }

  private registerHandlers(): void {
    this.io.on('connection', this.onConnection);
  }

  private onConnection(socket: socketIO.Socket): void {
    socket.on('hello', () => {
      socket.emit('world');
    });

    socket.on('disconnect', () => {});
  }

  public start(app: Express.Application): void {
    // Create Http Server
    this.server = http.createServer(app);

    // Attach Http Server to SocketIO Server
    this.io.attach(this.server);

    this.server.listen(config.esb.port, config.esb.hostname, () => {
      logger.info(`Socket.IO / API is running at ${config.esb.protocol}://${config.esb.hostname}:${config.esb.port}`);
    });
  }

  public static getInstance(): SocketIOServer {
    if (!this.instance) {
      this.instance = new SocketIOServer();
    }

    return this.instance;
  }
}
