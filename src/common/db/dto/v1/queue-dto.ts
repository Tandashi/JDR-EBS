import Dto from '@db/dto/dto';
import { QueueDoc } from '@db/schema/queue';
import QueueEntryDto, { QueueEntryJSONStructure } from '@db/dto/v1/queue-entry-dto';

export interface QueueJSONStructure {
  enabled: boolean;
  entries: QueueEntryJSONStructure[];
}

const QueueDto: Dto<QueueDoc, QueueJSONStructure> = {
  getJSON: (data: QueueDoc) => {
    return {
      enabled: data.enabled,
      entries: data.entries.map(QueueEntryDto.getJSON),
    };
  },
};

export default QueueDto;
