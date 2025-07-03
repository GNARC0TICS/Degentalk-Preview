#!/usr/bin/env tsx
/**
 * Non-UUID Column Scanner
 * 
 * Scans all schema files to identify columns that should be UUIDs but aren't yet.
 * Generates a comprehensive report for Phase 2 schema cleanup.
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';

interface ColumnIssue {
  file: string;
  table: string;
  column: string;
  currentType: string;
  issue: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  recommendation: string;
}

interface ScanResult {
  totalFiles: number;
  totalTables: number;
  issues: ColumnIssue[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

async function getAllSchemaFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  
  async function traverse(currentDir: string) {
    const items = await readdir(currentDir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = join(currentDir, item.name);
      
      if (item.isDirectory()) {
        await traverse(fullPath);
      } else if (item.name.endsWith('.ts') && !item.name.includes('.test.') && !item.name.includes('.spec.')) {
        files.push(fullPath);
      }
    }
  }
  
  await traverse(dir);
  return files;
}

function extractTableName(content: string): string | null {
  const tableMatch = content.match(/export const (\w+) = pgTable\(/);
  return tableMatch?.[1] || null;
}

function isExternalIdException(column: string, content: string): boolean {
  // Check for @uuid-exception comment
  const exceptionPattern = new RegExp(`${column}:.*//.*@uuid-exception`, 'i');
  if (exceptionPattern.test(content)) {
    return true;
  }
  
  // Known external system IDs
  const externalIdPatterns = [
    /ccpayment_user_id/i,
    /external_id/i,
    /third_party_id/i,
    /api_key/i,
    /webhook_id/i,
    /stripe_/i,
    /paypal_/i,
    /discord_/i,
    /twitter_/i,
    /github_/i
  ];
  
  return externalIdPatterns.some(pattern => pattern.test(column));
}

async function scanFile(filePath: string): Promise<ColumnIssue[]> {
  const content = await readFile(filePath, 'utf-8');
  const issues: ColumnIssue[] = [];
  const tableName = extractTableName(content);
  
  if (!tableName) {
    return issues;
  }
  
  const relativeFile = filePath.replace(process.cwd(), '');
  
  // 1. Check for serial/integer primary keys
  const serialPkPattern = /(\w+):\s*serial\([^)]+\)\.primaryKey\(\)/g;
  let match;
  
  while ((match = serialPkPattern.exec(content)) !== null) {
    const columnName = match[1];
    
    if (!isExternalIdException(columnName, content)) {
      issues.push({
        file: relativeFile,
        table: tableName,
        column: columnName,
        currentType: 'serial',
        issue: 'Serial primary key should be UUID',
        severity: 'critical',
        recommendation: `Change to: ${columnName}: uuid('${columnName}').primaryKey().defaultRandom()`
      });
    }
  }
  
  // 2. Check for integer primary keys
  const intPkPattern = /(\w+):\s*integer\([^)]+\)\.primaryKey\(\)/g;
  while ((match = intPkPattern.exec(content)) !== null) {
    const columnName = match[1];
    
    if (!isExternalIdException(columnName, content)) {
      issues.push({
        file: relativeFile,
        table: tableName,
        column: columnName,
        currentType: 'integer',
        issue: 'Integer primary key should be UUID',
        severity: 'critical',
        recommendation: `Change to: ${columnName}: uuid('${columnName}').primaryKey().defaultRandom()`
      });
    }
  }
  
  // 3. Check for varchar user_id columns (should be UUID with FK)
  const varcharIdPattern = /(\w+):\s*varchar\([^)]+\)[^.]*(?!\.references)/g;
  while ((match = varcharIdPattern.exec(content)) !== null) {
    const columnName = match[1];
    
    if (columnName.toLowerCase().includes('id') && !isExternalIdException(columnName, content)) {
      // Check if it's missing .references()
      const hasReference = content.includes(`${columnName}:`) && content.includes('.references(');
      const lineContent = content.split('\n').find(line => line.includes(`${columnName}:`));
      
      if (!hasReference && lineContent && !lineContent.includes('.references(')) {
        issues.push({
          file: relativeFile,
          table: tableName,
          column: columnName,
          currentType: 'varchar',
          issue: 'ID column should be UUID with FK reference',
          severity: 'high',
          recommendation: `Change to: ${columnName}: uuid('${columnName}').references(() => [targetTable].id)`
        });
      }
    }
  }
  
  // 4. Check for missing .references() on FK columns
  const possibleFkPattern = /(\w+(?:Id|_id)):\s*(uuid|varchar)\([^)]+\)(?![^.]*\.references)/g;
  while ((match = possibleFkPattern.exec(content)) !== null) {
    const columnName = match[1];
    const columnType = match[2];
    
    if (!isExternalIdException(columnName, content)) {
      // Skip if it's already a proper FK
      const hasReference = new RegExp(`${columnName}:[^.]*\\.references\\(`).test(content);
      
      if (!hasReference) {
        issues.push({
          file: relativeFile,
          table: tableName,
          column: columnName,
          currentType: columnType,
          issue: 'Foreign key column missing .references()',
          severity: 'medium',
          recommendation: `Add: .references(() => [targetTable].id)`
        });
      }
    }
  }
  
  // 5. Check for inconsistent naming (perm_id vs id)
  const inconsistentIdPattern = /(\w+_id):\s*(serial|integer)\([^)]+\)\.primaryKey\(\)/g;
  while ((match = inconsistentIdPattern.exec(content)) !== null) {
    const columnName = match[1];
    const columnType = match[2];
    
    if (columnName !== 'id') {
      issues.push({
        file: relativeFile,
        table: tableName,
        column: columnName,
        currentType: columnType,
        issue: 'Primary key should be named "id"',
        severity: 'medium',
        recommendation: `Rename to: id: uuid('id').primaryKey().defaultRandom()`
      });
    }
  }
  
  // 6. Check for serial columns that aren't primary keys (like useCount, version)
  const serialColumnPattern = /(\w+):\s*serial\([^)]+\)(?!\.primaryKey)/g;
  while ((match = serialColumnPattern.exec(content)) !== null) {
    const columnName = match[1];
    
    // These are usually counters or versioning - different issue
    if (['useCount', 'version', 'previousVersionId', 'templateId'].includes(columnName)) {
      issues.push({
        file: relativeFile,
        table: tableName,
        column: columnName,
        currentType: 'serial',
        issue: 'Serial column should be integer with proper default',
        severity: 'low',
        recommendation: `Change to: ${columnName}: integer('${columnName}').notNull().default(0)`
      });
    }
  }
  
  return issues;
}

async function generateReport(result: ScanResult): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = join(process.cwd(), `uuid-migration-scan-${timestamp}.csv`);
  
  let csvContent = 'File,Table,Column,Current Type,Issue,Severity,Recommendation\n';
  
  for (const issue of result.issues) {
    const csvLine = [
      issue.file,
      issue.table,
      issue.column,
      issue.currentType,
      issue.issue,
      issue.severity,
      issue.recommendation
    ].map(field => `"${field.replace(/"/g, '""')}"`).join(',');
    
    csvContent += csvLine + '\n';
  }
  
  await writeFile(reportPath, csvContent);
  console.log(chalk.green(`📊 Report saved to: ${reportPath}`));
}

