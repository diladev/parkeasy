import { NestFactory } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';

import { AppModule } from 'src/app.module';
import { migrate, pendingMigrations } from 'src/database/migrator';

/*
 * npm run migrate           runs the pending migrations
 * npm run migrate -- status lists them without running anything
 *
 * The API also runs them when it starts (unless DB_MIGRATE_ON_START=false),
 * so this is for checking a database, or for running them before a deploy.
 */
async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'error', 'warn'],
  });
  try {
    const sequelize = app.get<Sequelize>(getConnectionToken());
    if (process.argv.includes('status')) {
      const pending = await pendingMigrations(sequelize);
      console.log(
        pending.length === 0
          ? 'No pending migrations.'
          : `Pending: ${pending.map((migration) => migration.name).join(', ')}`,
      );
    } else {
      await migrate(sequelize);
    }
  } finally {
    await app.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
