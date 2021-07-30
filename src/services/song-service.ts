import logger from '@base/logging';
import SongData, { ISongData } from '@base/models/schema/songdata';

export default class SongDataService {
  public static getSongData(songId: string): Promise<ISongData> {
    return new Promise((resolve, reject) => {
      SongData.findById(songId)
        .then((songdata: ISongData) => {
          resolve(songdata);
        })
        .catch((err: Error) => {
          logger.error(err);
          reject(err);
        });
    });
  }
}
