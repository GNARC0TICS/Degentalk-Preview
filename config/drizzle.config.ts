import type { Config } from 'drizzle-kit';
import 'dotenv/config';

// Use direct URL for migrations to avoid pooler issues
const dbUrl = process.env.DATABASE_DIRECT_URL || process.env.DATABASE_URL;
if (!dbUrl) throw new Error('DATABASE_URL or DATABASE_DIRECT_URL not set');

export default {
    dialect: 'postgresql',
    schema: ['./db/schema/**/*.ts'],
    out: './migrations/postgres',
    dbCredentials: { url: dbUrl }
} satisfies Config;
