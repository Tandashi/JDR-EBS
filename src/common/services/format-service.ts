import { SongDataDoc } from '@mongo/schema/song-data';

export default class FormatService {
  /**
   * Get the Banlist formated using the provided template string.
   *
   * **Format**:\
   *  {TITLE} - gets replaced by {@link SongDataDoc.title Song Title}\
   *  {ARTIST} - gets replaced by {@link SongDataDoc.artist Song Artist}
   *
   * @example
   * ```typescript
   * // Returns 'I am blue from Lollipop'
   * getFormattedSongData(
   *  '{TITLE} from {ARTIST}',
   *  { title: 'I am blue', artist: 'Lollipop', ... }
   * )
   * ```
   *
   * @param template The template string to use
   * @param songData The song data to populate the template string with
   *
   * @returns The populated template string
   */
  public static getFormattedSongData(template: string, songData: SongDataDoc): string {
    return template.replace('{TITLE}', songData.title).replace('{ARTIST}', songData.artist);
  }
}
