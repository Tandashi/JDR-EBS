import { PopulateOptions, UpdateQuery } from 'mongoose';

import getLogger from '@common/logging';
import { Result, Success, Failure } from '@common/result';

import Profile, { ProfileDoc, IProfile } from '@mongo/schema/profile';

type ProfilePopulateOptions = {
  path: 'banlist';
} & PopulateOptions;

const logger = getLogger('Profile Dao');

export default class ProfileDao {
  /**
   * Create a new Profile with a given name.
   *
   * @param name The name of the profile that should be created
   *
   * @returns The result of the operation
   */
  public static async createProfile(name: string): Promise<Result<ProfileDoc>> {
    try {
      const profileData: IProfile = {
        name: name,
        banlist: [],
        configuration: {
          song: {
            game: 'Just Dance 2021',
            unlimited: false,
          },
        },
      };

      const profile = await new Profile(profileData).save();

      return Success(profile);
    } catch (e) {
      logger.error(e);
      return Failure('internal', 'Could not create Profile');
    }
  }

  /**
   * Update a Profile by Id.
   *
   * @param id The id of the profile that should be updated
   * @param updateQuery The update Query
   * @param populate The population options for the update
   *
   * @returns The result of the operation
   */
  public static async update(
    id: string,
    updateQuery: UpdateQuery<IProfile>,
    populate: ProfilePopulateOptions[]
  ): Promise<Result<ProfileDoc>> {
    try {
      const profile = await Profile.findOneAndUpdate({ _id: id }, updateQuery, { new: true });

      if (!profile) {
        throw new Error('Could not update Profile. findOneAndUpdate returned null.');
      }

      const populatedProfile = await profile.populate(populate).execPopulate();
      return Success(populatedProfile);
    } catch (e) {
      return Failure('internal', 'Could not update Profile');
    }
  }
}
