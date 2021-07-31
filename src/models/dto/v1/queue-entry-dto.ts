import DTO from '@models/dto/dto';
import { IQueueEntry } from '@base/models/schema/queue';

export interface QueueEntryJSONStructure {
  title: string;
  fromChat: boolean;
}

export default class QueueEntryDTO extends DTO<IQueueEntry, QueueEntryJSONStructure> {
  public getJSON(data: IQueueEntry): QueueEntryJSONStructure {
    return {
      title: data.song.title,
      fromChat: data.song.fromChat,
    };
  }
}
