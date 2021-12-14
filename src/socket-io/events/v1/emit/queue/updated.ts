import { IQueue, QueueDoc } from '@mongo/schema/queue';
import QueueDto, { QueueJSONStructure } from '@mongo/dto/v1/queue-dto';

import { EmitSocketIOEvent } from '@socket-io/event';

export default class QueueUpdatedEmitEvent extends EmitSocketIOEvent<QueueJSONStructure> {
  private queueData: IQueue;

  constructor(queueData: QueueDoc) {
    super();
    this.queueData = queueData.toObject();
  }

  get name(): string {
    return 'v1/queue:updated';
  }

  data(): QueueJSONStructure {
    return QueueDto.getJSON(this.queueData);
  }
}
