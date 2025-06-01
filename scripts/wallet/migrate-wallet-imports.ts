/**
 * Wallet Import Migration Script
 * 
 * [REFAC-WALLET]
 * 
 * This script finds and replaces import paths for wallet components
 * to use the new feature-based structure.
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

// Define mappings of old paths to new feature-based paths
const importMappings = [
  // Components
  {
    old: /from ['"].*\/components\/economy\/wallet\/wallet-balance-display['"]/g,
    new: 'from \'@/features/wallet/components/wallet-balance-display\''
  },
  {
    old: /from ['"].*\/components\/economy\/wallet\/deposit-button['"]/g,
    new: 'from \'@/features/wallet/components/deposit-button\''
  },
  {
    old: /from ['"].*\/components\/economy\/wallet\/withdraw-button['"]/g,
    new: 'from \'@/features/wallet/components/withdraw-button\''
  },
  {
    old: /from ['"].*\/components\/economy\/wallet\/buy-dgt-button['"]/g,
    new: 'from \'@/features/wallet/components/buy-dgt-button\''
  },
  {
    old: /from ['"].*\/components\/economy\/wallet\/transaction-history['"]/g,
    new: 'from \'@/features/wallet/components/transaction-history\''
  },

  // Pages
  {
    old: /from ['"].*\/pages\/wallet['"]/g,
    new: 'from \'@/features/wallet/pages/WalletPage\''
  },

  // API calls
  {
    old: /from ['"].*\/api\/wallet['"]/g,
    new: 'from \'@/features/wallet/services/wallet-api.service\''
  },

  // Centralized imports
  {
    old: /import\s+{([^}]*)WalletBalanceDisplay([^}]*),([^}]*)DepositButton([^}]*),([^}]*)WithdrawButton([^}]*),([^}]*)BuyDgtButton([^}]*)}\s+from\s+['"].*['"]/g,
    new: 'import { $1WalletBalanceDisplay$2, $3DepositButton$4, $5WithdrawButton$6, $7BuyDgtButton$8 } from \'@/features/wallet\''
  }
];

// Paths to process
const searchPaths = [
  'client/src/components/**/*.{ts,tsx}',
  'client/src/pages/**/*.{ts,tsx}',
  'client/src/hooks/**/*.{ts,tsx}',
  'client/src/lib/**/*.{ts,tsx}',
  'client/src/features/**/*.{ts,tsx}',
];

// Process a file
function processFile(filePath: string): void {
  console.log(`Processing ${filePath}...`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;
    
    // Apply each mapping
    for (const mapping of importMappings) {
      if (mapping.old.test(content)) {
        content = content.replace(mapping.old, mapping.new);
        modified = true;
      }
    }
    
    // Save the file if modified
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ Updated ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
  }
}

// Main function
async function main(): Promise<void> {
  console.log('Starting wallet import migration...');
  
  // Find all files to process
  for (const searchPath of searchPaths) {
    const files = await glob(searchPath);
    
    for (const file of files) {
      // Skip files in the wallet feature directory - they're already using the new structure
      if (file.includes('features/wallet/')) {
        continue;
      }
      
      processFile(file);
    }
  }
  
  console.log('Wallet import migration complete!');
}

// Run the script
main().catch(console.error); 