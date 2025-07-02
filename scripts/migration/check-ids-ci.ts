#!/usr/bin/env tsx

/**
 * CI Numeric-ID Guard
 * 
 * Prevents regression by enforcing a moving ceiling on numeric ID issues.
 * Run this in CI after each migration batch to ensure no new issues introduced.
 */

import { detectNumericIds } from './identify-numeric-ids.js';

// Current baseline - update after each successful migration batch
const BASELINE = 594;

async function main() {
  console.log('🛡️ Running numeric-ID regression guard...');
  
  try {
    const result = await detectNumericIds();
    const currentIssues = result.totalIssues;
    
    console.log(`🧮 Current issues: ${currentIssues}`);
    console.log(`📊 Baseline: ${BASELINE}`);
    console.log(`📈 Change: ${currentIssues - BASELINE > 0 ? '+' : ''}${currentIssues - BASELINE}`);
    
    if (currentIssues > BASELINE) {
      console.error('❌ NEW NUMERIC-ID ISSUES INTRODUCED');
      console.error(`Expected ≤${BASELINE} issues, found ${currentIssues}`);
      console.error('This indicates new numeric ID usage was added.');
      console.error('');
      console.error('Fix by either:');
      console.error('1. Remove the new numeric ID usage');
      console.error('2. Use branded types from @degentalk/shared');
      console.error('3. If intentional, update BASELINE in check-ids-ci.ts');
      process.exit(1);
    }
    
    if (currentIssues < BASELINE) {
      console.log('🎉 PROGRESS! Issues reduced from baseline');
      console.log('Remember to update BASELINE after merging this PR');
    }
    
    if (currentIssues === BASELINE) {
      console.log('✅ No new numeric-ID issues introduced');
    }
    
    console.log('');
    console.log('📋 Next steps after merge:');
    console.log(`1. Update BASELINE from ${BASELINE} to ${currentIssues}`);
    console.log('2. Regenerate numeric-id-report.json');
    console.log('3. Continue with next migration batch');
    
  } catch (error) {
    console.error('❌ Failed to run numeric-ID detection:', error);
    process.exit(1);
  }
}

// ESM entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main as checkNumericIdRegression };