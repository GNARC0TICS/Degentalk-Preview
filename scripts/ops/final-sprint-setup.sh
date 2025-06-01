#!/bin/bash

# Final Sprint Setup Script
# This script sets up the necessary files for the final restructuring sprint

echo "=================================="
echo "ForumFusion Final Sprint Setup"
echo "=================================="
echo

# Create directories if they don't exist
mkdir -p scripts/templates

# Check if template files exist
if [ ! -f "scripts/templates/transaction-domain-template.ts" ] || [ ! -f "scripts/templates/vault-domain-template.ts" ]; then
  echo "Error: Template files are missing. Please ensure the following files exist:"
  echo "- scripts/templates/transaction-domain-template.ts"
  echo "- scripts/templates/vault-domain-template.ts"
  exit 1
fi

echo "Please select what you want to set up:"
echo "1. Transaction Domain"
echo "2. Vault Module"
echo "3. Both Transaction Domain and Vault Module"
echo "4. Exit"
read -p "Your choice (1-4): " choice

case $choice in
  1)
    echo "Setting up Transaction Domain..."
    node -e "
      const fs = require('fs');
      const path = require('path');
      
      // Read template
      const template = require('./scripts/templates/transaction-domain-template');
      
      // Create directories
      fs.mkdirSync('./server/src/domains/transactions', { recursive: true });
      fs.mkdirSync('./server/test/transactions', { recursive: true });
      
      // Create files
      console.log('Creating transaction.routes.ts...');
      fs.writeFileSync('./server/src/domains/transactions/transaction.routes.ts', template.transactionRoutesTemplate);
      
      console.log('Creating transaction.controller.ts...');
      fs.writeFileSync('./server/src/domains/transactions/transaction.controller.ts', template.transactionControllerTemplate);
      
      console.log('Creating transaction.service.ts...');
      fs.writeFileSync('./server/src/domains/transactions/transaction.service.ts', template.transactionServiceTemplate);
      
      console.log('Creating transaction.validators.ts...');
      fs.writeFileSync('./server/src/domains/transactions/transaction.validators.ts', template.transactionValidatorsTemplate);
      
      console.log('Creating transaction.test.ts...');
      fs.writeFileSync('./server/test/transactions/transaction.test.ts', template.transactionTestTemplate);
      
      // Create date-utils.ts if it doesn't exist
      if (!fs.existsSync('./server/src/utils/date-utils.ts')) {
        console.log('Creating date-utils.ts...');
        fs.mkdirSync('./server/src/utils', { recursive: true });
        fs.writeFileSync('./server/src/utils/date-utils.ts', 
        \`/**
 * Date Utilities
 * 
 * Helper functions for date/time operations
 */

/**
 * Format a date for database storage
 */
export function formatDateTimeForDb(date: Date): string {
  return date.toISOString().replace('T', ' ').replace('Z', '');
}

/**
 * Format a date for display
 */
export function formatDateForDisplay(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}\`);
      }
      
      console.log('Transaction domain setup complete!');
    "
    ;;
  2)
    echo "Setting up Vault Module..."
    node -e "
      const fs = require('fs');
      const path = require('path');
      
      // Read template
      const template = require('./scripts/templates/vault-domain-template');
      
      // Create directories
      fs.mkdirSync('./server/src/domains/engagement/vault', { recursive: true });
      fs.mkdirSync('./server/test/engagement/vault', { recursive: true });
      
      // Create files
      console.log('Creating vault.routes.ts...');
      fs.writeFileSync('./server/src/domains/engagement/vault/vault.routes.ts', template.vaultRoutesTemplate);
      
      console.log('Creating vault.controller.ts...');
      fs.writeFileSync('./server/src/domains/engagement/vault/vault.controller.ts', template.vaultControllerTemplate);
      
      console.log('Creating vault.service.ts...');
      fs.writeFileSync('./server/src/domains/engagement/vault/vault.service.ts', template.vaultServiceTemplate);
      
      console.log('Creating vault.validators.ts...');
      fs.writeFileSync('./server/src/domains/engagement/vault/vault.validators.ts', template.vaultValidatorsTemplate);
      
      console.log('Creating vault.test.ts...');
      fs.writeFileSync('./server/test/engagement/vault/vault.test.ts', template.vaultTestTemplate);
      
      // Update engagement.service.ts if it exists
      if (fs.existsSync('./server/src/domains/engagement/engagement.service.ts')) {
        console.log('Updating engagement.service.ts...');
        let content = fs.readFileSync('./server/src/domains/engagement/engagement.service.ts', 'utf8');
        
        // Add import
        if (!content.includes('import { vaultService }')) {
          const importPattern = /import { rainService } from '.\/rain\/rain.service';/;
          content = content.replace(
            importPattern, 
            \`import { rainService } from './rain/rain.service';
import { vaultService } from './vault/vault.service';\`
          );
        }
        
        // Add createVault method if it doesn't exist
        if (!content.includes('createVault(')) {
          content += \`
  /**
   * Create a vault for time-locked tokens
   * 
   * @param userId The user creating the vault
   * @param amount Amount of tokens to lock
   * @param lockPeriodDays Number of days to lock the tokens
   * @param name Name of the vault
   * @param currency Currency to use (default: DGT)
   */
  async createVault(
    userId: number,
    amount: bigint,
    lockPeriodDays: number,
    name: string,
    currency: string = 'DGT'
  ) {
    try {
      return await vaultService.createVault(
        userId,
        amount,
        lockPeriodDays,
        name,
        currency
      );
    } catch (error) {
      logger.error('Error creating vault:', error);
      
      if (error instanceof WalletError) {
        throw error;
      }
      
      throw new WalletError(
        'Failed to create vault',
        500,
        WalletErrorCodes.UNKNOWN_ERROR,
        { originalError: error.message }
      );
    }
  }
\`;
        }
        
        fs.writeFileSync('./server/src/domains/engagement/engagement.service.ts', content);
      }
      
      console.log('Vault module setup complete!');
    "
    ;;
  3)
    echo "Setting up both Transaction Domain and Vault Module..."
    node -e "
      const fs = require('fs');
      const path = require('path');
      
      // Transaction Domain setup
      const transactionTemplate = require('./scripts/templates/transaction-domain-template');
      
      fs.mkdirSync('./server/src/domains/transactions', { recursive: true });
      fs.mkdirSync('./server/test/transactions', { recursive: true });
      
      console.log('Creating transaction domain files...');
      fs.writeFileSync('./server/src/domains/transactions/transaction.routes.ts', transactionTemplate.transactionRoutesTemplate);
      fs.writeFileSync('./server/src/domains/transactions/transaction.controller.ts', transactionTemplate.transactionControllerTemplate);
      fs.writeFileSync('./server/src/domains/transactions/transaction.service.ts', transactionTemplate.transactionServiceTemplate);
      fs.writeFileSync('./server/src/domains/transactions/transaction.validators.ts', transactionTemplate.transactionValidatorsTemplate);
      fs.writeFileSync('./server/test/transactions/transaction.test.ts', transactionTemplate.transactionTestTemplate);
      
      // Create date-utils.ts if it doesn't exist
      if (!fs.existsSync('./server/src/utils/date-utils.ts')) {
        console.log('Creating date-utils.ts...');
        fs.mkdirSync('./server/src/utils', { recursive: true });
        fs.writeFileSync('./server/src/utils/date-utils.ts', 
        \`/**
 * Date Utilities
 * 
 * Helper functions for date/time operations
 */

/**
 * Format a date for database storage
 */
export function formatDateTimeForDb(date: Date): string {
  return date.toISOString().replace('T', ' ').replace('Z', '');
}

/**
 * Format a date for display
 */
export function formatDateForDisplay(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}\`);
      }
      
      // Vault Module setup
      const vaultTemplate = require('./scripts/templates/vault-domain-template');
      
      fs.mkdirSync('./server/src/domains/engagement/vault', { recursive: true });
      fs.mkdirSync('./server/test/engagement/vault', { recursive: true });
      
      console.log('Creating vault module files...');
      fs.writeFileSync('./server/src/domains/engagement/vault/vault.routes.ts', vaultTemplate.vaultRoutesTemplate);
      fs.writeFileSync('./server/src/domains/engagement/vault/vault.controller.ts', vaultTemplate.vaultControllerTemplate);
      fs.writeFileSync('./server/src/domains/engagement/vault/vault.service.ts', vaultTemplate.vaultServiceTemplate);
      fs.writeFileSync('./server/src/domains/engagement/vault/vault.validators.ts', vaultTemplate.vaultValidatorsTemplate);
      fs.writeFileSync('./server/test/engagement/vault/vault.test.ts', vaultTemplate.vaultTestTemplate);
      
      // Update engagement.service.ts if it exists
      if (fs.existsSync('./server/src/domains/engagement/engagement.service.ts')) {
        console.log('Updating engagement.service.ts...');
        let content = fs.readFileSync('./server/src/domains/engagement/engagement.service.ts', 'utf8');
        
        // Add import
        if (!content.includes('import { vaultService }')) {
          const importPattern = /import { rainService } from '.\/rain\/rain.service';/;
          content = content.replace(
            importPattern, 
            \`import { rainService } from './rain/rain.service';
import { vaultService } from './vault/vault.service';\`
          );
        }
        
        // Add createVault method if it doesn't exist
        if (!content.includes('createVault(')) {
          content += \`
  /**
   * Create a vault for time-locked tokens
   * 
   * @param userId The user creating the vault
   * @param amount Amount of tokens to lock
   * @param lockPeriodDays Number of days to lock the tokens
   * @param name Name of the vault
   * @param currency Currency to use (default: DGT)
   */
  async createVault(
    userId: number,
    amount: bigint,
    lockPeriodDays: number,
    name: string,
    currency: string = 'DGT'
  ) {
    try {
      return await vaultService.createVault(
        userId,
        amount,
        lockPeriodDays,
        name,
        currency
      );
    } catch (error) {
      logger.error('Error creating vault:', error);
      
      if (error instanceof WalletError) {
        throw error;
      }
      
      throw new WalletError(
        'Failed to create vault',
        500,
        WalletErrorCodes.UNKNOWN_ERROR,
        { originalError: error.message }
      );
    }
  }
\`;
        }
        
        fs.writeFileSync('./server/src/domains/engagement/engagement.service.ts', content);
      }
      
      console.log('Transaction domain and Vault module setup complete!');
    "
    ;;
  4)
    echo "Exiting..."
    exit 0
    ;;
  *)
    echo "Invalid choice. Exiting..."
    exit 1
    ;;
esac

echo
echo "Next steps:"
echo "1. Add error codes to wallet.errors.ts:"
echo "   - For Transaction domain: TRANSACTION_NOT_FOUND"
echo "   - For Vault module: VAULT_NOT_FOUND and VAULT_LOCKED"
echo
echo "2. Update core/index.ts to register the new routes:"
echo "   - For Transaction domain: app.use('/api/transactions', transactionRoutes);"
echo "   - For Vault module: app.use('/api/engagement/vault', vaultRoutes);"
echo
echo "3. Review and run database migrations for any schema changes"
echo
echo "4. Implement client-side components and integration"
echo
echo "Refer to RESTRUCTURE.md and final-sprint-plan.md for detailed steps." 