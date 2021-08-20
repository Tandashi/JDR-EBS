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
    required: true
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
