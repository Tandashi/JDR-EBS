import { Document, Schema, Model, model } from 'mongoose';

import { SongDataDoc } from '@mongo/schema/song-data';

interface IUserData {
  /**
   * The id of the channel.
   */
  channelId: string;
  /**
   * The list of favourited songs
   */
  favouriteSongs: SongDataDoc[] | string[];
}

export interface IUserDataPopulated extends IUserData {
  /**
   * The list of favourited songs
   */
  favouriteSongs: SongDataDoc[];
}

export interface IUserDataUnpopulated extends IUserData {
  /**
   * The list of favourited songs as ObjectId's
   */
  favouriteSongs: string[];
}

export type UserDataDoc = IUserData & Document;
export type UserDataDocPopulated = IUserDataPopulated & Document;
export type UserDataDocUnpopulated = IUserDataUnpopulated & Document;

const userDataSchema: Schema = new Schema({
  channelId: {
    type: String,
    unique: true,
    required: true,
  },
  favouriteSongs: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: 'SongData',
      },
    ],
    default: [],
  },
});

const UserData: Model<UserDataDoc> = model<UserDataDoc>('UserData', userDataSchema);
export default UserData;
