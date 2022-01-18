import { EmitSocketIOEvent } from '@socket-io/event';

import { SongDataDoc } from '@mongo/schema/song-data';
import SongDataDto, { SongDataJSONStructure } from '@mongo/dto/v1/song-data-dto';

export default class SongDataFilteredUpdatedEmitEvent extends EmitSocketIOEvent<SongDataJSONStructure[]> {
  private songDatas: SongDataDoc[];

  constructor(songDatas: SongDataDoc[]) {
    super();
    this.songDatas = songDatas;
  }

  get name(): string {
    return 'v1/songdata:filtered-updated';
  }

  data(): SongDataJSONStructure[] {
    return this.songDatas.map((songdata) => SongDataDto.getJSON(songdata)).sort((a, b) => (a.title > b.title ? 1 : -1));
  }
}
