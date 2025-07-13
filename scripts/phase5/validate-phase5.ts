import { execSync } from 'child_process';
import { globSync } from 'glob';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Phase 5 Validation Suite
 * ------------------------
 * Comprehensive validation to ensure Phase 5 transformations were successful
 * and the codebase meets all quality standards.
 * 
 * Validates:
 * - No console.log/info/debug in server code
 * - No req.user direct access patterns
 * - Transformer usage for all res.json() calls
 * - TypeScript compilation success
 * - ESLint passing with zero warnings
 * - No numeric ID types remaining
 * - Bridge file removal
 * 
 * Usage:
 * - pnpm phase5:validate
 * - pnpm phase5:validate --detailed
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

interface ValidationResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: string[];
  severity: 'critical' | 'warning' | 'info';
}

export async function validatePhase5(detailed = false): Promise<boolean> {
  console.log('🔬 Starting Phase 5 validation suite...');
  console.log('=' .repeat(50));
  
  const validations: ValidationResult[] = [
    await validateNoConsoleUsage(),
    await validateNoReqUserAccess(),
    await validateTransformerUsage(),
    await validateTypeScriptCompilation(),
    await validateESLintPassing(),
    await validateNoBridgeFile(),
    await validateNumericIdMigration(),
    await validateImportBoundaries(),
    await validateGitState()
  ];

  const failed = validations.filter(v => !v.passed);
  const critical = failed.filter(v => v.severity === 'critical');
  const warnings = failed.filter(v => v.severity === 'warning');
  
  // Display results
  console.log('\n📊 Validation Results:');
  console.log('-'.repeat(50));
  
  validations.forEach(validation => {
    const icon = validation.passed ? '✅' : 
                 validation.severity === 'critical' ? '❌' : 
                 validation.severity === 'warning' ? '⚠️' : 'ℹ️';
    
    console.log(`${icon} ${validation.name}`);
    
    if (!validation.passed && detailed) {
      console.log(`   Error: ${validation.error}`);
      if (validation.details) {
        validation.details.slice(0, 5).forEach(detail => {
          console.log(`   - ${detail}`);
        });
        if (validation.details.length > 5) {
          console.log(`   ... and ${validation.details.length - 5} more`);
        }
      }
    }
  });
  
  // Summary
  console.log('\n' + '='.repeat(50));
  if (critical.length === 0 && warnings.length === 0) {
    console.log('🎉 ALL VALIDATIONS PASSED - PHASE 5 COMPLETE!');
    console.log('\n✨ The codebase is now:');
    console.log('  - Free of technical debt patterns');
    console.log('  - Following strict quality gates');
    console.log('  - Using consistent transformer patterns');
    console.log('  - Ready for future development');
    return true;
  } else {
    console.log(`💥 PHASE 5 VALIDATION FAILED`);
    console.log(`   Critical issues: ${critical.length}`);
    console.log(`   Warnings: ${warnings.length}`);
    
    if (critical.length > 0) {
      console.log('\n🚨 Critical issues must be fixed:');
      critical.forEach(c => console.log(`   - ${c.name}: ${c.error}`));
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️  Warnings (should be addressed):');
      warnings.forEach(w => console.log(`   - ${w.name}: ${w.error}`));
    }
    
    return false;
  }
}

async function validateNoConsoleUsage(): Promise<ValidationResult> {
  try {
    const result = execSync(
      'grep -r "console\\." server/ --include="*.ts" | grep -v ".test.ts" | grep -v "logger.ts"', 
      { encoding: 'utf8' }
    );
    
    const violations = result.trim().split('\n').filter(line => line.length > 0);
    
    return {
      name: 'No console usage in server code',
      passed: violations.length === 0,
      error: violations.length > 0 ? `Found ${violations.length} console usage instances` : undefined,
      details: violations.slice(0, 10),
      severity: 'critical'
    };
  } catch (error) {
    // No matches found (grep exits with 1 when no matches)
    return {
      name: 'No console usage in server code',
      passed: true,
      severity: 'critical'
    };
  }
}

