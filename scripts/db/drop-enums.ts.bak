import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: './env.local' });

async function dropAllEnums() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();

    const sql = `
    DO $$
    DECLARE
        r RECORD;
    BEGIN
        FOR r IN (
            SELECT n.nspname as schema, t.typname as type
            FROM pg_type t
            JOIN pg_enum e ON t.oid = e.enumtypid
            JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
            WHERE n.nspname = 'public'
            GROUP BY n.nspname, t.typname
        ) LOOP
            EXECUTE 'DROP TYPE IF EXISTS "' || r.type || '" CASCADE;';
        END LOOP;
    END $$;
  `;

    await client.query(sql);
    await client.end();
    console.log('✅ Dropped all ENUM types in public schema.');
}

dropAllEnums().catch((err) => {
    console.error('❌ Error dropping enums:', err);
    process.exit(1);
}); 