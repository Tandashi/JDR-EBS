import DTO from '@models/dto/dto';
import { IQueue } from '@base/models/schema/queue';
import QueueEntryDTO, { QueueEntryJSONStructure } from '@models/dto/v1/queue-entry-dto';

interface QueueJSONStructure {
  channelId: string;
  entries: QueueEntryJSONStructure[];
}

export default class QueueDTO extends DTO<IQueue, QueueJSONStructure> {
  public getJSON(data: IQueue): QueueJSONStructure {
    return {
      channelId: data.channelId,
      entries: data.entries.map((v) => new QueueEntryDTO().getJSON(v)),
    };
  }
}
