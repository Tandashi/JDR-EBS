import Dto from '@mongo/dto/dto';

export type GamesJSONStructure = string[];

const GamesDto: Dto<string[], GamesJSONStructure> = {
  getJSON: (data: string[]) => {
    return data.filter((e) => e !== 'Just Dance Unlimited');
  },
};

export default GamesDto;
