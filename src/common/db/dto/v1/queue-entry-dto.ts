import Dto from '@db/dto/dto';
import { IQueueEntry } from '@db/schema/queue';

export interface QueueEntryJSONStructure {
  title: string;
  fromChat: boolean;
}

const QueueEntryDto: Dto<IQueueEntry, QueueEntryJSONStructure> = {
  getJSON: (data: IQueueEntry) => {
    return {
      title: data.song.title,
      fromChat: data.song.fromChat,
    };
  },
};

export default QueueEntryDto;
