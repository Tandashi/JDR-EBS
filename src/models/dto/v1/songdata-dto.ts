import { ISongData } from '@base/models/schema/songdata';
import DTO from '@models/dto/dto';

export interface SongDataJSONStructure {
  id: string;
  title: string;
  artist: string;
  original_source?: string;
  source: string;
  img_url: string;
  preview_video_url?: string;
  difficulty: number;
  unlimited: boolean;
  coaches: number;
  effort: number | null;
}

export default class SongDataDTO extends DTO<ISongData, SongDataJSONStructure> {
  public getJSON(data: ISongData): SongDataJSONStructure {
    return {
      id: data._id,
      title: data.title,
      artist: data.artist,
      original_source: data.original_source,
      source: data.source,
      img_url: data.img_url,
      preview_video_url: data.preview_video_url,
      difficulty: data.difficulty,
      unlimited: data.unlimited,
      coaches: data.coaches,
      effort: data.effort,
    };
  }
}