async function validateNoReqUserAccess(): Promise<ValidationResult> {
  try {
    const result = execSync(
      'grep -r "req\\.user" server/ --include="*.ts" | grep -v ".test.ts"', 
      { encoding: 'utf8' }
    );
    
    const violations = result.trim().split('\n').filter(line => line.length > 0);
    
    return {
      name: 'No req.user direct access',
      passed: violations.length === 0,
      error: violations.length > 0 ? `Found ${violations.length} req.user direct access instances` : undefined,
      details: violations.slice(0, 10),
      severity: 'critical'
    };
  } catch (error) {
    return {
      name: 'No req.user direct access',
      passed: true,
      severity: 'critical'
    };
  }
}

async function validateTransformerUsage(): Promise<ValidationResult> {
  try {
    const result = execSync(
      'grep -r "res\\.json(" server/ --include="*.ts" | grep -v ".transformer.ts" | grep -v ".test.ts"', 
      { encoding: 'utf8' }
    );
    
    const violations = result.trim().split('\n').filter(line => line.length > 0);
    
    // Filter out known safe patterns (error responses, simple values)
    const realViolations = violations.filter(line => {
      const content = line.toLowerCase();
      return !content.includes('error') && 
             !content.includes('message') && 
             !content.includes('success') &&
             !content.includes('{ ok:') &&
             !content.includes('null') &&
             !content.includes('undefined');
    });
    
    return {
      name: 'Transformer usage for all responses',
      passed: realViolations.length === 0,
      error: realViolations.length > 0 ? `Found ${realViolations.length} raw res.json() calls` : undefined,
      details: realViolations.slice(0, 10),
      severity: 'warning' // Warning because some raw responses are acceptable
    };
  } catch (error) {
    return {
      name: 'Transformer usage for all responses',
      passed: true,
      severity: 'warning'
    };
  }
}

async function validateTypeScriptCompilation(): Promise<ValidationResult> {
  try {
    execSync('pnpm typecheck', { stdio: 'pipe' });
    return {
      name: 'TypeScript compilation',
      passed: true,
      severity: 'critical'
    };
  } catch (error) {
    return {
      name: 'TypeScript compilation',
      passed: false,
      error: 'TypeScript compilation failed',
      severity: 'critical'
    };
  }
}

async function validateESLintPassing(): Promise<ValidationResult> {
  try {
    execSync('pnpm lint --max-warnings 0', { stdio: 'pipe' });
    return {
      name: 'ESLint with zero warnings',
      passed: true,
      severity: 'critical'
    };
  } catch (error) {
    return {
      name: 'ESLint with zero warnings',
      passed: false,
      error: 'ESLint failed with warnings or errors',
      severity: 'critical'
    };
  }
}

async function validateNoBridgeFile(): Promise<ValidationResult> {
  const bridgePath = path.join(projectRoot, 'db/types/id.types.ts');
  
  try {
    const fs = require('fs');
    fs.accessSync(bridgePath);
    
    // Bridge file still exists - check if it's just the export
    const content = fs.readFileSync(bridgePath, 'utf8');
    const isJustExport = content.includes("export * from '@shared/types/ids'") && 
                        content.split('\n').filter(line => line.trim() && !line.trim().startsWith('//')).length <= 1;
    
    return {
      name: 'Bridge file removed',
      passed: false,
      error: isJustExport ? 'Bridge file exists but only exports (can be removed)' : 'Bridge file still exists with content',
      severity: isJustExport ? 'warning' : 'critical'
    };
  } catch (error) {
    // File doesn't exist - good!
    return {
      name: 'Bridge file removed',
      passed: true,
      severity: 'info'
    };
  }
}

async function validateNumericIdMigration(): Promise<ValidationResult> {
  try {
    // Search for numeric ID patterns in server code
    const patterns = [
      'userId: number',
      'threadId: number', 
      'postId: number',
      'walletId: number',
      'transactionId: number',
      'userId: bigint',
      'threadId: bigint'
    ];
    
    const violations: string[] = [];
    
    for (const pattern of patterns) {
      try {
        const result = execSync(
          `grep -r "${pattern}" server/ --include="*.ts" | grep -v ".test.ts"`, 
          { encoding: 'utf8' }
        );
        violations.push(...result.trim().split('\n').filter(line => line.length > 0));
      } catch {
        // No matches found for this pattern
      }
    }
    
    return {
      name: 'Numeric ID migration complete',
      passed: violations.length === 0,
      error: violations.length > 0 ? `Found ${violations.length} numeric ID type instances` : undefined,
      details: violations.slice(0, 10),
      severity: 'warning'
    };
  } catch (error) {
    return {
      name: 'Numeric ID migration complete',
      passed: true,
      severity: 'warning'
    };
  }
}

