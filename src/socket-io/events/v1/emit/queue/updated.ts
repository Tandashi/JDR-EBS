import { IQueue } from '@mongo/schema/queue';
import QueueDto, { QueueJSONStructure } from '@mongo/dto/v1/queue-dto';

import { EmitSocketIOEvent } from '@socket-io/event';

export default class QueueUpdatedEmitEvent extends EmitSocketIOEvent<QueueJSONStructure> {
  private queueData: IQueue;

  constructor(queueData: IQueue) {
    super();
    this.queueData = queueData;
  }

  get name(): string {
    return 'v1/queue:updated';
  }

  data(): QueueJSONStructure {
    return QueueDto.getJSON(this.queueData);
  }
}
