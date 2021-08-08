import { Document, Schema, Model, model, ObjectId } from 'mongoose';

import { SongDataDoc } from '@db/schema/song-data';

interface SongConfiguration {
  unlimited: boolean;
}

interface ProfileConfiguration {
  song: SongConfiguration;
}

export interface IProfile {
  name: string;
  banlist: SongDataDoc[];
  configuration: ProfileConfiguration;
}

export type ProfileDoc = IProfile & Document;

const profileSchema: Schema = new Schema({
  name: String,
  banlist: [
    {
      type: Schema.Types.ObjectId,
      ref: 'SongData',
    },
  ],
  configuration: {
    song: {
      unlimited: Boolean,
    },
  },
});

const Profile: Model<ProfileDoc> = model<ProfileDoc>('Profile', profileSchema);
export default Profile;
