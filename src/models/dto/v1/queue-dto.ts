import { IQueue } from '@base/models/schema/queue';
import DTO from '@models/dto/dto';
import SongDataDTO, { SongDataJSONStructure } from './songdata-dto';

interface JSONStructure {
  channelId: string;
  entries: {
    song: SongDataJSONStructure;
  }[];
}

export default class QueueDTO extends DTO<IQueue, JSONStructure> {
  public getJSON(data: IQueue): JSONStructure {
    return {
      channelId: data.channelId,
      entries: data.entries.map((e) => {
        return {
          song: new SongDataDTO().getJSON(e.song),
        };
      }),
    };
  }
}
