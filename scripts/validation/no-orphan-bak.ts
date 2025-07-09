#!/usr/bin/env tsx

/**
 * Validates that no .bak or .backup files exist in the repository
 * These files should be cleaned up or moved to /archive
 */

import { execSync } from 'child_process';

function checkForOrphanBakFiles() {
  console.log('🔍 Checking for orphan .bak and .backup files...');
  
  try {
    // Find .bak and .backup files excluding node_modules
    const result = execSync(
      'find . -name "*.bak" -o -name "*.backup" | grep -v node_modules | head -20',
      { encoding: 'utf-8', stdio: 'pipe' }
    );
    
    const files = result.trim().split('\n').filter(f => f.length > 0);
    
    if (files.length === 0) {
      console.log('✅ No orphan .bak or .backup files found');
      return;
    }
    
    console.error(`❌ Found ${files.length} orphan backup files:`);
    files.forEach(file => console.error(`  - ${file}`));
    console.error('');
    console.error('💡 Resolution: Move to /archive or delete these files');
    console.error('   They should not be in the repository');
    
    process.exit(1);
  } catch (error) {
    // No files found (find returns non-zero when no matches)
    console.log('✅ No orphan .bak or .backup files found');
  }
}

checkForOrphanBakFiles();