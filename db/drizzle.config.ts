import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env from parent directory
dotenv.config({ path: resolve(__dirname, '../.env') });

// Use DIRECT connection for all schema operations
const dbUrl = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;
if (!dbUrl) {
    console.error('❌ DIRECT_DATABASE_URL not found in environment');
    console.error('Please ensure DIRECT_DATABASE_URL is set in your .env file');
    throw new Error('DIRECT_DATABASE_URL not set');
}

console.log('📡 Using direct connection (no pooler) for schema operations...');

export default {
    dialect: 'postgresql',
    schema: ['./schema/**/*.ts'],
    out: './migrations/postgres',
    dbCredentials: { url: dbUrl },
    verbose: true,
    strict: false
} satisfies Config;