import Dto from '@mongo/dto/dto';
import { IQueueEntry } from '@mongo/schema/queue';

export interface QueueEntryJSONStructure {
  title: string;
  fromChat: boolean;
  username: string;
}

const QueueEntryDto: Dto<IQueueEntry, QueueEntryJSONStructure> = {
  getJSON: (data: IQueueEntry) => {
    return {
      title: data.song.title,
      fromChat: data.fromChat,
      username: data.username
    };
  },
};

export default QueueEntryDto;
