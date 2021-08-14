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
  jdn_code_name: string;
  title: string;
  artist: string;
  game: GameVersion;
  difficulty: number;
  coaches: number;
  effort: number | null;
  image_url: string;
  wiki_url: string;
  preview_url: string | null;
}

export type SongDataDoc = ISongData & Document;

const songDataSchema: Schema = new Schema({
  code_name: String,
  jdn_code_name: String,
  title: String,
  artist: String,
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
  },
  difficulty: Number,
  coaches: Number,
  effort: Number,
  image_url: String,
  wiki_url: String,
  preview_url: String,
});

const SongData: Model<SongDataDoc> = model<SongDataDoc>('SongData', songDataSchema);
export default SongData;