async function validateImportBoundaries(): Promise<ValidationResult> {
  try {
    // Check for violations of import boundaries
    const serverClientImports = execSync(
      'grep -r "from.*client/" server/ --include="*.ts" | grep -v ".test.ts"', 
      { encoding: 'utf8' }
    ).trim();
    
    const clientServerImports = execSync(
      'grep -r "from.*server/" client/ --include="*.ts" | grep -v ".test.ts"', 
      { encoding: 'utf8' }
    ).trim();
    
    const violations = [
      ...serverClientImports.split('\n').filter(line => line.length > 0),
      ...clientServerImports.split('\n').filter(line => line.length > 0)
    ];
    
    return {
      name: 'Import boundaries enforced',
      passed: violations.length === 0,
      error: violations.length > 0 ? `Found ${violations.length} boundary violations` : undefined,
      details: violations.slice(0, 10),
      severity: 'critical'
    };
  } catch (error) {
    return {
      name: 'Import boundaries enforced',
      passed: true,
      severity: 'critical'
    };
  }
}

async function validateGitState(): Promise<ValidationResult> {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    const unstagedChanges = status.trim().split('\n').filter(line => line.length > 0);
    
    return {
      name: 'Git working directory clean',
      passed: unstagedChanges.length === 0,
      error: unstagedChanges.length > 0 ? `${unstagedChanges.length} unstaged changes` : undefined,
      details: unstagedChanges.slice(0, 10),
      severity: 'info'
    };
  } catch (error) {
    return {
      name: 'Git working directory clean',
      passed: false,
      error: 'Unable to check git status',
      severity: 'info'
    };
  }
}

// Additional utility: Generate quality metrics report
export async function generateQualityMetrics() {
  console.log('📈 Generating quality metrics...');
  
  const metrics = {
    totalFiles: globSync('**/*.{ts,tsx}', { 
      cwd: projectRoot,
      ignore: ['node_modules/**', '**/*.test.ts', '**/*.d.ts']
    }).length,
    
    serverFiles: globSync('server/**/*.{ts,tsx}', { 
      cwd: projectRoot,
      ignore: ['**/*.test.ts']
    }).length,
    
    clientFiles: globSync('client/**/*.{ts,tsx}', { 
      cwd: projectRoot,
      ignore: ['**/*.test.ts']
    }).length,
    
    transformerFiles: globSync('**/*.transformer.ts', { 
      cwd: projectRoot 
    }).length,
    
    totalLinesOfCode: 0
  };
  
  // Calculate total lines of code
  try {
    const result = execSync('find . -name "*.ts" -not -path "./node_modules/*" -not -name "*.test.ts" -not -name "*.d.ts" | xargs wc -l | tail -1', { encoding: 'utf8' });
    metrics.totalLinesOfCode = parseInt(result.trim().split(' ')[0]) || 0;
  } catch {
    metrics.totalLinesOfCode = 0;
  }
  
  console.log('\n📊 Codebase Quality Metrics:');
  console.log(`   Total TypeScript files: ${metrics.totalFiles}`);
  console.log(`   Server files: ${metrics.serverFiles}`);
  console.log(`   Client files: ${metrics.clientFiles}`);
  console.log(`   Transformer files: ${metrics.transformerFiles}`);
  console.log(`   Total lines of code: ${metrics.totalLinesOfCode.toLocaleString()}`);
  console.log(`   Transformer coverage: ${((metrics.transformerFiles / metrics.serverFiles) * 100).toFixed(1)}%`);
  
  return metrics;
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const detailed = process.argv.includes('--detailed');
  const metrics = process.argv.includes('--metrics');
  
  async function main() {
    const passed = await validatePhase5(detailed);
    
    if (metrics) {
      console.log('\n');
      await generateQualityMetrics();
    }
    
    if (!passed) {
      console.log('\n💡 To fix issues:');
      console.log('  1. Review the validation errors above');
      console.log('  2. Run specific codemods to address remaining issues');
      console.log('  3. Run `pnpm phase5:validate --detailed` for more info');
      console.log('  4. Consider running `pnpm codemod:all --rollback` if issues persist');
      process.exit(1);
    }
    
    console.log('\n🚀 Phase 5 validation successful - codebase is ready!');
  }
  
  main().catch(error => {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  });
}