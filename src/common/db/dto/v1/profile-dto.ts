import Dto from '@db/dto/dto';
import { IProfile } from '@db/schema/profile';
import SongDataDto, { SongDataJSONStructure } from '@db/dto/v1/song-data-dto';

export interface ProfileJSONStructure {
  name: string;
  banlist: SongDataJSONStructure[];
  configuration: {
    song: {
      game: string;
      unlimited: boolean;
    };
  };
}

const ProfileDto: Dto<IProfile, ProfileJSONStructure> = {
  getJSON: (data: IProfile) => {
    return {
      name: data.name,
      banlist: data.banlist.map(SongDataDto.getJSON),
      configuration: {
        song: {
          game: data.configuration.song.game,
          unlimited: data.configuration.song.unlimited,
        },
      },
    };
  },
};

export default ProfileDto;
