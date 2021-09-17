// Needs to be the first thing that happens
// Registers the import aliases
import 'module-alias/register';
import http from 'http';
import socketIO from 'socket.io';

import getLogger from '@common/logging';
import config from '@common/config';

import { AuthJWTOrSecret } from '@socket-io/middleware/auth';
import QueueGetReceiveEvent from '@socket-io/events/v1/receive/queue/get';
import { EmitSocketIOEvent, ReceiveSocketIOEvent } from './event';

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

    this.onConnection = this.onConnection.bind(this);

    this.registerHandlers();
    this.registerMiddleware();
  }

  private registerMiddleware(): void {
    this.io.use(AuthJWTOrSecret);
  }

  private registerHandlers(): void {
    this.io.on('connection', this.onConnection);
  }

  private registerEvent(socket: socketIO.Socket, event: ReceiveSocketIOEvent): void {
    socket.on(event.name, event.listener(socket));
  }

  private onConnection(socket: socketIO.Socket): void {
    const user: TwitchUser = socket.handshake.auth.user;
    logger.debug(`Connection from user (${socket.id}). Joining room '${user.channel_id}'`);
    // Let socket join channel room
    socket.join(user.channel_id);

    this.registerEvent(socket, new QueueGetReceiveEvent());

    socket.on('disconnect', () => {
      logger.debug(`Connection closed user (${socket.id})`);
    });
  }

  public emit(channelId: string, event: EmitSocketIOEvent<any>): void {
    logger.debug(`Emitting Event (${event.name}) to channel '${channelId}' with data ${JSON.stringify(event.data())}`);

    this.io.to(channelId).emit(event.name, event.data());
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
