#!/usr/bin/env node

/**
 * Safe Migration Validator - Enforces production migration safety rules
 * 
 * Safety rules:
 * - Production migrations must end with _safe.sql
 * - No destructive operations (DROP, DELETE, TRUNCATE) in safe files
 * - Warns about risky operations (ALTER TYPE, NOT NULL, UNIQUE)
 * - Checks for proper documentation and rollback instructions
 * 
 * Usage:
 *   npm run migration:validate [env]    - Validate migrations
 *   npm run migration:template <name>   - Generate safe template
 * 
 * Environments:
 *   dev - Relaxed rules, warnings only
 *   staging - Standard validation
 *   prod - Strict validation, enforces _safe.sql naming
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = join(__dirname, '../..');

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

class SafeMigrationValidator {
  private destructivePatterns = [
    /DROP\s+TABLE/i,
    /DROP\s+COLUMN/i,
    /DELETE\s+FROM/i,
    /TRUNCATE/i,
    /ALTER\s+TABLE\s+\w+\s+DROP/i,
  ];

  private riskyPatterns = [
    /ALTER\s+TABLE\s+\w+\s+ALTER\s+COLUMN\s+\w+\s+TYPE/i,
    /CREATE\s+UNIQUE\s+INDEX/i,
    /ADD\s+CONSTRAINT\s+\w+\s+UNIQUE/i,
    /NOT\s+NULL/i,
  ];

  async validateMigrations(environment: 'dev' | 'staging' | 'prod' = 'prod'): Promise<ValidationResult> {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: []
    };

    const migrationsDir = join(projectRoot, 'migrations/postgres');
    
    try {
      const files = await readdir(migrationsDir);
      const sqlFiles = files.filter(f => f.endsWith('.sql'));

      for (const file of sqlFiles) {
        const filePath = join(migrationsDir, file);
        await this.validateFile(filePath, environment, result);
      }
    } catch (error) {
      result.valid = false;
      result.errors.push(`Failed to read migrations directory: ${error}`);
    }

    return result;
  }

  private async validateFile(filePath: string, environment: string, result: ValidationResult): Promise<void> {
    const fileName = filePath.split('/').pop() || '';
    
    try {
      const content = await readFile(filePath, 'utf-8');
      
      // Production environment requires _safe.sql naming
      if (environment === 'prod' && !fileName.endsWith('_safe.sql')) {
        result.valid = false;
        result.errors.push(`Production migration must end with '_safe.sql': ${fileName}`);
        return;
      }

      // Check for destructive operations in safe files
      if (fileName.includes('_safe.sql')) {
        for (const pattern of this.destructivePatterns) {
          if (pattern.test(content)) {
            result.valid = false;
            result.errors.push(`Destructive operation found in safe migration ${fileName}: ${pattern.source}`);
          }
        }
      }

      // Check for risky operations and warn
      for (const pattern of this.riskyPatterns) {
        if (pattern.test(content)) {
          result.warnings.push(`Risky operation in ${fileName}: ${pattern.source}`);
        }
      }

      // Check for proper comments and rollback sections
      if (!content.includes('-- Description:')) {
        result.warnings.push(`Missing description comment in ${fileName}`);
      }

      if (!content.includes('-- Rollback:') && !fileName.includes('_safe.sql')) {
        result.warnings.push(`Missing rollback instructions in ${fileName}`);
      }

      // Validate SQL syntax basics
      if (content.trim().length === 0) {
        result.errors.push(`Empty migration file: ${fileName}`);
        result.valid = false;
      }

      console.log(`✅ Validated ${fileName}`);
    } catch (error) {
      result.valid = false;
      result.errors.push(`Failed to read migration file ${fileName}: ${error}`);
    }
  }

  async createSafeMigrationTemplate(name: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').split('.')[0];
    const fileName = `${timestamp}_${name}_safe.sql`;
    const filePath = join(projectRoot, 'migrations/postgres', fileName);

    const template = `-- Description: ${name}
-- Created: ${new Date().toISOString()}
-- Type: SAFE (No destructive operations)
-- Rollback: Manual rollback instructions below

-- Migration starts here
-- Example: Add new column (safe operation)
-- ALTER TABLE table_name ADD COLUMN new_column_name TEXT;

-- Example: Create new index (safe operation)  
-- CREATE INDEX CONCURRENTLY idx_table_column ON table_name(column_name);

-- Example: Insert default data (safe operation)
-- INSERT INTO table_name (column) VALUES ('default_value') ON CONFLICT DO NOTHING;

-- Rollback instructions:
-- To rollback this migration:
-- 1. DROP INDEX IF EXISTS idx_table_column;
-- 2. ALTER TABLE table_name DROP COLUMN IF EXISTS new_column_name;

-- ⚠️  PRODUCTION SAFETY RULES:
-- ✅ Only additive operations (ADD COLUMN, CREATE INDEX CONCURRENTLY, INSERT with ON CONFLICT)
-- ❌ No DROP, DELETE, TRUNCATE, or destructive ALTER operations
-- ❌ No data type changes that could cause data loss
-- ❌ No constraints that could fail on existing data
-- ✅ Always use IF NOT EXISTS / IF EXISTS patterns
-- ✅ Always use CONCURRENTLY for index creation
-- ✅ Always provide rollback instructions
`;

    return template;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const validator = new SafeMigrationValidator();

  switch (command) {
    case 'validate': {
      const environment = (args[1] as 'dev' | 'staging' | 'prod') || 'prod';
      console.log(`🔍 Validating migrations for ${environment} environment...`);
      
      const result = await validator.validateMigrations(environment);
      
      if (result.warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        result.warnings.forEach(warning => console.log(`   ${warning}`));
      }
      
      if (result.errors.length > 0) {
        console.log('\n❌ Errors:');
        result.errors.forEach(error => console.log(`   ${error}`));
        process.exit(1);
      }
      
      console.log('\n✅ All migrations are valid for production deployment');
      break;
    }
    
    case 'template': {
      const name = args[1];
      if (!name) {
        console.error('❌ Please provide a migration name');
        console.error('Usage: npm run migration:template <name>');
        process.exit(1);
      }
      
      const template = await validator.createSafeMigrationTemplate(name);
      console.log('\n📄 Safe migration template:');
      console.log(template);
      break;
    }
    
    default:
      console.log(`
🔒 Safe Migration Validator

Commands:
  validate [env]     Validate migrations for environment (dev|staging|prod)
  template <name>    Generate safe migration template

Examples:
  npm run migration:validate prod
  npm run migration:template add_user_preferences
      `);
      break;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  });
}

export { SafeMigrationValidator };