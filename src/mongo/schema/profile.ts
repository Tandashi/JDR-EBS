import { Document, Schema, Model, model } from 'mongoose';

import { GameVersion, SongDataDoc } from '@mongo/schema/song-data';

interface ISongConfiguration {
  /**
   * The Version of Just Dance that is used.
   */
  game: GameVersion;
  /**
   * If an unlimited Subscription exists.
   */
  unlimited: boolean;
}

interface IProfileConfiguration {
  /**
   * The {@link ISongConfiguration Song Configuration} of the Profile.
   */
  song: ISongConfiguration;
}

export interface IProfile {
  /**
   * The name of the Profile.
   */
  name: string;
  /**
   * The Songs that are banned.
   */
  banlist: SongDataDoc[];
  /**
   * Additional {@link IProfileConfiguration Configuration} for the Profile.
   */
  configuration: IProfileConfiguration;
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
