import { Socket } from 'socket.io';

import SocketIOServer from '@socket-io/index';
import { ReceiveSocketIOEvent, SocketIOEventListener } from '@socket-io/event';
import NextUpClearedEmitEvent from '@socket-io/events/v1/emit/next-up/clear';

export default class NextUpClearReceiveEvent extends ReceiveSocketIOEvent {
  get name(): string {
    return 'v1/next-up:clear';
  }

  listener(socket: Socket): SocketIOEventListener {
    return async (): Promise<void> => {
      const user: TwitchUser = socket.handshake.auth.user;
      SocketIOServer.getInstance().emitChannelEvent(user.channel_id, new NextUpClearedEmitEvent());
    };
  }
}
