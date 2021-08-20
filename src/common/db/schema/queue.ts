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
  enabled: {
    type: Boolean,
    required: true,
  },
  entries: {
    default: [],
    type: [
      {
        userId: {
          type: String,
          required: true,
        },
        username: {
          type: String,
          required: true,
        },
        fromChat: {
          type: Boolean,
          required: true,
        },
        song: {
          id: {
            type: String,
            required: [
              function(): boolean {
                // Only required if it is not from chat.
                return (this as IQueue).entries.every(
                  v => (v.fromChat && v.song.id !== undefined) || (!v.fromChat)
                );
              },
              'song.id is required if the entry is not from chat.'
            ],
          },
          title: {
            type: String,
            required: true,
          },
        },
      },
    ]
  },
});

const Queue: Model<QueueDoc> = model<QueueDoc>('Queue', queueSchema);
export default Queue;
