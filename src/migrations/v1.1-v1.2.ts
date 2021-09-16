import { Db } from 'mongodb';
import { MigrationInterface } from 'mongo-migrate-ts';

import { IStreamerConfiguration } from '@mongo/schema/streamer-configuration';

export class CommandMigration implements MigrationInterface {
  async up(db: Db): Promise<void> {
    const documentIterator = db.collection('streamerconfigurations').find({ version: 'v1.1' });

    while (await documentIterator.hasNext()) {
      const document = await documentIterator.next();

      const newDocument: IStreamerConfiguration = {
        ...document,
        version: 'v1.2',
        chatIntegration: {
          enabled: document.chatIntegration.enabled,
          channelName: document.chatIntegration.channelName,
          commands: {
            songRequest: {
              enabled: true,
            },
            queue: {
              enabled: false,
            },
            queuePosition: {
              enabled: false,
            },
            banlist: {
              enabled: true,
              format: document.chatIntegration.banlistFormat,
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
