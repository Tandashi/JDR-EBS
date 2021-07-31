import DTO from '@models/dto/dto';
import { IQueueEntry } from '@base/models/schema/queue';

export interface QueueEntryJSONStructure {
  title: string;
  fromChat: boolean;
}

const QueueEntryDTO: DTO<IQueueEntry, QueueEntryJSONStructure> = {
  getJSON: (data: IQueueEntry) => {
    return {
      title: data.song.title,
      fromChat: data.song.fromChat,
    };
  },
};

export default QueueEntryDTO;
