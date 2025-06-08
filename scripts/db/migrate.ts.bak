import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

// Load environment variables from env.local
dotenv.config({ path: './env.local' }); // Ensuring path is relative to project root

async function runMigrations() {
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
        console.error("❌ DATABASE_URL not found in environment variables.");
        console.error("Ensure env.local is present in the project root and contains DATABASE_URL.");
        process.exit(1);
    }

    try {
        console.log("🟠 Connecting to database...");
        const sql = neon(dbUrl);
        const db = drizzle(sql);

        console.log("⏳ Running migrations from './migrations/postgres' folder...");
        await migrate(db, { migrationsFolder: './migrations/postgres' });
        console.log("✅ Migrations completed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    }
}

runMigrations(); 