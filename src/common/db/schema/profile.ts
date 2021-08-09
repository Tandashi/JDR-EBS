import { Document, Schema, Model, model, ObjectId } from 'mongoose';

import { SongDataDoc } from '@db/schema/song-data';

interface SongConfiguration {
  game: string;
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
      game: String,
      unlimited: Boolean,
    },
  },
});

const Profile: Model<ProfileDoc> = model<ProfileDoc>('Profile', profileSchema);
export default Profile;