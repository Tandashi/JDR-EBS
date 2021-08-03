import Dto from '@db/dto/dto';
import { IQueue } from '@db/schema/queue';
import QueueEntryDto, { QueueEntryJSONStructure } from '@db/dto/v1/queue-entry-dto';

interface QueueJSONStructure {
  entries: QueueEntryJSONStructure[];
}

const QueueDto: Dto<IQueue, QueueJSONStructure> = {
  getJSON: (data: IQueue) => {
    return {
      entries: data.entries.map((v) => QueueEntryDto.getJSON(v)),
    };
  },
};

export default QueueDto;
