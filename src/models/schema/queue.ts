import { Document, Schema, Model, model } from 'mongoose';
import { ISongData } from './songdata';

export interface IQueueEntry {
  userId: string;
  song: ISongData;
}

export interface IQueue extends Document {
  channelId: string;
  entries: IQueueEntry[];
}

const queueSchema: Schema = new Schema({
  channelId: Number,
  entries: [
    {
      userId: String,
      song: { type: Schema.Types.ObjectId, ref: 'SongData' },
    },
  ],
});

const Queue: Model<IQueue> = model<IQueue>('Queue', queueSchema);
export default Queue;
