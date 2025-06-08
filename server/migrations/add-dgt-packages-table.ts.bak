import { migrate } from './migrate';
import { db } from '../db';
import { sql } from 'drizzle-orm';

/**
 * Migration to add the dgt_packages table
 */
export async function addDgtPackagesTable() {
  // First, check if the table already exists
  const tableExists = await checkTableExists('dgt_packages');
  
  if (tableExists) {
    console.log('Table dgt_packages already exists, skipping creation');
    return;
  }
  
  console.log('Creating dgt_packages table...');
  
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS dgt_packages (
      package_id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      dgt_amount BIGINT NOT NULL,
      usd_price DECIMAL(10, 2) NOT NULL,
      discount_percentage INTEGER,
      is_featured BOOLEAN NOT NULL DEFAULT FALSE,
      image_url VARCHAR(255),
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
    
    -- Create indexes for better query performance
    CREATE INDEX IF NOT EXISTS idx_dgt_packages_name ON dgt_packages(name);
    CREATE INDEX IF NOT EXISTS idx_dgt_packages_active ON dgt_packages(is_active);
    CREATE INDEX IF NOT EXISTS idx_dgt_packages_featured ON dgt_packages(is_featured);
  `);
  
  // Insert some default packages
  await db.execute(sql`
    INSERT INTO dgt_packages (
      name, 
      description, 
      dgt_amount, 
      usd_price, 
      discount_percentage, 
      is_featured, 
      sort_order
    ) VALUES
    (
      'Mini Pack', 
      'Perfect for casual users', 
      100000000, 
      5.99, 
      NULL, 
      FALSE, 
      1
    ),
    (
      'Standard Pack', 
      'Most popular option for active forum users', 
      500000000, 
      24.99, 
      10, 
      TRUE, 
      2
    ),
    (
      'Premium Pack', 
      'For power users and DGT collectors', 
      1500000000, 
      59.99, 
      20, 
      FALSE, 
      3
    ),
    (
      'Whale Pack', 
      'VIP package with maximum DGT tokens', 
      5000000000, 
      149.99, 
      30, 
      FALSE, 
      4
    );
  `);
  
  console.log('Created dgt_packages table and inserted default packages');
}

// Helper function to check if a table exists
async function checkTableExists(tableName: string): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name = ${tableName}
    );
  `);
  
  return result.rows[0].exists;
}

// Register the migration
migrate(addDgtPackagesTable, {
  name: 'add-dgt-packages-table',
  description: 'Adds the dgt_packages table for storing DGT purchase packages'
}); 