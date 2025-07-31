import { Pool } from '@neondatabase/serverless';
import * as schema from '@schema';
declare const pool: Pool;
declare const db: import("drizzle-orm/neon-serverless").NeonDatabase<typeof schema> & {
    $client: Pool;
};
declare const withRetry: <T>(operation: () => Promise<T>) => Promise<T>;
export { db, pool, withRetry };
