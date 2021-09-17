import Dto from '@mongo/dto/dto';
import { IQueue } from '@mongo/schema/queue';
import QueueEntryDto, { QueueEntryJSONStructure } from '@mongo/dto/v1/queue-entry-dto';

export interface QueueJSONStructure {
  enabled: boolean;
  entries: QueueEntryJSONStructure[];
}

const QueueDto: Dto<IQueue, QueueJSONStructure> = {
  getJSON: (data: IQueue) => {
    return {
      enabled: data.enabled,
      entries: data.entries.map(QueueEntryDto.getJSON),
    };
  },
};

export default QueueDto;
