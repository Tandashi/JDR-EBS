import logger from '@common/logging';

import { Result, Success, Failure } from '@common/result';
import Banlist, { BanlistDoc, IBanlist } from '@db/schema/banlist';

export default class BanlistDao {
  public static async createBanlist(name: string): Promise<Result<BanlistDoc>> {
    try {
      const banlist = await new Banlist(<IBanlist>{
        name: name,
        entries: [],
      }).save();

      return Success(banlist);
    } catch (e) {
      logger.error(e);
      return Failure('internal', 'Could not create Banlist');
    }
  }
}
