#!/usr/bin/env tsx

/**
 * Forum Foreign Key Validator
 * 
 * Validates foreign key relationships and data consistency in the forum system:
 * - Checks orphaned records in threads, posts, categories
 * - Validates forum structure mapping consistency
 * - Verifies user references integrity
 * - Reports data integrity issues
 */

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import chalk from 'chalk';
import { sql } from 'drizzle-orm';

interface FKCheck {
  name: string;
  description: string;
  query: string;
  expectedCount: number;
  severity: 'error' | 'warning';
}

interface ValidationResult {
  check: string;
  passed: boolean;
  count: number;
  expected: number;
  severity: 'error' | 'warning';
  details?: string;
}

class ForumFKValidator {
  private client: Client;
  private db: any;
  private results: ValidationResult[] = [];

  constructor() {
    this.client = new Client({
      connectionString: process.env.DATABASE_URL
    });
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.db = drizzle(this.client);
      console.log(chalk.blue('🔗 Connected to database'));
    } catch (error) {
      throw new Error(`Database connection failed: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    await this.client.end();
  }

  private getChecks(): FKCheck[] {
    return [
      // Core FK relationships
      {
        name: 'Orphaned Threads (User FK)',
        description: 'Threads referencing non-existent users',
        query: `
          SELECT COUNT(*) as count 
          FROM threads t 
          LEFT JOIN users u ON t.user_id = u.id 
          WHERE u.id IS NULL
        `,
        expectedCount: 0,
        severity: 'error'
      },
      {
        name: 'Orphaned Posts (User FK)',
        description: 'Posts referencing non-existent users',
        query: `
          SELECT COUNT(*) as count 
          FROM posts p 
          LEFT JOIN users u ON p.user_id = u.id 
          WHERE u.id IS NULL
        `,
        expectedCount: 0,
        severity: 'error'
      },
      {
        name: 'Orphaned Posts (Thread FK)',
        description: 'Posts referencing non-existent threads',
        query: `
          SELECT COUNT(*) as count 
          FROM posts p 
          LEFT JOIN threads t ON p.thread_id = t.id 
          WHERE t.id IS NULL
        `,
        expectedCount: 0,
        severity: 'error'
      },
      {
        name: 'Orphaned Threads (Category FK)',
        description: 'Threads referencing non-existent forum categories',
        query: `
          SELECT COUNT(*) as count 
          FROM threads t 
          LEFT JOIN forum_categories fc ON t.forum_id = fc.id 
          WHERE fc.id IS NULL
        `,
        expectedCount: 0,
        severity: 'error'
      },
      
      // Forum structure integrity
      {
        name: 'Forum Categories Structure',
        description: 'Forum categories with invalid parent relationships',
        query: `
          SELECT COUNT(*) as count 
          FROM forum_categories fc 
          LEFT JOIN forum_categories parent ON fc.parent_id = parent.id 
          WHERE fc.parent_id IS NOT NULL AND parent.id IS NULL
        `,
        expectedCount: 0,
        severity: 'error'
      },
      {
        name: 'Circular Forum References',
        description: 'Forum categories that reference themselves as parents',
        query: `
          SELECT COUNT(*) as count 
          FROM forum_categories fc 
          WHERE fc.id = fc.parent_id
        `,
        expectedCount: 0,
        severity: 'error'
      },
      
      // XP and economy FK checks
      {
        name: 'Orphaned XP Transactions',
        description: 'XP transactions referencing non-existent users',
        query: `
          SELECT COUNT(*) as count 
          FROM xp_transactions xt 
          LEFT JOIN users u ON xt.user_id = u.id 
          WHERE u.id IS NULL
        `,
        expectedCount: 0,
        severity: 'error'
      },
      
      // Wallet FK checks
      {
        name: 'Orphaned DGT Transactions',
        description: 'DGT transactions referencing non-existent users',
        query: `
          SELECT COUNT(*) as count 
          FROM dgt_transactions dt 
          LEFT JOIN users u ON dt.user_id = u.id 
          WHERE u.id IS NULL
        `,
        expectedCount: 0,
        severity: 'error'
      },
      
      // Data consistency checks
      {
        name: 'Threads without Posts',
        description: 'Threads that have no posts (unusual but not necessarily error)',
        query: `
          SELECT COUNT(*) as count 
          FROM threads t 
          LEFT JOIN posts p ON t.id = p.thread_id 
          WHERE p.id IS NULL
        `,
        expectedCount: 0,
        severity: 'warning'
      },
      {
        name: 'Users without Activity',
        description: 'Users with no threads, posts, or transactions (informational)',
        query: `
          SELECT COUNT(*) as count 
          FROM users u 
          WHERE NOT EXISTS (SELECT 1 FROM threads t WHERE t.user_id = u.id)
            AND NOT EXISTS (SELECT 1 FROM posts p WHERE p.user_id = u.id)
            AND NOT EXISTS (SELECT 1 FROM xp_transactions xt WHERE xt.user_id = u.id)
            AND u.created_at < NOW() - INTERVAL '7 days'
        `,
        expectedCount: 0,
        severity: 'warning'
      }
    ];
  }

  private async runCheck(check: FKCheck): Promise<ValidationResult> {
    try {
      console.log(chalk.gray(`  Checking: ${check.name}`));
      
      const result = await this.client.query(check.query);
      const count = parseInt(result.rows[0]?.count || '0');
      
      const passed = count === check.expectedCount;
      
      return {
        check: check.name,
        passed,
        count,
        expected: check.expectedCount,
        severity: check.severity,
        details: check.description
      };
      
    } catch (error) {
      return {
        check: check.name,
        passed: false,
        count: -1,
        expected: check.expectedCount,
        severity: 'error',
        details: `Query failed: ${error}`
      };
    }
  }

  private printResults(): void {
    console.log('\n' + '='.repeat(60));
    console.log(chalk.bold('FORUM FOREIGN KEY VALIDATION RESULTS'));
    console.log('='.repeat(60));

    const errors = this.results.filter(r => !r.passed && r.severity === 'error');
    const warnings = this.results.filter(r => !r.passed && r.severity === 'warning');
    const passed = this.results.filter(r => r.passed);

    // Print passed checks
    if (passed.length > 0) {
      console.log(chalk.green(`\n✅ PASSED (${passed.length}):`));
      for (const result of passed) {
        console.log(chalk.green(`  ✓ ${result.check}`));
      }
    }

    // Print errors
    if (errors.length > 0) {
      console.log(chalk.red(`\n❌ ERRORS (${errors.length}):`));
      for (const result of errors) {
        console.log(chalk.red(`  ✗ ${result.check}`));
        console.log(chalk.red(`    Found: ${result.count}, Expected: ${result.expected}`));
        if (result.details) {
          console.log(chalk.gray(`    ${result.details}`));
        }
      }
    }

    // Print warnings
    if (warnings.length > 0) {
      console.log(chalk.yellow(`\n⚠️  WARNINGS (${warnings.length}):`));
      for (const result of warnings) {
        console.log(chalk.yellow(`  ⚠ ${result.check}`));
        console.log(chalk.yellow(`    Found: ${result.count}, Expected: ${result.expected}`));
        if (result.details) {
          console.log(chalk.gray(`    ${result.details}`));
        }
      }
    }

    // Summary
    console.log('\n' + '-'.repeat(40));
    console.log(chalk.green(`Passed: ${passed.length}`));
    console.log(chalk.red(`Errors: ${errors.length}`));
    console.log(chalk.yellow(`Warnings: ${warnings.length}`));

    // Final status
    console.log('\n' + '='.repeat(60));
    if (errors.length === 0) {
      if (warnings.length === 0) {
        console.log(chalk.green.bold('🎉 ALL FOREIGN KEY CHECKS PASSED!'));
      } else {
        console.log(chalk.yellow.bold('⚠️  FK validation passed with warnings'));
      }
    } else {
      console.log(chalk.red.bold('💥 FOREIGN KEY VALIDATION FAILED'));
      console.log(chalk.red('❌ Data integrity issues detected'));
    }
  }

  async validateAll(): Promise<boolean> {
    console.log(chalk.blue('🔍 Validating forum foreign key relationships...'));
    
    const checks = this.getChecks();
    console.log(chalk.gray(`Running ${checks.length} FK validation checks`));

    for (const check of checks) {
      const result = await this.runCheck(check);
      this.results.push(result);
    }

    this.printResults();

    // Return true if no errors (warnings are acceptable)
    const hasErrors = this.results.some(r => !r.passed && r.severity === 'error');
    return !hasErrors;
  }

  async getTableStats(): Promise<void> {
    console.log(chalk.blue('\n📊 Database Table Statistics:'));
    
    const tables = [
      'users', 'forum_categories', 'threads', 'posts', 
      'xp_transactions', 'dgt_transactions'
    ];

    for (const table of tables) {
      try {
        const result = await this.client.query(`SELECT COUNT(*) as count FROM ${table}`);
        const count = result.rows[0]?.count || 0;
        console.log(chalk.gray(`  ${table}: ${count} records`));
      } catch (error) {
        console.log(chalk.red(`  ${table}: Error - ${error}`));
      }
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: tsx scripts/testing/validate-forum-fks.ts [options]

Options:
  --stats      Show database table statistics
  --help, -h   Show this help message

This script validates foreign key relationships in the forum system:
- Checks for orphaned records in core tables
- Validates forum structure integrity
- Reports data consistency issues
- Provides table statistics

Environment Variables:
  DATABASE_URL - PostgreSQL connection string (required)

Exit codes:
  0 - All FK checks passed (warnings allowed)
  1 - FK validation failed (errors found)
  2 - Database connection or query errors
`);
    process.exit(0);
  }

  if (!process.env.DATABASE_URL) {
    console.error(chalk.red('❌ DATABASE_URL environment variable is required'));
    process.exit(2);
  }

  const validator = new ForumFKValidator();
  
  try {
    await validator.connect();
    
    if (args.includes('--stats')) {
      await validator.getTableStats();
    }
    
    const success = await validator.validateAll();
    
    await validator.disconnect();
    
    process.exit(success ? 0 : 1);
    
  } catch (error) {
    console.error(chalk.red('Fatal error during FK validation:'), error);
    try {
      await validator.disconnect();
    } catch (disconnectError) {
      // Ignore disconnect errors
    }
    process.exit(2);
  }
}

// ESM compatibility check
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(chalk.red('Unhandled error:'), error);
    process.exit(2);
  });
}