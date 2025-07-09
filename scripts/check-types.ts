#!/usr/bin/env tsx

/**
 * Aggregate TypeScript checker for split tsconfigs
 * Provides separate error counts for client and server
 */

import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

interface CheckResult {
  name: string;
  errors: number;
  command: string;
}

function runTscCheck(name: string, configPath: string): CheckResult {
  const command = `npx tsc -p ${configPath} --noEmit --skipLibCheck --pretty false`;
  
  try {
    const output = execSync(command, { 
      cwd: projectRoot,
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    
    return {
      name,
      errors: 0,
      command
    };
  } catch (error: any) {
    const output = error.stdout || error.message || '';
    const errorCount = (output.match(/error TS/g) || []).length;
    
    return {
      name,
      errors: errorCount,
      command
    };
  }
}

function main() {
  console.log('🔍 Checking TypeScript errors across workspace...\n');
  
  const checks: CheckResult[] = [
    runTscCheck('Client', 'tsconfig.client.json'),
    runTscCheck('Server', 'tsconfig.server.json')
  ];
  
  const totalErrors = checks.reduce((sum, check) => sum + check.errors, 0);
  
  // Display results
  console.log('📊 TypeScript Error Summary:');
  console.log('─'.repeat(50));
  
  for (const check of checks) {
    const status = check.errors === 0 ? '✅' : '❌';
    console.log(`${status} ${check.name.padEnd(10)} ${check.errors.toString().padStart(6)} errors`);
  }
  
  console.log('─'.repeat(50));
  console.log(`   Total:      ${totalErrors.toString().padStart(6)} errors`);
  console.log('');
  
  // Progress indicator
  if (totalErrors === 0) {
    console.log('🎉 All TypeScript checks passed!');
  } else if (totalErrors < 50) {
    console.log('🎯 Close to target! (<50 errors)');
  } else if (totalErrors < 500) {
    console.log('📈 Good progress! (Target: <50 errors)');
  } else if (totalErrors < 2000) {
    console.log('🔨 Making progress... (Target: <50 errors)');
  } else {
    console.log('🚧 Significant work needed (Target: <50 errors)');
  }
  
  // Show individual check commands
  console.log('\n💡 Individual check commands:');
  for (const check of checks) {
    console.log(`   ${check.name}: ${check.command}`);
  }
  
  // Exit with error code if there are errors
  process.exit(totalErrors > 0 ? 1 : 0);
}

main();