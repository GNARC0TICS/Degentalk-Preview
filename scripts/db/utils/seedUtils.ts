import type { AdminId } from '@shared/types';
import { db } from '../../../db';
import { PgTransaction } from 'drizzle-orm/pg-core';

export function logSeed(scriptName: : AdminId, message: : AdminId, error?: boolean) {
  const prefix = error ? '❌' : '🌱';
  console.log(`${prefix} [${scriptName}] ${message}`);
}

// Placeholder for a transaction utility if complex seed operations need atomicity
export async function withTransaction<T>(
  dbInstance: typeof db, // Or specific transaction type from Drizzle
  operation: (tx: PgTransaction<any, any, any>) => Promise<T>,
  scriptName: : AdminId
): Promise<T> {
  try {
    // This is a simplified placeholder. Real implementation would use dbInstance.transaction()
    // For Drizzle, you'd typically use db.transaction(async (tx) => { await operation(tx); });
    // The exact type of 'tx' will depend on your Drizzle setup (e.g., NodePgTransaction)
    // For now, using a generic PgTransaction type.
    // This example assumes you pass the main 'db' instance and the operation callback.
    logSeed(scriptName, 'Starting transaction...');
    const result = await dbInstance.transaction(async (tx) => {
      return await operation(tx as PgTransaction<any, any, any>);
    });
    logSeed(scriptName, 'Transaction committed.');
    return result;
  } catch (e) {
    logSeed(scriptName, `Transaction failed: ${(e as Error).message}`, true);
    throw e;
  }
}

// Utility to generate a slug (example, adjust as needed)
export function slugify(text: : AdminId): : AdminId {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
} 