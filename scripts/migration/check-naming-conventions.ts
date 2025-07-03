#!/usr/bin/env tsx
/**
 * Naming Convention Checker
 * 
 * Validates that all schema files follow consistent naming conventions:
 * - Primary keys: always named "id"  
 * - Foreign keys: camelCase like "userId", "threadId", etc.
 * - No legacy patterns like "perm_id", "template_id"
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';

interface NamingIssue {
  file: string;
  table: string;
  column: string;
  issue: string;
  currentName: string;
  suggestedName: string;
  severity: 'error' | 'warning' | 'info';
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

function checkNamingConventions(content: string, filePath: string): NamingIssue[] {
  const issues: NamingIssue[] = [];
  const tableName = extractTableName(content);
  
  if (!tableName) return issues;
  
  const relativeFile = filePath.replace(process.cwd(), '');
  
  // 1. Check for non-standard primary key names
  const pkPatterns = [
    /(\w+_id):\s*(?:uuid|serial|integer)\([^)]+\)\.primaryKey\(\)/g,
    /(\w+Id):\s*(?:uuid|serial|integer)\([^)]+\)\.primaryKey\(\)/g
  ];
  
  for (const pattern of pkPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const columnName = match[1];
      
      if (columnName !== 'id') {
        issues.push({
          file: relativeFile,
          table: tableName,
          column: columnName,
          issue: 'Primary key should be named "id"',
          currentName: columnName,
          suggestedName: 'id',
          severity: 'error'
        });
      }
    }
  }
  
  // 2. Check for snake_case FK patterns (should be camelCase)
  const snakeCaseFkPattern = /(\w+_id):\s*(?:uuid|varchar)\([^)]+\)(?:[^.]*\.references)?/g;
  let match;
  
  while ((match = snakeCaseFkPattern.exec(content)) !== null) {
    const columnName = match[1];
    
    // Skip if it's a primary key or has @uuid-exception
    if (content.includes(`${columnName}:`) && content.includes('primaryKey()')) continue;
    if (content.includes(`${columnName}:`) && content.includes('@uuid-exception')) continue;
    
    // Convert to camelCase suggestion
    const camelCaseName = columnName.replace(/_(\w)/g, (_, letter) => letter.toUpperCase());
    
    issues.push({
      file: relativeFile,
      table: tableName,
      column: columnName,
      issue: 'Foreign key should use camelCase naming',
      currentName: columnName,
      suggestedName: camelCaseName,
      severity: 'warning'
    });
  }
  
  // 3. Check for inconsistent FK naming patterns
  const fkPattern = /(\w+):\s*(?:uuid|varchar)\([^)]+\)[^.]*\.references\(/g;
  while ((match = fkPattern.exec(content)) !== null) {
    const columnName = match[1];
    
    // Should end with Id for FK columns
    if (!columnName.endsWith('Id') && !columnName.endsWith('_id')) {
      // Check if it's clearly a foreign key by looking at the reference
      const referenceMatch = content.match(new RegExp(`${columnName}:[^}]*\\.references\\(\\(\\)\\s*=>\\s*(\\w+)\\.id`));
      
      if (referenceMatch) {
        const targetTable = referenceMatch[1];
        const suggestedName = targetTable.replace(/s$/, '') + 'Id'; // users -> userId
        
        issues.push({
          file: relativeFile,
          table: tableName,
          column: columnName,
          issue: 'Foreign key should end with "Id"',
          currentName: columnName,
          suggestedName: suggestedName,
          severity: 'info'
        });
      }
    }
  }
  
  // 4. Check for mixed naming conventions in same table
  const allColumns = content.match(/\w+:\s*(?:uuid|varchar|integer|text|boolean|timestamp|decimal)/g) || [];
  const fkColumns = allColumns.filter(col => 
    col.includes('Id') || col.includes('_id') || col.includes('By') || col.includes('userId')
  );
  
  const hasSnakeCase = fkColumns.some(col => col.includes('_'));
  const hasCamelCase = fkColumns.some(col => /[A-Z]/.test(col));
  
  if (hasSnakeCase && hasCamelCase) {
    issues.push({
      file: relativeFile,
      table: tableName,
      column: 'multiple',
      issue: 'Mixed naming conventions in same table',
      currentName: 'mixed',
      suggestedName: 'consistent camelCase',
      severity: 'warning'
    });
  }
  
  return issues;
}

async function checkFile(filePath: string): Promise<NamingIssue[]> {
  const content = await readFile(filePath, 'utf-8');
  return checkNamingConventions(content, filePath);
}

async function main() {
  console.log(chalk.blue('🔍 Checking naming conventions across schema files...\n'));
  
  const schemaDir = join(process.cwd(), 'db/schema');
  const files = await getAllSchemaFiles(schemaDir);
  
  const allIssues: NamingIssue[] = [];
  
  for (const file of files) {
    const issues = await checkFile(file);
    allIssues.push(...issues);
  }
  
  // Group by severity
  const errorIssues = allIssues.filter(i => i.severity === 'error');
  const warningIssues = allIssues.filter(i => i.severity === 'warning');
  const infoIssues = allIssues.filter(i => i.severity === 'info');
  
  console.log(chalk.green('🎯 Naming Convention Check Results\n'));
  console.log(chalk.cyan('📊 Summary:'));
  console.log(`  Files scanned: ${files.length}`);
  console.log(`  Total issues: ${allIssues.length}`);
  console.log(`  Errors: ${chalk.red(errorIssues.length)}`);
  console.log(`  Warnings: ${chalk.yellow(warningIssues.length)}`);
  console.log(`  Info: ${chalk.blue(infoIssues.length)}\n`);
  
  if (allIssues.length === 0) {
    console.log(chalk.green('✅ All naming conventions are consistent!'));
    return;
  }
  
  // Display issues by severity
  if (errorIssues.length > 0) {
    console.log(chalk.red('🚨 ERRORS (Must Fix):'));
    for (const issue of errorIssues) {
      console.log(`  ${chalk.red('●')} ${issue.file}:${issue.table}.${issue.column}`);
      console.log(`    ${issue.issue}`);
      console.log(`    ${chalk.gray('Current:')} ${issue.currentName} ${chalk.gray('→ Suggested:')} ${issue.suggestedName}\n`);
    }
  }
  
  if (warningIssues.length > 0) {
    console.log(chalk.yellow('⚠️  WARNINGS (Should Fix):'));
    for (const issue of warningIssues) {
      console.log(`  ${chalk.yellow('●')} ${issue.file}:${issue.table}.${issue.column}`);
      console.log(`    ${issue.issue}`);
      console.log(`    ${chalk.gray('Current:')} ${issue.currentName} ${chalk.gray('→ Suggested:')} ${issue.suggestedName}\n`);
    }
  }
  
  if (infoIssues.length > 0) {
    console.log(chalk.blue('ℹ️  INFO (Consider):'));
    for (const issue of infoIssues) {
      console.log(`  ${chalk.blue('●')} ${issue.file}:${issue.table}.${issue.column}`);
      console.log(`    ${issue.issue}`);
      console.log(`    ${chalk.gray('Current:')} ${issue.currentName} ${chalk.gray('→ Suggested:')} ${issue.suggestedName}\n`);
    }
  }
  
  // Exit with error code if there are errors
  process.exit(errorIssues.length > 0 ? 1 : 0);
}

main().catch(console.error);