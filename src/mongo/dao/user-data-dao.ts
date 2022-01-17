import mongoose, { ClientSession, PopulateOptions, UpdateQuery } from 'mongoose';

import getLogger from '@common/logging';
import { Result, Success, Failure } from '@common/result';
import UserData, {
  IUserDataUnpopulated,
  UserDataDoc,
  UserDataDocPopulated,
  UserDataDocUnpopulated,
} from '@mongo/schema/user-data';

const logger = getLogger('UserData Dao');

export type UserDataPopulateOptions = {
  path: 'favouriteSongs';
} & PopulateOptions;

export default class UserDataDao {
  /**
   * Get the Streamer Data for a given channel or
   * create it if the Streamer Data for that channel doesn't exist yet.
   *
   * @param channelId The id of the channel to get / create the Streamer Data for
   * @param populate The population options
   *
   * @returns The result of the operation
   */
  public static async getOrCreateUserData<T = UserDataDocUnpopulated | UserDataDocPopulated>(
    channelId: string,
    populate?: UserDataPopulateOptions[]
  ): Promise<Result<T>> {
    const session = await mongoose.connection.startSession();
    session.startTransaction({ writeConcern: { w: 'majority' } });

    try {
      let result: Result<T> | undefined = undefined;
      const userData = (await UserData.findOne(
        {
          channelId: channelId,
        },
        {},
        { session }
      ).populate(populate)) as unknown as T;

      if (!userData) {
        logger.info('User Data was not found creating.');
        result = await this.createUserData<T>(channelId, session, populate);
      } else {
        result = Success(userData);
      }

      await session.commitTransaction();

      if (!result) {
        throw Error('Result should have been set');
      }

      return result;
    } catch (e) {
      logger.error(e);

      return Failure('internal', 'Could not retrive UserData');
    } finally {
      session.endSession();
    }
  }

  private static async createUserData<T = UserDataDocUnpopulated | UserDataDocPopulated>(
    channelId: string,
    session: ClientSession,
    populate?: UserDataPopulateOptions[]
  ): Promise<Result<T>> {
    try {
      const userDataData: IUserDataUnpopulated = {
        channelId: channelId,
        favouriteSongs: [],
      };

      const userData = await new UserData(userDataData).save({ session });

      const populatedData: T = (await userData.populate(populate ?? []).execPopulate()) as unknown as T;

      return Success(populatedData);
    } catch (e) {
      return Failure('internal', 'Could not create User Data');
    }
  }

  /**
   * Update UserData by user's channel id
   *
   * @param channelId the channel id of the user whos user data should be updated
   * @param updateQuery The update query
   * @param populate The population options
   *
   * @returns The result of the operation
   */
  public static async updateByChannelId<T = UserDataDocUnpopulated | UserDataDocPopulated>(
    channelId: string,
    updateQuery: UpdateQuery<IUserDataUnpopulated>,
    populate: UserDataPopulateOptions[]
  ): Promise<Result<T>> {
    try {
      const configuration = await UserData.findOneAndUpdate({ channelId }, updateQuery, { new: true });

      if (!configuration) {
        throw new Error('Could not update UserData because findOneAndUpdate returned null.');
      }

      const populatedConfiguration: T = (await configuration.populate(populate).execPopulate()) as unknown as T;
      return Success(populatedConfiguration);
    } catch (e) {
      return Failure('internal', `Could not update UserData. ${e}`);
    }
  }
}
