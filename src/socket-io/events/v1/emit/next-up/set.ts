import { IQueueEntry } from '@mongo/schema/queue';
import QueueEntryDto, { QueueEntryJSONStructure } from '@mongo/dto/v1/queue-entry-dto';

import { EmitSocketIOEvent } from '@socket-io/event';

export default class NextUpSetEmitEvent extends EmitSocketIOEvent<QueueEntryJSONStructure> {
  private entry: IQueueEntry;

  constructor(entry: IQueueEntry) {
    super();
    this.entry = entry;
  }

  get name(): string {
    return 'v1/next-up:set';
  }

  data(): QueueEntryJSONStructure {
    return QueueEntryDto.getJSON(this.entry);
  }
}
