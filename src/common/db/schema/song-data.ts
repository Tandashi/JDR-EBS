import { Document, Schema, Model, model } from 'mongoose';

export interface ISongData {
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

export type SongDataDoc = ISongData & Document;

const songDataSchema: Schema = new Schema({
  title: String,
  artist: String,
  original_source: String,
  source: String,
  img_url: String,
  preview_video_url: String,
  difficulty: Number,
  unlimited: Boolean,
  coaches: Number,
  effort: Number,
});

const SongData: Model<SongDataDoc> = model<SongDataDoc>('SongData', songDataSchema);
export default SongData;
