#!/usr/bin/env tsx

/**
 * Master Validation Runner
 * 
 * Runs comprehensive validation checks across the entire codebase:
 * - Import validation and module boundaries
 * - Database migration safety checks
 * - Forum configuration consistency
 * - TypeScript compilation checks
 */

import { execSync, exec } from 'node:child_process';
import { promisify } from 'node:util';
import chalk from 'chalk';
import * as path from 'path';

const execAsync = promisify(exec);

interface ValidationCheck {
  name: string;
  description: string;
  command: string;
  required: boolean;
  timeout?: number;
}

interface ValidationResult {
  name: string;
  success: boolean;
  duration: number;
  output?: string;
  error?: string;
}

class ValidationRunner {
  private results: ValidationResult[] = [];
  private projectRoot: string;

  constructor() {
    this.projectRoot = process.cwd();
  }

  private getChecks(): ValidationCheck[] {
    return [
      {
        name: 'Import Validation',
        description: 'Validates TypeScript imports and module boundaries',
        command: 'tsx scripts/validate-imports.ts',
        required: true,
        timeout: 60000
      },
      {
        name: 'Migration Safety',
        description: 'Checks SQL migrations for unsafe operations',
        command: 'tsx scripts/ops/validate-safe-migrations.ts',
        required: true,
        timeout: 30000
      },
      {
        name: 'Forum FK Consistency',
        description: 'Validates forum foreign key relationships',
        command: 'tsx scripts/testing/validate-forum-fks.ts',
        required: false,
        timeout: 45000
      },
      {
        name: 'TypeScript Compilation (Server)',
        description: 'Verifies server TypeScript compilation',
        command: 'pnpm tsc -p server --noEmit',
        required: true,
        timeout: 120000
      },
      {
        name: 'TypeScript Compilation (Client)',
        description: 'Verifies client TypeScript compilation',
        command: 'pnpm tsc -p client --noEmit',
        required: true,
        timeout: 120000
      },
      {
        name: 'ESLint Check',
        description: 'Runs ESLint on the codebase',
        command: 'pnpm lint --quiet',
        required: false,
        timeout: 90000
      }
    ];
  }

  private async runCheck(check: ValidationCheck): Promise<ValidationResult> {
    const startTime = Date.now();
    
    try {
      console.log(chalk.blue(`🔍 ${check.name}...`));
      console.log(chalk.gray(`   ${check.description}`));

      const { stdout, stderr } = await execAsync(check.command, {
        cwd: this.projectRoot,
        timeout: check.timeout || 60000,
        encoding: 'utf8'
      });

      const duration = Date.now() - startTime;
      
      return {
        name: check.name,
        success: true,
        duration,
        output: stdout.trim()
      };

    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      return {
        name: check.name,
        success: false,
        duration,
        error: error.message || 'Unknown error',
        output: error.stdout || error.stderr || ''
      };
    }
  }

  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  }

  private printSummary(): void {
    console.log('\n' + '='.repeat(60));
    console.log(chalk.bold('VALIDATION SUMMARY'));
    console.log('='.repeat(60));

    const passed = this.results.filter(r => r.success);
    const failed = this.results.filter(r => !r.success);

    // Print results
    for (const result of this.results) {
      const icon = result.success ? '✅' : '❌';
      const duration = this.formatDuration(result.duration);
      
      console.log(`${icon} ${result.name} ${chalk.gray(`(${duration})`)}`);
      
      if (!result.success) {
        if (result.output) {
          console.log(chalk.red(`   Output: ${result.output.substring(0, 200)}...`));
        }
        if (result.error) {
          console.log(chalk.red(`   Error: ${result.error.substring(0, 200)}...`));
        }
      }
    }

    // Summary stats
    console.log('\n' + '-'.repeat(40));
    console.log(chalk.green(`✅ Passed: ${passed.length}`));
    if (failed.length > 0) {
      console.log(chalk.red(`❌ Failed: ${failed.length}`));
    }
    
    const totalTime = this.results.reduce((sum, r) => sum + r.duration, 0);
    console.log(chalk.gray(`⏱️  Total time: ${this.formatDuration(totalTime)}`));

    // Final status
    console.log('\n' + '='.repeat(60));
    if (failed.length === 0) {
      console.log(chalk.green.bold('🎉 ALL VALIDATIONS PASSED!'));
    } else {
      console.log(chalk.red.bold('💥 VALIDATION FAILURES DETECTED'));
      
      const requiredChecks = this.getChecks().filter(c => c.required);
      const requiredFailed = failed.filter(f => 
        requiredChecks.some(c => c.name === f.name)
      );
      
      if (requiredFailed.length > 0) {
        console.log(chalk.red('Required checks failed - build should not proceed'));
      }
    }
  }

  async runAll(): Promise<boolean> {
    console.log(chalk.cyan.bold('🚀 Running comprehensive validation suite...\n'));
    
    const checks = this.getChecks();
    
    for (const check of checks) {
      const result = await this.runCheck(check);
      this.results.push(result);
      
      if (result.success) {
        console.log(chalk.green(`   ✅ ${result.name} passed\n`));
      } else {
        console.log(chalk.red(`   ❌ ${result.name} failed\n`));
        if (check.required) {
          console.log(chalk.red(`   ⚠️  This is a required check\n`));
        }
      }
    }

    this.printSummary();

    // Return true only if all required checks pass
    const requiredChecks = checks.filter(c => c.required);
    const requiredFailed = this.results.filter(r => 
      !r.success && requiredChecks.some(c => c.name === r.name)
    );

    return requiredFailed.length === 0;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: tsx scripts/validate-everything.ts [options]

Options:
  --help, -h     Show this help message
  --verbose, -v  Show detailed output
  --quick, -q    Run only required checks

This script runs comprehensive validation checks across the codebase:
- Import validation and module boundaries
- Database migration safety
- Forum configuration consistency  
- TypeScript compilation
- Code linting

Exit codes:
  0 - All required validations passed
  1 - One or more required validations failed
`);
    process.exit(0);
  }

  const runner = new ValidationRunner();
  const success = await runner.runAll();
  
  process.exit(success ? 0 : 1);
}

// ESM compatibility check
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(chalk.red('Fatal error during validation:'), error);
    process.exit(1);
  });
}