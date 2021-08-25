// Needs to be the first thing that happens
// Registers the import aliases
import 'module-alias/register';
import { mongoMigrateCli } from 'mongo-migrate-ts';

import config from '@common/config';

mongoMigrateCli({
  uri: config.mongodb.uri,
  migrationsDir: __dirname,
  migrationsCollection: 'migrations_collection',
  options: {
    keepAlive: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
});
