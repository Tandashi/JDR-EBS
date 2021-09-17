import { Socket } from 'socket.io';

import { SocketIOResponseCallback } from '@services/response-service';

export type SocketIOEventListener<D = {}> = (data: D, callback: SocketIOResponseCallback) => Promise<void>;

abstract class SocketIOEvent {
  abstract get name(): string;
}

export abstract class EmitSocketIOEvent<D> extends SocketIOEvent {
  abstract data(): D;
}

export abstract class ReceiveSocketIOEvent<D = {}> extends SocketIOEvent {
  abstract listener(socket: Socket): SocketIOEventListener<D>;
}
