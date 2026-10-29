import type { Sequelize } from 'sequelize-typescript';

import { migrate, pendingMigrations, type Migration } from './migrator';
import { INITIAL_TABLES } from './migrations/0001-initial-schema';

/** Just enough of Sequelize for the runner: tables, and the migrations it recorded. */
function fakeDatabase(tables: string[] = []) {
  const recorded: string[] = [];
  const sequelize = {
    getQueryInterface: () => ({
      createTable: (name: string) => {
        if (!tables.includes(name)) tables.push(name);
        return Promise.resolve();
      },
      showAllTables: () => Promise.resolve([...tables]),
      bulkInsert: (_table: string, rows: { name: string }[]) => {
        recorded.push(...rows.map((row) => row.name));
        return Promise.resolve();
      },
    }),
    query: () => Promise.resolve(recorded.map((name) => ({ name }))),
  } as unknown as Sequelize;
  return { sequelize, tables, recorded };
}

/** A migration that notes when it runs, and can be made to fail. */
function step(name: string, ran: string[], fail = false): Migration {
  return {
    name,
    up: () => {
      if (fail) return Promise.reject(new Error(`${name} failed`));
      ran.push(name);
      return Promise.resolve();
    },
  };
}

describe('migrate', () => {
  it('runs the pending migrations once, oldest first', async () => {
    const db = fakeDatabase();
    const ran: string[] = [];
    const all = [step('0001-a', ran), step('0002-b', ran)];

    await expect(migrate(db.sequelize, all)).resolves.toEqual([
      '0001-a',
      '0002-b',
    ]);
    expect(db.recorded).toEqual(['0001-a', '0002-b']);
    expect(db.tables).toContain('schema_migrations');

    // Nothing left to do the second time.
    await expect(migrate(db.sequelize, all)).resolves.toEqual([]);
    expect(ran).toEqual(['0001-a', '0002-b']);
  });

  it('runs only what was added since', async () => {
    const db = fakeDatabase();
    const ran: string[] = [];
    await migrate(db.sequelize, [step('0001-a', ran)]);
    const all = [step('0001-a', ran), step('0002-b', ran)];

    await expect(pendingMigrations(db.sequelize, all)).resolves.toEqual([
      expect.objectContaining({ name: '0002-b' }),
    ]);
    await expect(migrate(db.sequelize, all)).resolves.toEqual(['0002-b']);
  });

  it('adopts a database made before migrations instead of recreating it', async () => {
    const db = fakeDatabase([...INITIAL_TABLES]);
    const ran: string[] = [];

    await expect(
      migrate(db.sequelize, [step('0001-initial', ran), step('0002-b', ran)]),
    ).resolves.toEqual(['0002-b']);
    expect(ran).toEqual(['0002-b']);
    expect(db.recorded).toEqual(['0001-initial', '0002-b']);
  });

  it('stops at a failing migration and tries it again next time', async () => {
    const db = fakeDatabase();
    const ran: string[] = [];

    await expect(
      migrate(db.sequelize, [step('0001-a', ran), step('0002-b', ran, true)]),
    ).rejects.toThrow('0002-b failed');
    expect(db.recorded).toEqual(['0001-a']);

    await expect(
      migrate(db.sequelize, [step('0001-a', ran), step('0002-b', ran)]),
    ).resolves.toEqual(['0002-b']);
  });
});
