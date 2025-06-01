/**
 * Archive Deprecated Wallet Files
 * 
 * This script moves deprecated wallet-related files to the archive folder
 * as part of the wallet system refactoring project.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const ARCHIVE_DIR = path.join(__dirname, '../archive/wallet-refactor');
const SOURCE_FILES = [
  // Server files
  // 'server/wallet-routes.ts', // Already deleted
  'server/wallet-dgt-routes.ts',
  // 'server/wallet-routes-updated.ts', // Already deleted
  // 'server/wallet-tip-routes.ts', // Already deleted
  'server/services/wallet-service.ts',
  'server/services/ccpayment-client.ts',
  
  // Client files that may be deprecated after import rewrites
  // Note: Only archive these after verifying they're no longer needed
  // 'client/src/components/wallet/old-wallet-component.tsx',
];

// Ensure archive directory exists
if (!fs.existsSync(ARCHIVE_DIR)) {
  console.log(`Creating archive directory: ${ARCHIVE_DIR}`);
  fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
}

// Move files to archive
console.log('Moving deprecated wallet files to archive...');

let movedCount = 0;
let errorCount = 0;

SOURCE_FILES.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (fs.existsSync(fullPath)) {
    const fileName = path.basename(filePath);
    const destPath = path.join(ARCHIVE_DIR, fileName);
    
    try {
      // Create a copy in the archive folder
      fs.copyFileSync(fullPath, destPath);
      
      // Add a notice to the original file
      const originalContent = fs.readFileSync(fullPath, 'utf8');
      const notice = `/**
 * THIS FILE IS DEPRECATED
 * 
 * This file has been refactored as part of the wallet system restructuring.
 * The functionality has been moved to the domain-driven structure in:
 * - server/src/domains/wallet/
 * - server/src/domains/engagement/
 * 
 * A backup of this file is stored in archive/wallet-refactor/${fileName}
 * 
 * Do not make changes to this file as it will be removed soon.
 */

${originalContent}`;
      
      fs.writeFileSync(fullPath, notice);
      
      console.log(`✅ Archived: ${filePath}`);
      movedCount++;
    } catch (error) {
      console.error(`❌ Error archiving ${filePath}: ${error.message}`);
      errorCount++;
    }
  } else {
    console.log(`⚠️ File not found: ${filePath}`);
  }
});

console.log('\nSummary:');
console.log(`- ${movedCount} files archived`);
console.log(`- ${errorCount} errors encountered`);
console.log(`\nArchived files are stored in: ${ARCHIVE_DIR}`);
console.log('\nNote: Original files are still in place with a deprecation notice.');
console.log('They will be removed completely in a future update after testing.');

// Instructions for next steps
console.log('\nNext steps:');
console.log('1. Verify the new wallet system is working correctly');
console.log('2. Update import statements in remaining files');
console.log('3. Run integration tests');
console.log('4. When confident, use git to remove the original files'); 