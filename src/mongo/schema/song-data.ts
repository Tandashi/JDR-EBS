import { Document, Schema, Model, model } from 'mongoose';

export type GameVersion =
  | 'Just Dance 2016'
  | 'Just Dance 2017'
  | 'Just Dance 2018'
  | 'Just Dance 2019'
  | 'Just Dance 2020'
  | 'Just Dance 2021'
  | 'Just Dance Unlimited';

export interface ISongData {
  /**
   * The unique Identifier of the Song.
   */
  code_name: string;
  /**
   * The unique Identifier from JustDance Now
   * or null if the Song didn't exist in JustDance Now.
   */
  jdn_code_name: string | null;
  /**
   * The title of the Song.
   */
  title: string;
  /**
   * The Artist(s) of the Song.
   */
  artist: string;
  /**
   * The Game in which the Song exists.
   */
  game: GameVersion;
  /**
   * The difficulty of the Song
   * or null if not specified / unknown.
   *
   * **Value Ranges**: 1-4 for newer Games.
   */
  difficulty: number | null;
  /**
   * The number of coaches in the Song
   * or null if not specified / unknown.
   *
   * **Value Ranges**: 1-4 for newer Games.
   */
  coaches: number | null;
  /**
   * The effort value of the Song
   * or null if not specified / unknown.
   *
   * **Value Ranges**: 1-3 for newer Games.
   */
  effort: number | null;
  /**
   * The url to the Thumbnail of the Song.
   */
  image_url: string;
  /**
   * The url to the JustDance Wiki entry.
   */
  wiki_url: string;
  /**
   * The video preview of the Song
   * or null if none exists.
   */
  preview_url: string | null;
}

export type SongDataDoc = ISongData & Document;

const songDataSchema: Schema = new Schema({
  code_name: {
    type: String,
    required: true,
  },
  jdn_code_name: {
    type: String,
    // Sometimes doen't exist if the song is not from Just Dance Now
    required: false,
  },
  title: {
    type: String,
    required: true,
  },
  artist: {
    type: String,
    required: true,
  },
  game: {
    type: String,
    enum: [
      'Just Dance 2016',
      'Just Dance 2017',
      'Just Dance 2018',
      'Just Dance 2019',
      'Just Dance 2020',
      'Just Dance 2021',
      'Just Dance Unlimited',
    ],
    required: true,
  },
  difficulty: {
    type: Number,
    // Sometimes it doesnt exist
    required: false,
  },
  coaches: {
    type: Number,
    // Sometimes it doesnt exist
    required: false,
  },
  effort: {
    type: Number,
    // Sometimes it doesnt exist
    required: false,
  },
  image_url: {
    type: String,
    required: true,
  },
  wiki_url: {
    type: String,
    required: true,
  },
  preview_url: {
    type: String,
    // Sometimes there is no preview available
    required: false,
  },
});

const SongData: Model<SongDataDoc> = model<SongDataDoc>('SongData', songDataSchema);
export default SongData;
