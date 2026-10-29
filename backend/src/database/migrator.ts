import { Logger } from '@nestjs/common';
import { DataTypes, QueryTypes, type QueryInterface } from 'sequelize';
import type { Sequelize } from 'sequelize-typescript';

import { MIGRATIONS } from './migrations';
import { INITIAL_TABLES } from './migrations/0001-initial-schema';

/*
 * Database migrations: the schema changes step by step, in code, and each
 * step runs once per database. The API runs the pending ones when it starts
 * (and `npm run migrate` does it by hand), so a deploy never needs the demo
 * seed, which empties the database.
 *
 * Migrations only move forward. To undo one, write a new migration that
 * reverses it. MySQL can't roll back schema changes inside a transaction, so
 * keep each migration small: if one fails half way, fix it by hand or with
 * the next migration.
 */

export interface Migration {
  /** Unique and sortable: "0002-add-lot-phone". Stored in schema_migrations. */
  name: string;
  up(queryInterface: QueryInterface): Promise<void>;
}

/** Which migrations have run on this database, and when. */
export const MIGRATIONS_TABLE = 'schema_migrations';

const logger = new Logger('Migrations');

async function appliedMigrations(sequelize: Sequelize): Promise<Set<string>> {
  await sequelize.getQueryInterface().createTable(MIGRATIONS_TABLE, {
    name: { type: DataTypes.STRING(255), primaryKey: true },
    run_at: { type: DataTypes.DATE, allowNull: false },
  });
  const rows = await sequelize.query<{ name: string }>(
    `SELECT name FROM ${MIGRATIONS_TABLE}`,
    { type: QueryTypes.SELECT },
  );
  return new Set(rows.map((row) => row.name));
}

async function record(sequelize: Sequelize, name: string): Promise<void> {
  await sequelize
    .getQueryInterface()
    .bulkInsert(MIGRATIONS_TABLE, [{ name, run_at: new Date() }]);
}

/**
 * True if the database already has the first migration's tables but no record
 * of it: it was made before migrations, by Sequelize's sync.
 */
async function madeBeforeMigrations(sequelize: Sequelize): Promise<boolean> {
  const tables = (await sequelize.getQueryInterface().showAllTables()).map(
    (table) => (typeof table === 'string' ? table : String(table)),
  );
  return INITIAL_TABLES.every((table) => tables.includes(table));
}

/** The migrations that haven't run on this database yet. */
export async function pendingMigrations(
  sequelize: Sequelize,
  migrations: readonly Migration[] = MIGRATIONS,
): Promise<Migration[]> {
  const applied = await appliedMigrations(sequelize);
  return migrations.filter((migration) => !applied.has(migration.name));
}

/**
 * Runs every pending migration, oldest first, and returns their names.
 * Run it from one place at a time (one API instance, or the CLI).
 */
export async function migrate(
  sequelize: Sequelize,
  migrations: readonly Migration[] = MIGRATIONS,
): Promise<string[]> {
  const applied = await appliedMigrations(sequelize);

  // A database from before migrations already has the first schema: adopt it
  // instead of trying to create tables that exist.
  const [first] = migrations;
  if (first && applied.size === 0 && (await madeBeforeMigrations(sequelize))) {
    await record(sequelize, first.name);
    applied.add(first.name);
    logger.log(`Existing tables adopted as ${first.name}`);
  }

  const ran: string[] = [];
  for (const migration of migrations) {
    if (applied.has(migration.name)) continue;
    logger.log(`Running ${migration.name}...`);
    await migration.up(sequelize.getQueryInterface());
    await record(sequelize, migration.name);
    ran.push(migration.name);
  }
  logger.log(
    ran.length === 0
      ? 'The database is up to date'
      : `Ran ${ran.length} migration(s); the database is up to date`,
  );
  return ran;
}
