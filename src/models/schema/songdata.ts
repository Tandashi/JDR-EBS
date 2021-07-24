import { Document, Schema, Model, model } from 'mongoose';

export interface ISongData extends Document {
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

const songDataSchema: Schema = new Schema({
  title: String,
  arsist: String,
  original_source: String,
  source: String,
  img_url: String,
  preview_video_url: String,
  difficulty: Number,
  unlimited: Boolean,
  coaches: Number,
  effort: Number,
});

const SongData: Model<ISongData> = model<ISongData>('SongData', songDataSchema);
export default SongData;