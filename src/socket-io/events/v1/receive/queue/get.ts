import { Socket } from 'socket.io';

import QueueDto from '@mongo/dto/v1/queue-dto';

import ResponseService, { ErrorResponseCode, SocketIOResponseCallback } from '@services/response-service';
import QueueService from '@services/queue-service';
import { ReceiveSocketIOEvent, SocketIOEventListener } from '@socket-io/event';

const SocketIOResponseService = ResponseService.getSocketInstance();

export default class QueueGetReceiveEvent extends ReceiveSocketIOEvent {
  get name(): string {
    return 'v1/queue:get';
  }

  listener(socket: Socket): SocketIOEventListener {
    return async (_, callback: SocketIOResponseCallback<any>): Promise<void> => {
      const user: TwitchUser = socket.handshake.auth.user;

      const queueResult = await QueueService.getQueue(user.channel_id);
      if (queueResult.type === 'error') {
        return SocketIOResponseService.sendInternalError(callback, ErrorResponseCode.COULD_NOT_RETRIVE_QUEUE);
      }

      SocketIOResponseService.sendOk(callback, {
        // Convert to lean Object so we preserve undefined
        // Else undefined schema props will be converted to {}
        // from mongoose in Documents
        data: QueueDto.getJSON(queueResult.data.toObject()),
      });
    };
  }
}
