import { Document, Schema, Model, model } from 'mongoose';

interface IQueueEntrySongDataBase {
  title: string;
}

interface IQueueEntrySongDataFromExtension extends IQueueEntrySongDataBase {
  fromChat: false;
  id: string;
}

interface IQueueEntrySongDataFromChat extends IQueueEntrySongDataBase {
  fromChat: true;
  id?: string;
}

export type IQueueEntrySongData = IQueueEntrySongDataFromExtension | IQueueEntrySongDataFromChat;

export interface IQueueEntry {
  userId: string;
  song: IQueueEntrySongData;
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
      song: {
        id: String,
        fromChat: Boolean,
        title: String,
      },
    },
  ],
});

const Queue: Model<IQueue> = model<IQueue>('Queue', queueSchema);
export default Queue;
