import DTO from '@models/dto/dto';
import { IQueue } from '@base/models/schema/queue';
import QueueEntryDTO, { QueueEntryJSONStructure } from '@models/dto/v1/queue-entry-dto';

interface QueueJSONStructure {
  channelId: string;
  entries: QueueEntryJSONStructure[];
}

const QueueDTO: DTO<IQueue, QueueJSONStructure> = {
  getJSON: (data: IQueue) => {
    return {
      channelId: data.channelId,
      entries: data.entries.map((v) => QueueEntryDTO.getJSON(v)),
    };
  },
};

export default QueueDTO;
