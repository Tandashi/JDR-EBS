// Needs to be the first thing that happens
// Registers the import aliases
import 'module-alias/register';
import http from 'http';
import socketIO from 'socket.io';

import getLogger from '@common/logging';
import config from '@common/config';

import { AuthJWTOrSecret } from '@socket-io/middleware/auth';
import QueueGetReceiveEvent from '@socket-io/events/v1/receive/queue/get';
import { EmitSocketIOEvent, ReceiveSocketIOEvent } from '@socket-io/event';
import NextUpClearReceiveEvent from './events/v1/receive/next-up/clear';

const logger = getLogger('Socket.IO');

/**
 * The SocketIO Server class.
 * It will provide the SocketIO Server as well as all needed functions for emitting Events.
 */
export default class SocketIOServer {
  private static instance: SocketIOServer;
  private server: http.Server;
  private io: socketIO.Server;

  private constructor() {
    // Construct the SocketIO Server instance
    this.io = new socketIO.Server({
      path: '/socket.io',

      // Disable serving the socket-io client files
      // (https://socket.io/docs/v4/server-options/#serveclient)
      serveClient: false,

      // Below are engine.IO options
      pingInterval: 10000,
      pingTimeout: 5000,

      // Don't use cookies. We dont need them.
      cookie: false,

      // Cross-origin options
      cors: config.esb.socketIO.cors,
    });

    this.onConnection = this.onConnection.bind(this);

    this.registerHandlers();
    this.registerMiddleware();
  }

  /**
   * Register all the middleware on the SocketIO Server.
   */
  private registerMiddleware(): void {
    this.io.use(AuthJWTOrSecret);
  }

  /**
   * Register the base SocketIO Handlers on the SocketIO Server.
   */
  private registerHandlers(): void {
    this.io.on('connection', this.onConnection);
  }

  /**
   * Register an Event for a given Socket.
   *
   * @param socket The socket for which the Event should be registered
   * @param event The event that should be registered
   */
  private registerEvent(socket: socketIO.Socket, event: ReceiveSocketIOEvent): void {
    socket.on(event.name, event.listener(socket));
  }

  /**
   * Emit an Event to all the connected Sockets in the room of the provided channel Id.
   *
   * @param channelId The channel Id in which the Event should be emitted
   * @param event The Event that should be emitted
   */
  public emitEvent(channelId: string, event: EmitSocketIOEvent<any>): void {
    logger.debug(`Emitting Event (${event.name}) to channel '${channelId}' with data ${JSON.stringify(event.data())}`);

    this.io.to(channelId).emit(event.name, event.data());
  }

  /**
   * The SocketIO 'connection' Event handler.
   *
   * @param socket The socket that connected to the SocketIO Server
   */
  private onConnection(socket: socketIO.Socket): void {
    const user: TwitchUser = socket.handshake.auth.user;
    logger.debug(`Connection from user (${socket.id}). Joining room '${user.channel_id}'`);
    // Let socket join channel room
    socket.join(user.channel_id);

    this.registerEvent(socket, new QueueGetReceiveEvent());
    this.registerEvent(socket, new NextUpClearReceiveEvent());

    socket.on('disconnect', () => {
      logger.debug(`Connection closed user (${socket.id})`);
    });
  }

  /**
   * Start the SocketIO Server.
   * This will also automatically start the express WebServer.
   *
   * @param app The express Server/Application
   */
  public start(app: Express.Application): void {
    // Create Http Server
    this.server = http.createServer(app);

    // Attach Http Server to SocketIO Server
    this.io.attach(this.server);

    this.server.listen(config.esb.port, config.esb.hostname, () => {
      logger.info(`Socket.IO / API is running at ${config.esb.protocol}://${config.esb.hostname}:${config.esb.port}`);
    });
  }

  /**
   * Get the SocketIO Server Instance.
   *
   * @returns The SocketIO Server Instance
   */
  public static getInstance(): SocketIOServer {
    if (!this.instance) {
      this.instance = new SocketIOServer();
    }

    return this.instance;
  }
}
