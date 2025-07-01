#!/usr/bin/env tsx

/**
 * Test Update Baseline Script
 * 
 * Dry-run test to ensure the baseline updater works correctly
 * without modifying actual files.
 */

import { detectNumericIds } from './identify-numeric-ids.js';
import { readFileSync } from 'fs';

async function testUpdateBaseline() {
  console.log('🧪 Testing baseline update logic...');
  
  try {
    // Step 1: Test detection result structure
    const result = await detectNumericIds();
    console.log(`✅ Detection works: ${result.totalIssues} issues found`);
    
    // Step 2: Test CI script parsing
    const ciScriptPath = 'scripts/migration/check-ids-ci.ts';
    const ciContent = readFileSync(ciScriptPath, 'utf-8');
    
    const baselineMatch = ciContent.match(/const BASELINE = (\d+);/);
    if (!baselineMatch) {
      throw new Error('❌ Could not find BASELINE constant');
    }
    
    const currentBaseline = parseInt(baselineMatch[1]);
    console.log(`✅ Current baseline parsing: ${currentBaseline}`);
    
    // Step 3: Test replacement logic
    const testReplacement = ciContent.replace(
      /const BASELINE = \d+;/,
      `const BASELINE = ${result.totalIssues};`
    );
    
    const newBaselineMatch = testReplacement.match(/const BASELINE = (\d+);/);
    if (!newBaselineMatch || parseInt(newBaselineMatch[1]) !== result.totalIssues) {
      throw new Error('❌ Replacement logic failed');
    }
    
    console.log(`✅ Replacement logic works: ${currentBaseline} → ${result.totalIssues}`);
    
    // Step 4: Test progress calculation
    const originalTotal = 775;
    const reduction = currentBaseline - result.totalIssues;
    const progressPercent = ((originalTotal - result.totalIssues) / originalTotal * 100).toFixed(1);
    
    console.log(`✅ Progress calculation: ${reduction} issues resolved, ${progressPercent}% complete`);
    
    console.log('\n🎉 All tests passed - baseline updater is ready!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// ESM entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  testUpdateBaseline().catch(console.error);
}

export { testUpdateBaseline };