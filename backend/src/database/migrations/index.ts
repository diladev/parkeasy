import type { Migration } from '../migrator';
import { initialSchema } from './0001-initial-schema';

/**
 * Every migration, oldest first. Add new ones at the end, named
 * 0002-what-it-does.ts and so on; never edit or reorder one that has run
 * on a real database (see migrator.ts).
 */
export const MIGRATIONS: readonly Migration[] = [initialSchema];
