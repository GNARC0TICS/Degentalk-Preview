// server/src/core/database.ts
// Compatibility shim: temporary bridge so legacy imports of "@server/src/core/database" continue to work.
// TODO: Remove after all feature branches are migrated to use "@db" or "@server/src/core/db" directly.
export * from './db';
export { db } from './db';
