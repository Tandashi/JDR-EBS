import URLService from '@services/url-service';

import Dto from '@mongo/dto/dto';
import { GameVersion, SongDataDoc } from '@mongo/schema/song-data';

export interface SongDataJSONStructure {
  id: string;
  code_name: string;
  jdn_code_name: string | null;
  title: string;
  artist: string;
  game: GameVersion;
  difficulty: number | null;
  coaches: number | null;
  effort: number | null;
  image_url: string;
  wiki_url: string;
  preview_url: string | undefined;
}

const SongDataDto: Dto<SongDataDoc, SongDataJSONStructure> = {
  getJSON: (data: SongDataDoc) => {
    return {
      id: data._id,
      code_name: data.code_name,
      jdn_code_name: data.jdn_code_name,
      title: data.title,
      artist: data.artist,
      game: data.game,
      difficulty: data.difficulty,
      coaches: data.coaches,
      effort: data.effort,
      image_url: data.image_url !== null && data.image_url !== undefined ? URLService.getImageUrl(data.image_url) : '',
      wiki_url: data.wiki_url,
      preview_url:
        data.preview_url !== null && data.preview_url !== undefined
          ? URLService.getVideoUrl(data.preview_url)
          : undefined,
    };
  },
};

export default SongDataDto;
