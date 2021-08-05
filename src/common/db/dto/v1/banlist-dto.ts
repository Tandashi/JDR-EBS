import Dto from '@db/dto/dto';
import { IBanlist } from '@db/schema/banlist';
import SongDataDto, { SongDataJSONStructure } from '@common/db/dto/v1/song-data-dto';

interface BanlistJSONStructure {
  name: string;
  entries: SongDataJSONStructure[];
}

const BanlistDto: Dto<IBanlist, BanlistJSONStructure> = {
  getJSON: (data: IBanlist) => {
    return {
      name: data.name,
      entries: data.entries.map((v) => SongDataDto.getJSON(v)),
    };
  },
};

export default BanlistDto;
