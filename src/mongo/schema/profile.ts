import { Document, Schema, Model, model } from 'mongoose';

import { GameVersion, SongDataDoc } from '@mongo/schema/song-data';

interface SongConfiguration {
  game: GameVersion;
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
  name: {
    type: String,
    required: true,
  },
  banlist: {
    default: [],
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: 'SongData',
      },
    ],
  },
  configuration: {
    song: {
      game: {
        type: String,
        required: true,
      },
      unlimited: {
        type: Boolean,
        required: true,
      },
    },
  },
});

const Profile: Model<ProfileDoc> = model<ProfileDoc>('Profile', profileSchema);
export default Profile;
