import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  await client.connect();
  const db = drizzle(client);

  // List of FK validation queries (add more as schema evolves)
  const checks: { description: string; query: string }[] = [
    {
      description: 'threads -> users.user_id',
      query: `SELECT COUNT(*) AS cnt FROM threads t LEFT JOIN users u ON t.user_id = u.id WHERE u.id IS NULL;`
    },
    {
      description: 'posts -> users.user_id',
      query: `SELECT COUNT(*) AS cnt FROM posts p LEFT JOIN users u ON p.user_id = u.id WHERE u.id IS NULL;`
    },
    {
      description: 'posts -> threads.thread_id',
      query: `SELECT COUNT(*) AS cnt FROM posts p LEFT JOIN threads t ON p.thread_id = t.id WHERE t.id IS NULL;`
    }
  ];

  let hasErrors = false;

  for (const chk of checks) {
    const res = await db.execute<{ cnt: string }>(chk.query);
    const count = Number(res.rows[0].cnt);
    if (count > 0) {
      hasErrors = true;
      console.error(`❌ FK violation detected for ${chk.description}: ${count} orphaned rows`);
    } else {
      console.log(`✅ ${chk.description} OK`);
    }
  }

  await client.end();
  if (hasErrors) {
    console.error('Foreign key validation failed. Please fix orphaned rows before merging.');
    process.exit(1);
  }

  console.log('All foreign key checks passed.');
}

main().catch((err) => {
  console.error('Error running FK validation script', err);
  process.exit(1);
}); 