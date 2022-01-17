import Dto from '@mongo/dto/dto';

import { IUserDataPopulated } from '@mongo/schema/user-data';
import SongDataDto, { SongDataJSONStructure } from './song-data-dto';

export interface UserDataJSONStructure {
  favouriteSongs: SongDataJSONStructure[];
}

const UserDataDto: Dto<IUserDataPopulated, UserDataJSONStructure> = {
  getJSON: (data: IUserDataPopulated) => {
    return {
      favouriteSongs: data.favouriteSongs.map(SongDataDto.getJSON),
    };
  },
};

export default UserDataDto;
