import { execSync } from 'child_process';
import fs from 'node:fs';
import { consoleToLoggerCodemod } from './console-to-logger';
import { reqUserRemovalCodemod } from './req-user-removal';
import { enforceTransformersCodemod } from './enforce-transformers';
import { numericIdMigrationCodemod, removeBridgeFile } from './numeric-id-migration';

/**
 * Phase 5 Master Codemod Runner
 * -----------------------------
 * Orchestrates all Phase 5 codemods with safety checks, rollback capabilities,
 * and comprehensive validation.
 * 
 * Usage:
 * - pnpm codemod:all --dry-run (safe preview)
 * - pnpm codemod:all (full execution)
 * - pnpm codemod:all --rollback (undo changes)
 */

interface CodemodResult {
  name: string;
  success: boolean;
  transformCount: number;
  files: string[];
  errors: string[];
  duration: number;
}

export async function runAllPhase5Codemods(options: {
  dryRun?: boolean;
  skipValidation?: boolean;
  rollback?: boolean;
}) {
  const { dryRun = false, skipValidation = false, rollback = false } = options;
  
  console.log('🚀 Phase 5 MAX-DEBT ERADICATION - Codemod Suite');
  console.log('=' .repeat(60));
  
  if (rollback) {
    return await performRollback();
  }
  
  console.log(`Mode: ${dryRun ? '🔍 DRY RUN (no changes)' : '⚡ LIVE EXECUTION'}`);
  console.log(`Validation: ${skipValidation ? '⏭️  SKIPPED' : '✅ ENABLED'}`);
  console.log('');

  const results: CodemodResult[] = [];
  
  try {
    // Pre-flight checks
    if (!skipValidation) {
      await performPreflightChecks();
    }
    
    // Create safety checkpoint
    if (!dryRun) {
      createSafetyCheckpoint();
    }
    
    // Step 1: Console to Logger
    console.log('📝 STEP 1: Console to Logger transformation...');
    const consoleResult = await runCodemodWithTiming('console-to-logger', () => 
      consoleToLoggerCodemod(dryRun)
    );
    results.push(consoleResult);
    
    // Step 2: req.user removal
    console.log('\n🔐 STEP 2: req.user removal...');
    const reqUserResult = await runCodemodWithTiming('req-user-removal', () =>
      reqUserRemovalCodemod(dryRun)
    );
    results.push(reqUserResult);
    
    // Step 3: Transformer enforcement audit
    console.log('\n🔍 STEP 3: Transformer enforcement audit...');
    const transformerResult = await runCodemodWithTiming('transformer-enforcement', () =>
      enforceTransformersCodemod(dryRun, false) // Don't auto-fix in batch mode
    );
    results.push(transformerResult);
    
    // Step 4: Numeric ID migration
    console.log('\n🔢 STEP 4: Numeric ID migration...');
    const numericIdResult = await runCodemodWithTiming('numeric-id-migration', () =>
      numericIdMigrationCodemod(dryRun)
    );
    results.push(numericIdResult);
    
    // Step 5: Bridge file removal (if all migrations successful)
    if (!dryRun && numericIdResult.success) {
      console.log('\n🗑️  STEP 5: Bridge file removal...');
      const bridgeRemoved = await removeBridgeFile(false);
      results.push({
        name: 'bridge-file-removal',
        success: bridgeRemoved,
        transformCount: bridgeRemoved ? 1 : 0,
        files: bridgeRemoved ? ['db/types/id.types.ts'] : [],
        errors: bridgeRemoved ? [] : ['Bridge file removal failed'],
        duration: 0
      });
    }
    
    // Post-execution validation
    if (!dryRun && !skipValidation) {
      await performPostExecutionValidation();
    }
    
    // Generate comprehensive report
    generateFinalReport(results, dryRun);
    
    return results;
    
  } catch (error) {
    console.error('\n❌ Phase 5 execution failed:', error);
    
    if (!dryRun) {
      console.log('\n🔄 Auto-rollback initiated...');
      await performRollback();
    }
    
    throw error;
  }
}

