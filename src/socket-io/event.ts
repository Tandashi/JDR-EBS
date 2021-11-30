import { Socket } from 'socket.io';

import { SocketIOResponseCallback } from '@services/response-service';

export type SocketIOEventListener<D = {}> = (data: D, callback: SocketIOResponseCallback<any>) => Promise<void>;

/**
 * A basic SocketIO Event
 */
abstract class SocketIOEvent {
  /**
   * The name of the SocketIO Event
   */
  abstract get name(): string;
}

/**
 * The base class for an Emittable SocketIO Event
 */
export abstract class EmitSocketIOEvent<D> extends SocketIOEvent {
  /**
   * Get the data the event emits
   *
   * @returns The emitted data
   */
  abstract data(): D;
}

/**
 * The base class for an Receivable SocketIO Event
 */
export abstract class ReceiveSocketIOEvent<D = {}> extends SocketIOEvent {
  /**
   * Get the listener for the Event
   *
   * @param socket The socket on which the Event should be listened on
   *
   * @returns The listener for the Event specific to the given socket
   */
  abstract listener(socket: Socket): SocketIOEventListener<D>;
}
