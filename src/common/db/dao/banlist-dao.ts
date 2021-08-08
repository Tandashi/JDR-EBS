import logger from '@common/logging';

import { Result, Success, Failure } from '@common/result';
import Banlist, { BanlistDoc, IBanlist } from '@db/schema/banlist';
import { PopulateOptions, UpdateQuery } from 'mongoose';

type BanlistPopulateOptions = {
  path: 'entries';
} & PopulateOptions;

export default class BanlistDao {
  public static async createBanlist(name: string): Promise<Result<BanlistDoc>> {
    try {
      const banlist = await new Banlist(<IBanlist>{
        name: name,
        entries: [],
      }).save();

      return Success(banlist);
    } catch (e) {
      logger.error((e as Error).message);
      return Failure('internal', 'Could not create Banlist');
    }
  }

  public static async update(
    id: string,
    updateQuery: UpdateQuery<IBanlist>,
    populate: BanlistPopulateOptions[]
  ): Promise<Result<BanlistDoc>> {
    try {
      const banlist = await Banlist.findOneAndUpdate({ _id: id }, updateQuery, { new: true });
      const populatedBanlist = await banlist.populate(populate).execPopulate();
      return Success(populatedBanlist);
    } catch (e) {
      return Failure('internal', 'Could not update Banlist');
    }
  }
}
