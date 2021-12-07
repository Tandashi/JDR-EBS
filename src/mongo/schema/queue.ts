import { Document, Schema, Model, model } from 'mongoose';

/**
 * The base Song Queue Entry
 */
interface IQueueEntrySongDataBase {
  title: string;
}

/**
 * A Queue Entry that was submitted via the Extension
 */
interface IQueueEntrySongDataFromExtension extends IQueueEntrySongDataBase {
  id: string;
}

/**
 * A Queue Entry that was submitted via Chat
 */
interface IQueueEntrySongDataFromChat extends IQueueEntrySongDataBase {
  id?: string;
}

/**
 * The SongData Information of the QueueEntry
 */
export type IQueueEntrySongData = IQueueEntrySongDataFromExtension | IQueueEntrySongDataFromChat;

/**
 * The base Queue Entry
 */
export interface IQueueEntryBase {
  /**
   * The id of the user that submitted the entry.
   */
  userId: string;
  /**
   * The username of the user that submitted the entry.
   */
  username: string;
  /**
   * The state of the user that requested the entry.
   * Will give information about if the user is in chat and when he was last seen in chat.
   *
   * **Note**: Will be undefined for requests from mobile extension due to https://github.com/twitchdev/issues/issues/455.
   */
  userState: IQueueEntryUserState | undefined;
  /**
   * If the entry was submitted via Chat or via the Extension.
   */
  fromChat: boolean;
  /**
   * The SongData Information of the Queue Entry.
   */
  song: IQueueEntrySongData;
}

export interface IQueueEntryUserStateBase {
  /**
   * Wether the user is in the chat or not.
   */
  inChat: boolean;
  /**
   * The unix timestamp from when the user was last seen in chat.
   */
  lastSeen: number | undefined;
}

export interface IQueueEntryUserStateActive extends IQueueEntryUserStateBase {
  inChat: true;
  lastSeen: undefined;
}

export interface IQueueEntryUserStateInactive extends IQueueEntryUserStateBase {
  inChat: false;
  lastSeen: number;
}

export type IQueueEntryUserState = IQueueEntryUserStateActive | IQueueEntryUserStateInactive;

/**
 * A Queue Entry that was submitted via Chat.
 */
export interface IQueueEntryFromChat extends IQueueEntryBase {
  fromChat: true;
  song: IQueueEntrySongDataFromChat;
  userState: IQueueEntryUserState;
}

/**
 * A Queue Entry that was submitted via Extension.
 */
export interface IQueueEntryFromExtension extends IQueueEntryBase {
  fromChat: false;
  song: IQueueEntrySongDataFromExtension;
}

/**
 * A Queue Entry.
 */
export type IQueueEntry = IQueueEntryFromChat | IQueueEntryFromExtension;

export interface IQueue {
  /**
   * If the Queue is currently open or not.
   */
  enabled: boolean;
  /**
   * The entries in the Queue.
   */
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
        userState: {
          required: false,

          inChat: {
            type: Boolean,
            required: true,
          },
          lastSeen: {
            type: Number,
            required: false,
          },
        },
        fromChat: {
          type: Boolean,
          required: true,
        },
        song: {
          id: {
            type: String,
            required: [
              function (): boolean {
                // Only required if it is not from chat.
                return (this as IQueue).entries.every((v) => (v.fromChat && v.song.id !== undefined) || !v.fromChat);
              },
              'song.id is required if the entry is not from chat.',
            ],
          },
          title: {
            type: String,
            required: true,
          },
        },
      },
    ],
  },
});

const Queue: Model<QueueDoc> = model<QueueDoc>('Queue', queueSchema);
export default Queue;
