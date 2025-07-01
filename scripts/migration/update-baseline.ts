#!/usr/bin/env tsx

/**
 * Update CI Baseline After Successful Migration
 * 
 * Automates the post-merge process:
 * 1. Regenerates numeric-id report  
 * 2. Updates BASELINE in check-ids-ci.ts
 * 3. Commits the changes
 */

import { detectNumericIds } from './identify-numeric-ids.js';
import { readFileSync, writeFileSync } from 'fs';

async function main() {
  console.log('🔄 Updating migration baseline after successful merge...');
  
  // Step 1: Regenerate detection report
  console.log('1. Regenerating numeric-ID report...');
  const result = await detectNumericIds();
  const newCount = result.totalIssues;
  
  // Step 2: Update CI script baseline
  console.log('2. Updating CI baseline...');
  const ciScriptPath = 'scripts/migration/check-ids-ci.ts';
  const ciContent = readFileSync(ciScriptPath, 'utf-8');
  
  // Extract current baseline
  const baselineMatch = ciContent.match(/const BASELINE = (\d+);/);
  if (!baselineMatch) {
    throw new Error('Could not find BASELINE constant in check-ids-ci.ts');
  }
  
  const oldBaseline = parseInt(baselineMatch[1]);
  console.log(`   Old baseline: ${oldBaseline}`);
  console.log(`   New baseline: ${newCount}`);
  
  if (newCount >= oldBaseline) {
    console.warn('⚠️ No progress made - baseline not reduced');
    if (newCount > oldBaseline) {
      throw new Error('Baseline increased - this should not happen after migration');
    }
  }
  
  // Update the baseline
  const updatedContent = ciContent.replace(
    /const BASELINE = \d+;/,
    `const BASELINE = ${newCount};`
  );
  
  writeFileSync(ciScriptPath, updatedContent);
  
  // Step 3: Show progress
  const reduction = oldBaseline - newCount;
  console.log('');
  console.log('✅ Baseline updated successfully');
  console.log(`📉 Progress: ${reduction} issues resolved`);
  console.log(`📊 Remaining: ${newCount} issues`);
  console.log(`🎯 Progress: ${((775 - newCount) / 775 * 100).toFixed(1)}% complete`);
  
  // Step 4: Next steps
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Commit the updated baseline');
  console.log('2. Plan next migration batch');
  console.log('3. Continue systematic migration');
  
  // Future tightening suggestion
  if (newCount < 100) {
    console.log('');
    console.log('💡 Suggestion: Consider tightening CI rule to exact match');
    console.log('   Change ">" to "!==" in check-ids-ci.ts for stricter validation');
  }
}

// ESM entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main as updateBaseline };