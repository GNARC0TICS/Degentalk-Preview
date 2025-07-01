import dotenv from 'dotenv';
dotenv.config();

import { db } from '@db';
import fs from 'fs';
import path from 'path';
import { logger } from '@core/logger';
import { users, wallets, transactions } from '../shared/schema';
import { eq, sql } from 'drizzle-orm';

async function migrateWalletRefactor() {
  try {
    logger.info('Starting wallet refactoring migration');
    
    // Step 1: Create the necessary directory structure if it doesn't exist
    createDirectoryStructure();
    
    // Step 2: Check database for CCPayment user IDs
    await checkCCPaymentUserIds();
    
    // Step 3: Apply schema changes for hybrid wallet
    await applySchemaChanges();
    
    logger.info('Wallet refactoring migration completed successfully');
    return true;
  } catch (error) {
    logger.error('Error in wallet refactoring migration:', error);
    return false;
  }
}

function createDirectoryStructure() {
  const directories = [
    'server/src/domains/wallet',
    'server/src/domains/engagement/tip',
    'server/src/domains/engagement/rain',
    'server/src/domains/engagement/airdrop',
    'server/src/domains/engagement/vault',
    'server/src/domains/transactions',
    'server/src/domains/ccpayment-webhook',
    'archive/legacy-tron',
    'archive/old-routes'
  ];
  
  directories.forEach(dir => {
    const fullPath = path.resolve(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      logger.info(`Creating directory: ${dir}`);
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
}

async function checkCCPaymentUserIds() {
  try {
    // Check if the ccpayment_account_id column exists in the users table
    const result = await db.execute(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name='ccpayment_account_id'
    `);
    
    if (!result || result.rows.length === 0) {
      logger.warn('ccpayment_account_id column not found in users table');
      logger.info('You need to run the add-ccpayment-account-id migration first');
      
      // @todo Create migration for adding ccpayment_account_id to users table
      // [NEEDS-CONFIRMATION] Will you run the database schema migration separately?
    } else {
      logger.info('ccpayment_account_id column exists in users table');
    }
  } catch (error) {
    logger.error('Error checking CCPayment user IDs:', error);
    throw error;
  }
}

async function applySchemaChanges() {
  try {
    // We'll add the required fields to the transactions table for the hybrid wallet system
    
    // Check if currency column exists in transactions table
    const currencyColumnExists = await db.execute(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='transactions' AND column_name='currency'
    `);
    
    if (!currencyColumnExists || currencyColumnExists.rows.length === 0) {
      logger.warn('currency column not found in transactions table');
      logger.info('You need to run the add-currency-to-transactions migration first');
      
      // @todo Create migration for adding currency to transactions table
      // [NEEDS-CONFIRMATION] Will you run the database schema migration separately?
    } else {
      logger.info('currency column exists in transactions table');
    }
    
    // Check if ccpayment_order_id column exists in transactions table
    const ccpaymentOrderIdColumnExists = await db.execute(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='transactions' AND column_name='ccpayment_order_id'
    `);
    
    if (!ccpaymentOrderIdColumnExists || ccpaymentOrderIdColumnExists.rows.length === 0) {
      logger.warn('ccpayment_order_id column not found in transactions table');
      logger.info('You need to run the add-ccpayment-order-id-to-transactions migration first');
      
      // @todo Create migration for adding ccpayment_order_id to transactions table
      // [NEEDS-CONFIRMATION] Will you run the database schema migration separately?
    } else {
      logger.info('ccpayment_order_id column exists in transactions table');
    }
    
    // @todo Check for other required schema changes
    // [NEEDS-CONFIRMATION] Any other schema changes needed?
  } catch (error) {
    logger.error('Error applying schema changes:', error);
    throw error;
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  migrateWalletRefactor()
    .then(success => {
      if (success) {
        logger.info('✅ Wallet refactoring migration completed successfully');
        process.exit(0);
      } else {
        logger.error('❌ Wallet refactoring migration failed');
        process.exit(1);
      }
    })
    .catch(error => {
      logger.error('❌ Unhandled error in wallet refactoring migration:', error);
      process.exit(1);
    });
}

export { migrateWalletRefactor }; 