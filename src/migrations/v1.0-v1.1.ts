import { MigrationInterface } from 'mongo-migrate-ts';
import { Db } from 'mongodb';

export class Migration implements MigrationInterface {
  async up(db: Db): Promise<void> {
    await db.collection('streamerconfigurations').updateMany(
      { version: 'v1.0' },
      {
        $set: {
          version: 'v1.1',
          'chatIntegration.banlistFormat': '{TITLE} - {ARTIST}',
        },
      }
    );
  }

  async down(): Promise<void> {
    throw Error('Not supported!');
  }
}
