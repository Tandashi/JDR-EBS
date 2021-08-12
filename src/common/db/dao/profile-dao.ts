import { PopulateOptions, UpdateQuery } from 'mongoose';

import logger from '@common/logging';
import { Result, Success, Failure } from '@common/result';

import Profile, { ProfileDoc, IProfile } from '@db/schema/profile';

type ProfilePopulateOptions = {
  path: 'banlist';
} & PopulateOptions;

export default class ProfileDao {
  public static async createProfile(name: string): Promise<Result<ProfileDoc>> {
    try {
      const profileData: IProfile = {
        name: name,
        banlist: [],
        configuration: {
          song: {
            game: '',
            unlimited: false,
          },
        },
      };

      const profile = await new Profile(profileData).save();

      return Success(profile);
    } catch (e) {
      logger.error((e as Error).message);
      return Failure('internal', 'Could not create Profile');
    }
  }

  public static async update(
    id: string,
    updateQuery: UpdateQuery<IProfile>,
    populate: ProfilePopulateOptions[]
  ): Promise<Result<ProfileDoc>> {
    try {
      const profile = await Profile.findOneAndUpdate({ _id: id }, updateQuery, { new: true });
      const populatedProfile = await profile.populate(populate).execPopulate();
      return Success(populatedProfile);
    } catch (e) {
      return Failure('internal', 'Could not update Profile');
    }
  }
}