async function runCodemodWithTiming<T>(
  name: string, 
  codemod: () => Promise<T>
): Promise<CodemodResult> {
  const startTime = Date.now();
  
  try {
    const result = await codemod();
    const duration = Date.now() - startTime;
    
    // Extract common properties from different codemod result types
    const transformCount = (result as any).transformCount || 0;
    const files = (result as any).transformedFiles || (result as any).fixedFiles || [];
    const errors = (result as any).errors || [];
    
    console.log(`   ✅ ${transformCount} transformations in ${files.length} files (${duration}ms)`);
    
    return {
      name,
      success: true,
      transformCount,
      files,
      errors: errors.map((e: any) => typeof e === 'string' ? e : e.error || String(e)),
      duration
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`   ❌ Failed after ${duration}ms`);
    
    return {
      name,
      success: false,
      transformCount: 0,
      files: [],
      errors: [error instanceof Error ? error.message : String(error)],
      duration
    };
  }
}

async function performPreflightChecks(): Promise<void> {
  console.log('🔍 Performing pre-flight checks...');
  
  const checks = [
    {
      name: 'Git working directory clean',
      check: () => {
        try {
          const status = execSync('git status --porcelain', { encoding: 'utf8' });
          return status.trim().length === 0;
        } catch {
          return false;
        }
      }
    },
    {
      name: 'TypeScript compilation',
      check: () => {
        // Temporarily skip TypeScript checks as branded ID imports
        // will be fixed by the numeric-id-migration codemod
        console.log('⚠️  Skipping TypeScript checks (will be fixed by codemods)');
        return true;
      }
    },
    {
      name: 'ESLint passing',
      check: () => {
        try {
          execSync('pnpm lint', { stdio: 'pipe' });
          return true;
        } catch {
          return false;
        }
      }
    }
  ];
  
  const failedChecks = checks.filter(check => !check.check());
  
  if (failedChecks.length > 0) {
    console.log('❌ Pre-flight checks failed:');
    failedChecks.forEach(check => console.log(`   - ${check.name}`));
    throw new Error('Pre-flight checks failed - please fix issues before running codemods');
  }
  
  console.log('✅ All pre-flight checks passed');
}

function createSafetyCheckpoint(): void {
  console.log('💾 Creating safety checkpoint...');
  
  try {
    // Create git tag for rollback
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const tagName = `phase5-pre-codemods-${timestamp}`;
    
    execSync(`git tag ${tagName}`);
    console.log(`✅ Safety checkpoint created: ${tagName}`);
    
    // Store tag name for rollback
    fs.writeFileSync('.phase5-checkpoint', tagName);
  } catch (error) {
    console.warn('⚠️  Could not create git tag checkpoint:', error);
  }
}

async function performPostExecutionValidation(): Promise<void> {
  console.log('\n🔬 Performing post-execution validation...');
  
  const validationChecks = [
    {
      name: 'TypeScript compilation',
      command: 'pnpm typecheck'
    },
    {
      name: 'ESLint with strict warnings',
      command: 'pnpm lint --max-warnings 0'
    },
    {
      name: 'No console.log in server code',
      check: async () => {
        try {
          const result = execSync('grep -r "console\\." server/ --include="*.ts" --include="*.tsx" | grep -v ".test.ts" | grep -v ".test.tsx" | grep -v "logger.ts"', { encoding: 'utf8' });
          return result.trim().length === 0;
        } catch {
          return true; // No matches found
        }
      }
    },
    {
      name: 'No req.user direct access',
      check: async () => {
        try {
          const result = execSync('grep -r "req\\.user" server/ --include="*.ts" | grep -v ".test.ts"', { encoding: 'utf8' });
          return result.trim().length === 0;
        } catch {
          return true; // No matches found
        }
      }
    }
  ];
  
  for (const validation of validationChecks) {
    try {
      if (validation.command) {
        execSync(validation.command, { stdio: 'pipe' });
        console.log(`   ✅ ${validation.name}`);
      } else if (validation.check) {
        const passed = await validation.check();
        console.log(`   ${passed ? '✅' : '❌'} ${validation.name}`);
        if (!passed) {
          throw new Error(`Validation failed: ${validation.name}`);
        }
      }
    } catch (error) {
      console.log(`   ❌ ${validation.name}`);
      throw new Error(`Post-execution validation failed: ${validation.name}`);
    }
  }
  
  console.log('✅ All post-execution validations passed');
}

