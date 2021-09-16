import { SongDataDoc } from '@mongo/schema/song-data';

export default class FormatService {
  public static getInBanlistFormat(template: string, songData: SongDataDoc): string {
    return template.replace('{TITLE}', songData.title).replace('{ARTIST}', songData.artist);
  }
}
