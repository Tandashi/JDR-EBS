import { Document, Schema, Model, model, ObjectId } from 'mongoose';

import { SongDataDoc } from '@db/schema/song-data';

export interface IBanlist {
  name: string;
  entries: SongDataDoc[];
}

export type BanlistDoc = IBanlist & Document;

const banlistSchema: Schema = new Schema({
  name: String,
  entries: [
    {
      type: Schema.Types.ObjectId,
      ref: 'SongData',
    },
  ],
});

const Banlist: Model<BanlistDoc> = model<BanlistDoc>('Banlist', banlistSchema);
export default Banlist;
