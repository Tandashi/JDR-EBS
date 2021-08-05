import Dto from '@db/dto/dto';
import { QueueDoc } from '@db/schema/queue';
import QueueEntryDto, { QueueEntryJSONStructure } from '@db/dto/v1/queue-entry-dto';

interface QueueJSONStructure {
  entries: QueueEntryJSONStructure[];
}

const QueueDto: Dto<QueueDoc, QueueJSONStructure> = {
  getJSON: (data: QueueDoc) => {
    return {
      entries: data.entries.map((v) => QueueEntryDto.getJSON(v)),
    };
  },
};

export default QueueDto;
