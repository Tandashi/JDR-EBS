import { Db } from 'mongodb';
import { MigrationInterface } from 'mongo-migrate-ts';

import { IStreamerConfiguration } from '@mongo/schema/streamer-configuration';

export class ThemeMigration implements MigrationInterface {
  async up(db: Db): Promise<void> {
    const documentIterator = db.collection('streamerconfigurations').find({ version: 'v1.3' });

    while (await documentIterator.hasNext()) {
      const document = await documentIterator.next();

      const newDocument: IStreamerConfiguration = {
        ...document,
        version: 'v1.4',
        theme: {
          liveConfig: {
            css: '',
          },
        },
      };

      await db.collection('streamerconfigurations').findOneAndReplace({ _id: document._id }, newDocument);
    }
  }

  async down(): Promise<void> {
    throw Error('Not supported!');
  }
}
