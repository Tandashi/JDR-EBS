import { Db } from 'mongodb';
import { MigrationInterface } from 'mongo-migrate-ts';

import { IStreamerConfiguration } from '@mongo/schema/streamer-configuration';

export class AnnouncementMigration implements MigrationInterface {
  async up(db: Db): Promise<void> {
    const documentIterator = db.collection('streamerconfigurations').find({ version: 'v1.2' });

    while (await documentIterator.hasNext()) {
      const document = await documentIterator.next();

      const newDocument: IStreamerConfiguration = {
        ...document,
        version: 'v1.3',
        chatIntegration: {
          ...document.chatIntegration,
          announcements: {
            queue: {
              status: {
                opened: true,
                closed: true,
                cleared: true,
              },
              song: {
                fromChat: true,
                fromExtension: true,
                nextUp: true,
              },
            },
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
