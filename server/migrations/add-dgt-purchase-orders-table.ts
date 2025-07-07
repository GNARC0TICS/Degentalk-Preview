import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { sql } from "drizzle-orm";
import * as schema from "../../shared/schema";
import * as dotenv from "dotenv";
import { logger } from "../src/core/logger";

// [REFAC-DGT] Custom migration script to create the dgt_purchase_orders table
// This supplements the Drizzle SQL migrations for more complex operations

dotenv.config();

const runMigration = async () => {
  // Create a new Postgres connection pool
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    logger.error("DATABASE_URL environment variable is not set");
    process.exit(1);
  }
  
  const pool = new Pool({
    connectionString,
  });
  
  try {
    // Create a Drizzle client instance
    const db = drizzle(pool, { schema });
    
    logger.info("Connected to the database. Starting dgt_purchase_orders table migration...");
    
    // Check if the table already exists to avoid duplicate migrations
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'dgt_purchase_orders'
      );
    `);
    
    if (tableExists.rows[0]?.exists) {
      logger.info("dgt_purchase_orders table already exists. Skipping migration.");
      return;
    }
    
    // Create the dgt_purchase_orders table using raw SQL for more control
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "dgt_purchase_orders" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL REFERENCES "users"("user_id") ON DELETE CASCADE,
        "dgt_amount_requested" BIGINT NOT NULL,
        "crypto_amount_expected" DECIMAL(18, 8) NOT NULL,
        "crypto_currency_expected" VARCHAR(10) NOT NULL,
        "ccpayment_reference" VARCHAR(255) NOT NULL,
        "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
        "metadata" JSONB DEFAULT '{}',
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE INDEX "idx_dgt_purchase_orders_user_id" ON "dgt_purchase_orders"("user_id");
      CREATE INDEX "idx_dgt_purchase_orders_status" ON "dgt_purchase_orders"("status");
      CREATE INDEX "idx_dgt_purchase_orders_ccpayment_ref" ON "dgt_purchase_orders"("ccpayment_reference");
      CREATE INDEX "idx_dgt_purchase_orders_created_at" ON "dgt_purchase_orders"("created_at");
    `);
    
    logger.info("Successfully created dgt_purchase_orders table");
    
  } catch (error: unknown) {
    logger.error("Error executing migration:", error);
    process.exit(1);
  } finally {
    await pool.end();
    logger.info("Migration complete");
  }
};

// Execute the migration when this file is run directly
if (require.main === module) {
  runMigration()
    .catch(console.error);
}

export { runMigration }; 