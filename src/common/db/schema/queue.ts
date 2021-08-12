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

export interface IQueue {
  enabled: boolean;
  entries: IQueueEntry[];
}

export type QueueDoc = IQueue & Document;

const queueSchema: Schema = new Schema({
  enabled: Boolean,
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

const Queue: Model<QueueDoc> = model<QueueDoc>('Queue', queueSchema);
export default Queue;