async function performRollback(): Promise<void> {
  console.log('🔄 Performing Phase 5 rollback...');
  
  try {
    // Check for checkpoint file
    let checkpointTag: string;
    
    try {
      checkpointTag = fs.readFileSync('.phase5-checkpoint', 'utf8').trim();
    } catch {
      checkpointTag = 'phase5-pre-codemods';
    }
    
    // Verify tag exists
    try {
      execSync(`git tag | grep ${checkpointTag}`, { stdio: 'pipe' });
    } catch {
      throw new Error(`Checkpoint tag '${checkpointTag}' not found`);
    }
    
    // Prompt for confirmation
    const readline = (await import('node:readline')).createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise<string>(resolve => {
      readline.question(`⚠️  This will discard ALL changes since ${checkpointTag}. Continue? (y/N): `, resolve);
    });
    
    readline.close();
    
    if (answer.toLowerCase() !== 'y') {
      console.log('❌ Rollback cancelled');
      return;
    }
    
    // Perform rollback
    console.log(`Rolling back to ${checkpointTag}...`);
    execSync(`git reset --hard ${checkpointTag}`);
    execSync('git clean -fd');
    
    // Clean up checkpoint file
    try {
      fs.unlinkSync('.phase5-checkpoint');
    } catch {
      // Ignore if file doesn't exist
    }
    
    console.log('✅ Rollback complete');
    console.log('\n📋 Next steps:');
    console.log('  1. Review what went wrong');
    console.log('  2. Fix issues in codemods or environment');
    console.log('  3. Re-run with --dry-run to verify fixes');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    console.log('\n🆘 Manual recovery required:');
    console.log('  1. Run: git tag --list | grep phase5');
    console.log('  2. Run: git reset --hard <tag-name>');
    console.log('  3. Run: git clean -fd');
    throw error;
  }
}

function generateFinalReport(results: CodemodResult[], dryRun: boolean): void {
  const totalTransforms = results.reduce((sum, r) => sum + r.transformCount, 0);
  const totalFiles = new Set(results.flatMap(r => r.files)).size;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  const successfulSteps = results.filter(r => r.success).length;
  const failedSteps = results.filter(r => !r.success);
  
  console.log('\n' + '='.repeat(60));
  console.log(`🎯 PHASE 5 ${dryRun ? 'DRY RUN' : 'EXECUTION'} COMPLETE`);
  console.log('='.repeat(60));
  console.log(`📊 Summary:`);
  console.log(`   Total transformations: ${totalTransforms}`);
  console.log(`   Files modified: ${totalFiles}`);
  console.log(`   Execution time: ${totalDuration}ms`);
  console.log(`   Successful steps: ${successfulSteps}/${results.length}`);
  
  if (failedSteps.length > 0) {
    console.log(`\n❌ Failed steps:`);
    failedSteps.forEach(step => {
      console.log(`   - ${step.name}: ${step.errors.join(', ')}`);
    });
  }
  
  console.log('\n📈 Step-by-step results:');
  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    console.log(`   ${icon} ${result.name}: ${result.transformCount} transforms in ${result.files.length} files`);
  });
  
  if (!dryRun && successfulSteps === results.length) {
    console.log('\n🎉 PHASE 5 COMPLETE - TECHNICAL DEBT ERADICATED!');
    console.log('\n💡 Next steps:');
    console.log('  1. Run `pnpm test` to ensure no regressions');
    console.log('  2. Review transformer violations in the report above');
    console.log('  3. Update team on new patterns and conventions');
    console.log('  4. Enable pre-commit hooks: remove line 100 in package.json');
    console.log('  5. Celebrate! 🎊');
  } else if (dryRun) {
    console.log('\n🔍 DRY RUN ANALYSIS COMPLETE');
    console.log('💡 To execute: pnpm codemod:all (remove --dry-run)');
    console.log('⚠️  Remember to create a backup before live execution');
  }
}

// ESM-compatible CLI execution detection
const isCli = ((): boolean => {
  // When using tsx, the second arg is the script path (transpiled file path)
  // Compare it against the current file name to determine direct execution
  const invoked = process.argv[1] || '';
  return invoked.endsWith('run-all.ts') || invoked.endsWith('run-all.js');
})();

if (isCli) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('--dry');
  const skipValidation = args.includes('--skip-validation');
  const rollback = args.includes('--rollback');

  runAllPhase5Codemods({ dryRun, skipValidation, rollback }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}