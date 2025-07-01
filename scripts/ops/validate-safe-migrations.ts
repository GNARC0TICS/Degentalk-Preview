#!/usr/bin/env tsx

/**
 * Safe Migration Validator
 * 
 * Enforces production migration safety rules:
 * - Detects unsafe operations (DROP, DELETE, TRUNCATE)
 * - Warns about risky operations (ALTER TYPE, ADD NOT NULL)
 * - Validates migration file naming conventions
 * - Checks for rollback documentation
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';

interface UnsafePattern {
  pattern: RegExp;
  severity: 'error' | 'warning';
  description: string;
  suggestion?: string;
}

interface MigrationIssue {
  file: string;
  line: number;
  severity: 'error' | 'warning';
  message: string;
  suggestion?: string;
}

interface ValidationOptions {
  environment: 'dev' | 'staging' | 'prod';
  strict: boolean;
}

class MigrationValidator {
  private issues: MigrationIssue[] = [];
  private migrationsDir: string;

  constructor() {
    this.migrationsDir = join(process.cwd(), 'migrations/postgres');
  }

  private getUnsafePatterns(): UnsafePattern[] {
    return [
      // Critical unsafe operations
      {
        pattern: /\bDROP\s+(TABLE|COLUMN|INDEX|CONSTRAINT)\b/gi,
        severity: 'error',
        description: 'DROP operations can cause data loss',
        suggestion: 'Consider deprecation or safe removal process'
      },
      {
        pattern: /\bDELETE\s+FROM\b/gi,
        severity: 'error',
        description: 'DELETE operations in migrations can cause data loss',
        suggestion: 'Use data migration scripts instead'
      },
      {
        pattern: /\bTRUNCATE\s+TABLE\b/gi,
        severity: 'error',
        description: 'TRUNCATE operations cause immediate data loss',
        suggestion: 'Use DELETE with WHERE clause or separate script'
      },
      
      // Risky operations that should be reviewed
      {
        pattern: /\bALTER\s+TABLE\s+\w+\s+ADD\s+COLUMN\s+\w+.*NOT\s+NULL\b/gi,
        severity: 'warning',
        description: 'Adding NOT NULL columns to existing tables without defaults',
        suggestion: 'Add DEFAULT value or make nullable initially'
      },
      {
        pattern: /\bALTER\s+TYPE\b/gi,
        severity: 'warning',
        description: 'Altering types can cause downtime in large tables',
        suggestion: 'Consider creating new column and migration strategy'
      },
      {
        pattern: /\bCREATE\s+UNIQUE\s+INDEX\b/gi,
        severity: 'warning',
        description: 'Creating unique indexes can fail on existing data',
        suggestion: 'Validate data uniqueness before creating index'
      },
      {
        pattern: /\bADD\s+CONSTRAINT.*UNIQUE\b/gi,
        severity: 'warning',
        description: 'Adding unique constraints can fail on existing data',
        suggestion: 'Clean duplicate data before adding constraint'
      },
      
      // Performance concerns
      {
        pattern: /\bCREATE\s+INDEX\s+(?!CONCURRENTLY)\b/gi,
        severity: 'warning',
        description: 'Creating indexes without CONCURRENTLY causes table locks',
        suggestion: 'Use CREATE INDEX CONCURRENTLY for production'
      }
    ];
  }

  private async getMigrationFiles(): Promise<string[]> {
    try {
      const files = await readdir(this.migrationsDir);
      return files
        .filter(file => file.endsWith('.sql'))
        .map(file => join(this.migrationsDir, file))
        .sort();
    } catch (error) {
      throw new Error(`Failed to read migrations directory: ${error}`);
    }
  }

  private validateFileName(filePath: string, options: ValidationOptions): void {
    const fileName = filePath.split('/').pop() || '';
    
    // In production, enforce _safe.sql naming for safety
    if (options.environment === 'prod' && !fileName.includes('_safe.sql')) {
      this.issues.push({
        file: fileName,
        line: 0,
        severity: 'error',
        message: 'Production migrations must end with _safe.sql',
        suggestion: 'Rename file to include _safe suffix'
      });
    }

    // Check for proper numbering
    const numberMatch = fileName.match(/^(\d{4})_/);
    if (!numberMatch) {
      this.issues.push({
        file: fileName,
        line: 0,
        severity: 'warning',
        message: 'Migration file should start with 4-digit number',
        suggestion: 'Use format: 0001_description.sql'
      });
    }
  }

  private async validateMigrationContent(filePath: string): Promise<void> {
    try {
      const content = await readFile(filePath, 'utf8');
      const lines = content.split('\n');
      const fileName = filePath.split('/').pop() || '';

      const patterns = this.getUnsafePatterns();

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        for (const pattern of patterns) {
          if (pattern.pattern.test(line)) {
            this.issues.push({
              file: fileName,
              line: i + 1,
              severity: pattern.severity,
              message: pattern.description,
              suggestion: pattern.suggestion
            });
          }
        }
      }

      // Check for rollback documentation
      const hasRollback = content.toLowerCase().includes('rollback') || 
                         content.toLowerCase().includes('revert') ||
                         content.includes('-- Down migration');
      
      if (!hasRollback) {
        this.issues.push({
          file: fileName,
          line: 0,
          severity: 'warning',
          message: 'Migration lacks rollback documentation',
          suggestion: 'Add comments explaining how to rollback changes'
        });
      }

      // Check for transaction usage
      const hasTransaction = content.toLowerCase().includes('begin') || 
                            content.toLowerCase().includes('start transaction');
      
      if (!hasTransaction && content.length > 100) {
        this.issues.push({
          file: fileName,
          line: 0,
          severity: 'warning',
          message: 'Migration should use transactions for safety',
          suggestion: 'Wrap changes in BEGIN; ... COMMIT; block'
        });
      }

    } catch (error) {
      this.issues.push({
        file: filePath.split('/').pop() || '',
        line: 0,
        severity: 'error',
        message: `Failed to read migration file: ${error}`,
      });
    }
  }

  private printResults(options: ValidationOptions): void {
    const errors = this.issues.filter(i => i.severity === 'error');
    const warnings = this.issues.filter(i => i.severity === 'warning');

    console.log(chalk.blue(`\n🔍 Migration Safety Analysis (${options.environment} mode)`));
    console.log('='.repeat(60));

    if (this.issues.length === 0) {
      console.log(chalk.green('✅ All migrations passed safety checks!'));
      return;
    }

    if (errors.length > 0) {
      console.log(chalk.red(`\n❌ ERRORS (${errors.length}):`));
      for (const issue of errors) {
        console.log(chalk.red(`  ${issue.file}:${issue.line || 'file'} - ${issue.message}`));
        if (issue.suggestion) {
          console.log(chalk.yellow(`    💡 ${issue.suggestion}`));
        }
      }
    }

    if (warnings.length > 0) {
      console.log(chalk.yellow(`\n⚠️  WARNINGS (${warnings.length}):`));
      for (const issue of warnings) {
        console.log(chalk.yellow(`  ${issue.file}:${issue.line || 'file'} - ${issue.message}`));
        if (issue.suggestion) {
          console.log(chalk.gray(`    💡 ${issue.suggestion}`));
        }
      }
    }

    // Summary
    console.log('\n' + '-'.repeat(40));
    console.log(chalk.red(`Errors: ${errors.length}`));
    console.log(chalk.yellow(`Warnings: ${warnings.length}`));

    if (errors.length > 0) {
      console.log(chalk.red('\n💥 Migration safety validation FAILED'));
      if (options.environment === 'prod') {
        console.log(chalk.red('❌ Production migrations must pass all safety checks'));
      }
    } else if (warnings.length > 0) {
      console.log(chalk.yellow('\n⚠️  Migration safety validation passed with warnings'));
      console.log(chalk.gray('Review warnings before deploying to production'));
    } else {
      console.log(chalk.green('\n✅ Migration safety validation PASSED'));
    }
  }

  async validate(options: ValidationOptions): Promise<boolean> {
    console.log(chalk.blue('🔒 Validating migration safety...'));
    
    try {
      const migrationFiles = await this.getMigrationFiles();
      
      if (migrationFiles.length === 0) {
        console.log(chalk.yellow('⚠️  No migration files found'));
        return true;
      }

      console.log(chalk.gray(`Found ${migrationFiles.length} migration files`));

      for (const file of migrationFiles) {
        this.validateFileName(file, options);
        await this.validateMigrationContent(file);
      }

      this.printResults(options);

      // Return false if there are errors, or warnings in strict mode
      const hasErrors = this.issues.some(i => i.severity === 'error');
      const hasWarnings = this.issues.some(i => i.severity === 'warning');

      if (hasErrors) return false;
      if (options.strict && hasWarnings) return false;

      return true;

    } catch (error) {
      console.error(chalk.red(`Migration validation failed: ${error}`));
      return false;
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: tsx scripts/ops/validate-safe-migrations.ts [environment] [options]

Environments:
  dev      - Relaxed rules, warnings only (default)
  staging  - Standard validation
  prod     - Strict validation, enforces _safe.sql naming

Options:
  --strict     - Treat warnings as errors
  --help, -h   - Show this help message

Examples:
  tsx scripts/ops/validate-safe-migrations.ts
  tsx scripts/ops/validate-safe-migrations.ts prod --strict
`);
    process.exit(0);
  }

  const environment = (args[0] === 'dev' || args[0] === 'staging' || args[0] === 'prod') 
    ? args[0] as 'dev' | 'staging' | 'prod'
    : 'dev';

  const options: ValidationOptions = {
    environment,
    strict: args.includes('--strict') || environment === 'prod'
  };

  const validator = new MigrationValidator();
  const success = await validator.validate(options);
  
  process.exit(success ? 0 : 1);
}

// ESM compatibility check
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  });
}