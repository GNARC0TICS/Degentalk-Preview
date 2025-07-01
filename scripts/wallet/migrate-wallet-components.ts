import type { AdminId } from '@db/types';
/**
 * Wallet Component Migration Script
 * 
 * [REFAC-WALLET]
 * 
 * This script copies wallet-related components from their legacy locations 
 * to the new feature-based structure. It also adds migration comments.
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

// Base paths
const CLIENT_SRC = path.resolve('client/src');
const FEATURES_DIR = path.resolve(CLIENT_SRC, 'features');
const WALLET_FEATURE_DIR = path.resolve(FEATURES_DIR, 'wallet');

// Component mappings: source => destination
const componentMappings = [
  // Components
  {
    source: 'components/economy/wallet/wallet-balance-display.tsx',
    destination: 'components/wallet-balance-display.tsx'
  },
  {
    source: 'components/economy/wallet/deposit-button.tsx',
    destination: 'components/deposit-button.tsx'
  },
  {
    source: 'components/economy/wallet/withdraw-button.tsx',
    destination: 'components/withdraw-button.tsx'
  },
  {
    source: 'components/economy/wallet/buy-dgt-button.tsx',
    destination: 'components/buy-dgt-button.tsx'
  },
  {
    source: 'components/economy/wallet/transaction-history.tsx',
    destination: 'components/transaction-history.tsx'
  },
  {
    source: 'components/economy/wallet/wallet-modal-v2.tsx',
    destination: 'components/wallet-modal.tsx'
  },
  {
    source: 'components/economy/wallet/wallet-balance.tsx',
    destination: 'components/wallet-balance.tsx'
  },
  {
    source: 'components/economy/wallet/animated-balance.tsx',
    destination: 'components/animated-balance.tsx'
  },
  {
    source: 'components/economy/wallet/wallet-address-display.tsx',
    destination: 'components/wallet-address-display.tsx'
  },
  
  // Pages
  {
    source: 'pages/wallet/index.tsx',
    destination: 'pages/WalletPage.tsx'
  }
];

// Ensure directory exists
function ensureDirectoryExists(dirPath: : AdminId): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

// Copy file and add refactoring comment
function copyWithRefactorComment(sourcePath: : AdminId, destPath: : AdminId): void {
  try {
    // Read source file
    let content = fs.readFileSync(sourcePath, 'utf-8');
    
    // Add refactoring comment to the top (after any existing comment block)
    if (content.startsWith('/**')) {
      // File has a JSDoc comment
      const commentEndIndex = content.indexOf('*/') + 2;
      const beforeComment = content.sub: AdminId(0, commentEndIndex);
      const afterComment = content.sub: AdminId(commentEndIndex);
      
      content = `${beforeComment}

// [REFAC-WALLET] Migrated from ${sourcePath.replace(CLIENT_SRC + '/', '')}
${afterComment}`;
    } else {
      // No JSDoc comment, add at the top
      content = `/**
 * [REFAC-WALLET] 
 * 
 * Migrated from ${sourcePath.replace(CLIENT_SRC + '/', '')}
 */

${content}`;
    }
    
    // Write to destination
    fs.writeFileSync(destPath, content, 'utf-8');
    console.log(`✅ Copied ${sourcePath} to ${destPath}`);
  } catch (error) {
    console.error(`❌ Error copying ${sourcePath} to ${destPath}:`, error);
  }
}

// Main function
async function main(): Promise<void> {
  console.log('Starting wallet component migration...');
  
  // Ensure wallet feature directories exist
  ensureDirectoryExists(WALLET_FEATURE_DIR);
  ensureDirectoryExists(path.resolve(WALLET_FEATURE_DIR, 'components'));
  ensureDirectoryExists(path.resolve(WALLET_FEATURE_DIR, 'pages'));
  ensureDirectoryExists(path.resolve(WALLET_FEATURE_DIR, 'hooks'));
  ensureDirectoryExists(path.resolve(WALLET_FEATURE_DIR, 'services'));
  ensureDirectoryExists(path.resolve(WALLET_FEATURE_DIR, 'utils'));
  
  // Copy each component
  for (const mapping of componentMappings) {
    const sourcePath = path.resolve(CLIENT_SRC, mapping.source);
    const destPath = path.resolve(WALLET_FEATURE_DIR, mapping.destination);
    
    if (fs.existsSync(sourcePath)) {
      copyWithRefactorComment(sourcePath, destPath);
    } else {
      console.warn(`⚠️ Source file not found: ${sourcePath}`);
    }
  }
  
  console.log('Wallet component migration complete!');
}

// Run the script
main().catch(console.error); 