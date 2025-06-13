#!/usr/bin/env tsx

/**
 * 🚀 ULTIMATE DEV HYGIENE VALIDATOR
 * 
 * Runs all validation checks to ensure codebase health:
 * - Import boundaries and path aliases
 * - TypeScript compilation
 * - Vite config safety
 * - Schema consistency
 * 
 * Usage:
 *   npm run validate-everything
 *   npm run validate-everything --fix
 *   npm run validate-everything --fail-fast
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import path from 'path';

const execAsync = promisify(exec);

interface ValidationResult {
  name: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
  details?: string[];
  duration: number;
}

class DegentalktValidator {
  private results: ValidationResult[] = [];
  private startTime: number = Date.now();
  private shouldFix: boolean = false;
  private failFast: boolean = false;

  constructor() {
    const args = process.argv.slice(2);
    this.shouldFix = args.includes('--fix');
    this.failFast = args.includes('--fail-fast');
  }

  private async runCheck(
    name: string,
    checkFn: () => Promise<{ status: 'passed' | 'failed' | 'warning'; message: string; details?: string[] }>
  ): Promise<void> {
    const start = Date.now();
    
    try {
      console.log(chalk.blue(`🔍 ${name}...`));
      const result = await checkFn();
      const duration = Date.now() - start;
      
      this.results.push({
        name,
        ...result,
        duration
      });

      const emoji = result.status === 'passed' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
      const color = result.status === 'passed' ? 'green' : result.status === 'warning' ? 'yellow' : 'red';
      
      console.log(chalk[color](`${emoji} ${name}: ${result.message} (${duration}ms)`));
      
      if (result.details) {
        result.details.forEach(detail => {
          console.log(chalk.gray(`   → ${detail}`));
        });
      }

      if (this.failFast && result.status === 'failed') {
        console.log(chalk.red('\n💥 FAIL-FAST MODE: Stopping on first failure'));
        process.exit(1);
      }
      
    } catch (error) {
      const duration = Date.now() - start;
      this.results.push({
        name,
        status: 'failed',
        message: `Crashed: ${error}`,
        duration
      });
      
      console.log(chalk.red(`❌ ${name}: CRASHED (${duration}ms)`));
      console.log(chalk.gray(`   → ${error}`));
      
      if (this.failFast) {
        console.log(chalk.red('\n💥 FAIL-FAST MODE: Stopping on crash'));
        process.exit(1);
      }
    }
  }

  private async checkImportBoundaries(): Promise<{ status: 'passed' | 'failed' | 'warning'; message: string; details?: string[] }> {
    try {
      const { stdout, stderr } = await execAsync(`npx tsx scripts/validate-imports.ts ${this.shouldFix ? '--fix' : ''}`, {
        cwd: path.resolve(process.cwd())
      });
      
      // Parse output to determine if there were issues
      const hasErrors = stdout.includes('🚨 ERRORS') || stderr.includes('Error');
      const hasWarnings = stdout.includes('⚠️  WARNINGS');
      
      if (hasErrors) {
        return {
          status: 'failed',
          message: 'Import boundary violations found',
          details: ['Run "npm run check-imports --fix" to resolve automatically']
        };
      } else if (hasWarnings) {
        return {
          status: 'warning',
          message: 'Import warnings found',
          details: ['Some imports may need manual review']
        };
      } else {
        return {
          status: 'passed',
          message: 'All import boundaries respected'
        };
      }
    } catch (error) {
      return {
        status: 'failed',
        message: 'Import validation failed',
        details: [`Error: ${error}`]
      };
    }
  }

  private async checkTypeScriptCompilation(): Promise<{ status: 'passed' | 'failed' | 'warning'; message: string; details?: string[] }> {
    try {
      await execAsync('npx tsc --noEmit', { cwd: path.resolve(process.cwd()) });
      return {
        status: 'passed',
        message: 'TypeScript compiles without errors'
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorLines = errorMessage.split('\n').filter(line => line.trim());
      
      return {
        status: 'failed',
        message: 'TypeScript compilation errors',
        details: errorLines.slice(0, 10) // Show first 10 errors
      };
    }
  }

  private async checkViteConfigSafety(): Promise<{ status: 'passed' | 'failed' | 'warning'; message: string; details?: string[] }> {
    try {
      // Check if any server files import vite config
      const { stdout } = await execAsync('grep -r "vite\\.config" server/ || true');
      
      if (stdout.trim()) {
        return {
          status: 'failed',
          message: 'Server code imports Vite config',
          details: stdout.split('\n').filter(line => line.trim())
        };
      }
      
      // Check if vite config has safeguards
      const { stdout: viteContent } = await execAsync('cat config/vite.config.ts');
      const hasESMSafeguard = viteContent.includes("process?.env?.VITE_CONFIG_CONTEXT === 'backend'");
      // Retain check for explicit comment safeguard as a secondary measure if present
      const hasCommentSafeguard = viteContent.includes('should not be imported directly');
      
      if (!hasESMSafeguard && !hasCommentSafeguard) { // If neither the primary ESM guard nor a comment safeguard is found
        return {
          status: 'warning',
          message: 'Vite config missing import safeguards',
          details: ['Expected ESM safeguard (process?.env?.VITE_CONFIG_CONTEXT === \'backend\') or explicit comment.']
        };
      } else if (!hasESMSafeguard && hasCommentSafeguard) {
        return {
            status: 'warning',
            message: 'Vite config relies on comment safeguard. Consider updating to modern ESM guard.',
            details: ['Found \'should not be imported directly\', but not \'process?.env?.VITE_CONFIG_CONTEXT === \\\'backend\\\'\'.']
        };
      }
      
      return {
        status: 'passed',
        message: 'Vite config safely isolated'
      };
    } catch (error) {
      return {
        status: 'warning',
        message: 'Could not verify Vite config safety',
        details: [`Error: ${error}`]
      };
    }
  }

  private async checkBackendStartup(): Promise<{ status: 'passed' | 'failed' | 'warning'; message: string; details?: string[] }> {
    try {
      // Quick syntax check by trying to parse the main files
      await execAsync('npx tsx --check server/index.ts', { timeout: 10000 });
      
      return {
        status: 'passed',
        message: 'Backend startup files are valid'
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      return {
        status: 'failed',
        message: 'Backend startup validation failed',
        details: [errorMessage]
      };
    }
  }

  private async checkSchemaConsistency(): Promise<{ status: 'passed' | 'failed' | 'warning'; message: string; details?: string[] }> {
    try {
      // Check if schema index exports exist
      const { stdout } = await execAsync('grep -c "export" db/schema/index.ts || echo "0"');
      const exportCount = parseInt(stdout.trim());
      
      if (exportCount < 10) {
        return {
          status: 'warning',
          message: 'Schema exports look sparse',
          details: [`Only ${exportCount} exports found in schema index`]
        };
      }
      
      return {
        status: 'passed',
        message: `Schema exports healthy (${exportCount} exports)`
      };
    } catch (error) {
      return {
        status: 'warning',
        message: 'Could not verify schema consistency',
        details: [`Error: ${error}`]
      };
    }
  }

  private async checkPackageHealth(): Promise<{ status: 'passed' | 'failed' | 'warning'; message: string; details?: string[] }> {
    try {
      // Check for obvious package issues
      const { stdout } = await execAsync('npm audit --audit-level=high --parseable || true');
      
      const highSeverityIssues = stdout.split('\n').filter(line => 
        line.includes('high') || line.includes('critical')
      ).length;
      
      if (highSeverityIssues > 0) {
        return {
          status: 'warning',
          message: `${highSeverityIssues} high/critical security issues`,
          details: ['Run "npm audit fix" to resolve']
        };
      }
      
      return {
        status: 'passed',
        message: 'No critical package vulnerabilities'
      };
    } catch (error) {
      return {
        status: 'warning',
        message: 'Could not check package health',
        details: [`Error: ${error}`]
      };
    }
  }

  private printSummary(): void {
    const totalDuration = Date.now() - this.startTime;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    
    console.log('\n' + '='.repeat(60));
    console.log(chalk.bold.blue('🚀 DEGENTALK VALIDATION SUMMARY'));
    console.log('='.repeat(60));
    
    console.log(chalk.green(`✅ Passed: ${passed}`));
    console.log(chalk.yellow(`⚠️  Warnings: ${warnings}`));
    console.log(chalk.red(`❌ Failed: ${failed}`));
    console.log(chalk.gray(`⏱️  Total time: ${totalDuration}ms`));
    
    if (failed > 0) {
      console.log('\n' + chalk.red.bold('💥 CRITICAL ISSUES FOUND:'));
      this.results
        .filter(r => r.status === 'failed')
        .forEach(result => {
          console.log(chalk.red(`   → ${result.name}: ${result.message}`));
        });
      
      console.log('\n' + chalk.yellow('🔧 Suggested fixes:'));
      console.log('   • Run "npm run check-imports --fix"');
      console.log('   • Check CONTRIBUTING.md for boundary rules');
      console.log('   • Review TypeScript errors above');
    } else if (warnings > 0) {
      console.log('\n' + chalk.yellow.bold('⚠️  WARNINGS TO REVIEW:'));
      this.results
        .filter(r => r.status === 'warning')
        .forEach(result => {
          console.log(chalk.yellow(`   → ${result.name}: ${result.message}`));
        });
    } else {
      console.log('\n' + chalk.green.bold('🎉 ALL CHECKS PASSED! CODEBASE IS HEALTHY!'));
    }
  }

  public async validate(): Promise<void> {
    console.log(chalk.blue.bold('🚀 Starting Degentalk Validation Suite\n'));
    
    // Run all validation checks
    await this.runCheck('Import Boundaries', () => this.checkImportBoundaries());
    await this.runCheck('TypeScript Compilation', () => this.checkTypeScriptCompilation());
    await this.runCheck('Vite Config Safety', () => this.checkViteConfigSafety());
    await this.runCheck('Backend Startup', () => this.checkBackendStartup());
    await this.runCheck('Schema Consistency', () => this.checkSchemaConsistency());
    await this.runCheck('Package Health', () => this.checkPackageHealth());
    
    this.printSummary();
    
    // Exit with appropriate code
    const hasFailed = this.results.some(r => r.status === 'failed');
    process.exit(hasFailed ? 1 : 0);
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new DegentalktValidator();
  validator.validate().catch(error => {
    console.error(chalk.red('💥 Validation suite crashed:'), error);
    process.exit(1);
  });
}

export { DegentalktValidator }; 