async function scanSchema(): Promise<ScanResult> {
  console.log(chalk.blue('🔍 Scanning schema files for non-UUID columns...\n'));
  
  const schemaDir = join(process.cwd(), 'db/schema');
  const files = await getAllSchemaFiles(schemaDir);
  
  const result: ScanResult = {
    totalFiles: files.length,
    totalTables: 0,
    issues: [],
    summary: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    }
  };
  
  for (const file of files) {
    const issues = await scanFile(file);
    result.issues.push(...issues);
    
    if (issues.length > 0) {
      result.totalTables++;
    }
  }
  
  // Count by severity
  for (const issue of result.issues) {
    result.summary[issue.severity]++;
  }
  
  return result;
}

function displayResults(result: ScanResult): void {
  console.log(chalk.green('🎯 Non-UUID Column Scan Results\n'));
  
  console.log(chalk.cyan('📊 Summary:'));
  console.log(`  Total files scanned: ${result.totalFiles}`);
  console.log(`  Tables with issues: ${result.totalTables}`);
  console.log(`  Total issues found: ${result.issues.length}`);
  console.log(`  Critical: ${chalk.red(result.summary.critical)}`);
  console.log(`  High: ${chalk.yellow(result.summary.high)}`);
  console.log(`  Medium: ${chalk.blue(result.summary.medium)}`);
  console.log(`  Low: ${chalk.gray(result.summary.low)}\n`);
  
  if (result.issues.length === 0) {
    console.log(chalk.green('✅ No UUID migration issues found!'));
    return;
  }
  
  // Group by severity
  const groupedIssues = {
    critical: result.issues.filter(i => i.severity === 'critical'),
    high: result.issues.filter(i => i.severity === 'high'),
    medium: result.issues.filter(i => i.severity === 'medium'),
    low: result.issues.filter(i => i.severity === 'low')
  };
  
  for (const [severity, issues] of Object.entries(groupedIssues)) {
    if (issues.length === 0) continue;
    
    const color = severity === 'critical' ? 'red' : 
                  severity === 'high' ? 'yellow' : 
                  severity === 'medium' ? 'blue' : 'gray';
    
    console.log(chalk[color](`🚨 ${severity.toUpperCase()} Issues (${issues.length}):`));
    
    for (const issue of issues) {
      console.log(`  ${chalk[color]('●')} ${issue.file}:${issue.table}.${issue.column}`);
      console.log(`    ${issue.issue} (${issue.currentType})`);
      console.log(`    → ${issue.recommendation}\n`);
    }
  }
}

async function main() {
  try {
    const result = await scanSchema();
    displayResults(result);
    
    if (result.issues.length > 0) {
      await generateReport(result);
    }
    
    // Exit with error code if critical issues found
    const hasCriticalIssues = result.summary.critical > 0;
    process.exit(hasCriticalIssues ? 1 : 0);
    
  } catch (error) {
    console.error(chalk.red('Error during scan:'), error);
    process.exit(1);
  }
}

main();