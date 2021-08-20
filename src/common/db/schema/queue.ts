import { Document, Schema, Model, model } from 'mongoose';

interface IQueueEntrySongDataBase {
  title: string;
}

interface IQueueEntrySongDataFromExtension extends IQueueEntrySongDataBase {
  id: string;
}

interface IQueueEntrySongDataFromChat extends IQueueEntrySongDataBase {
  id?: string;
}

export type IQueueEntrySongData = IQueueEntrySongDataFromExtension | IQueueEntrySongDataFromChat;

export interface IQueueEntryBase {
  userId: string;
  username: string;
  fromChat: boolean;
  song: IQueueEntrySongData;
}

export interface IQueueEntryFromChat extends IQueueEntryBase {
  fromChat: true;
  song: IQueueEntrySongDataFromChat;
}

export interface IQueueEntryFromExtension extends IQueueEntryBase {
  fromChat: false;
  song: IQueueEntrySongDataFromExtension;
}

export type IQueueEntry = IQueueEntryFromChat | IQueueEntryFromExtension;

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
      username: String,
      fromChat: Boolean,
      song: {
        id: String,
        title: String,
      },
    },
  ],
});

const Queue: Model<QueueDoc> = model<QueueDoc>('Queue', queueSchema);
export default Queue;
