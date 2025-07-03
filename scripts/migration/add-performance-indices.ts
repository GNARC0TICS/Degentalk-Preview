#!/usr/bin/env tsx
/**
 * Performance Indices Generator
 * 
 * Automatically adds performance indices to schema files based on FK columns
 * and common query patterns for optimal database performance.
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';

interface IndexSuggestion {
  file: string;
  table: string;
  columns: string[];
  indexType: 'btree' | 'hash' | 'gin' | 'gist';
  indexName: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

async function getAllSchemaFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  
  async function traverse(currentDir: string) {
    const items = await readdir(currentDir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = join(currentDir, item.name);
      
      if (item.isDirectory()) {
        await traverse(fullPath);
      } else if (item.name.endsWith('.ts') && !item.name.includes('.test.') && !item.name.includes('.relations.')) {
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

function hasIndexImport(content: string): boolean {
  return content.includes('index') && content.includes('from \'drizzle-orm/pg-core\'');
}

function analyzeTableForIndices(content: string, filePath: string): IndexSuggestion[] {
  const suggestions: IndexSuggestion[] = [];
  const tableName = extractTableName(content);
  
  if (!tableName) return suggestions;
  
  const relativeFile = filePath.replace(process.cwd(), '');
  
  // 1. FK columns (high priority)
  const fkPattern = /(\w+):\s*uuid\([^)]+\)[^.]*\.references\(/g;
  let match;
  
  while ((match = fkPattern.exec(content)) !== null) {
    const columnName = match[1];
    
    // Check if index already exists
    const existingIndexPattern = new RegExp(`index\\([^)]*\\)\\.on\\([^)]*${columnName}[^)]*\\)`, 'g');
    
    if (!existingIndexPattern.test(content)) {
      suggestions.push({
        file: relativeFile,
        table: tableName,
        columns: [columnName],
        indexType: 'btree',
        indexName: `idx_${tableName}_${columnName}`,
        reason: `Foreign key column needs index for join performance`,
        priority: 'high'
      });
    }
  }
  
  // 2. Timestamp columns for time-series queries
  const timestampPattern = /(\w+):\s*timestamp\([^)]+\)/g;
  while ((match = timestampPattern.exec(content)) !== null) {
    const columnName = match[1];
    
    if (['createdAt', 'updatedAt', 'timestamp', 'sentAt', 'completedAt'].includes(columnName)) {
      const existingIndexPattern = new RegExp(`index\\([^)]*\\)\\.on\\([^)]*${columnName}[^)]*\\)`, 'g');
      
      if (!existingIndexPattern.test(content)) {
        suggestions.push({
          file: relativeFile,
          table: tableName,
          columns: [columnName],
          indexType: 'btree',
          indexName: `idx_${tableName}_${columnName}`,
          reason: `Timestamp column for chronological queries`,
          priority: 'medium'
        });
      }
    }
  }
  
  // 3. Status/enum columns for filtering
  const statusPattern = /(\w+):\s*(?:varchar|pgEnum)\([^)]+\)/g;
  while ((match = statusPattern.exec(content)) !== null) {
    const columnName = match[1];
    
    if (['status', 'type', 'state', 'category', 'visibility'].includes(columnName)) {
      const existingIndexPattern = new RegExp(`index\\([^)]*\\)\\.on\\([^)]*${columnName}[^)]*\\)`, 'g');
      
      if (!existingIndexPattern.test(content)) {
        suggestions.push({
          file: relativeFile,
          table: tableName,
          columns: [columnName],
          indexType: 'btree',
          indexName: `idx_${tableName}_${columnName}`,
          reason: `Status/category column for filtering queries`,
          priority: 'medium'
        });
      }
    }
  }
  
  // 4. Unique constraints that aren't primary keys
  const uniquePattern = /(\w+):\s*(?:varchar|text)\([^)]+\)[^.]*\.unique\(\)/g;
  while ((match = uniquePattern.exec(content)) !== null) {
    const columnName = match[1];
    
    const existingIndexPattern = new RegExp(`index\\([^)]*\\)\\.on\\([^)]*${columnName}[^)]*\\)`, 'g');
    
    if (!existingIndexPattern.test(content)) {
      suggestions.push({
        file: relativeFile,
        table: tableName,
        columns: [columnName],
        indexType: 'btree',
        indexName: `idx_${tableName}_${columnName}_unique`,
        reason: `Unique constraint needs index for performance`,
        priority: 'high'
      });
    }
  }
  
  // 5. Composite indices for common query patterns
  const hasFkColumns = (content.match(/\w+:\s*uuid\([^)]+\)[^.]*\.references\(/g) || []).length;
  const hasTimestamp = content.includes('createdAt:') || content.includes('timestamp:');
  
  if (hasFkColumns >= 2 && hasTimestamp) {
    // Suggest composite index for time-series + FK queries (common pattern)
    const fkColumns = [];
    const fkMatches = content.matchAll(/(\w+):\s*uuid\([^)]+\)[^.]*\.references\(/g);
    
    for (const fkMatch of fkMatches) {
      fkColumns.push(fkMatch[1]);
      if (fkColumns.length >= 2) break;
    }
    
    if (fkColumns.length >= 2) {
      const timestampColumn = content.includes('createdAt:') ? 'createdAt' : 'timestamp';
      const compositeColumns = [...fkColumns.slice(0, 2), timestampColumn];
      
      suggestions.push({
        file: relativeFile,
        table: tableName,
        columns: compositeColumns,
        indexType: 'btree',
        indexName: `idx_${tableName}_composite_query`,
        reason: `Composite index for common multi-column queries`,
        priority: 'low'
      });
    }
  }
  
  // 6. Text search columns
  const textSearchPattern = /(title|name|description|content|body):\s*(?:text|varchar)\([^)]+\)/g;
  while ((match = textSearchPattern.exec(content)) !== null) {
    const columnName = match[1];
    
    // Only suggest for larger content fields
    if (['description', 'content', 'body'].includes(columnName)) {
      suggestions.push({
        file: relativeFile,
        table: tableName,
        columns: [columnName],
        indexType: 'gin',
        indexName: `idx_${tableName}_${columnName}_search`,
        reason: `Text search index for full-text queries`,
        priority: 'low'
      });
    }
  }
  
  return suggestions;
}

function addIndexImport(content: string): string {
  if (hasIndexImport(content)) {
    return content;
  }
  
  // Add index to the drizzle imports
  const importPattern = /import\s*{\s*([^}]+)\s*}\s*from\s*['"]drizzle-orm\/pg-core['"];/;
  const match = importPattern.exec(content);
  
  if (match) {
    const imports = match[1];
    if (!imports.includes('index')) {
      const newImports = imports.trim() + ',\n\tindex';
      return content.replace(importPattern, `import {\n\t${newImports}\n} from 'drizzle-orm/pg-core';`);
    }
  }
  
  return content;
}

function addIndicesToTable(content: string, suggestions: IndexSuggestion[]): string {
  if (suggestions.length === 0) return content;
  
  const tableName = extractTableName(content);
  if (!tableName) return content;
  
  // Add index import
  content = addIndexImport(content);
  
  // Find the table definition and check if it has a constraints function
  const tablePattern = new RegExp(`export const ${tableName} = pgTable\\(([^}]+)}[^)]*\\)`, 's');
  const tableMatch = tablePattern.exec(content);
  
  if (!tableMatch) return content;
  
  // Check if table already has a constraints function
  const hasConstraints = content.includes(`(table) => (`);
  
  if (hasConstraints) {
    // Add indices to existing constraints
    const constraintsPattern = new RegExp(`(\\(table\\) => \\({[^}]*)(}\\)\\))`);
    const constraintsMatch = constraintsPattern.exec(content);
    
    if (constraintsMatch) {
      let indicesCode = '';
      
      for (const suggestion of suggestions) {
        if (suggestion.columns.length === 1) {
          indicesCode += `\t\t${suggestion.indexName}: index('${suggestion.indexName}').on(table.${suggestion.columns[0]}),\n`;
        } else {
          const columnRefs = suggestion.columns.map(col => `table.${col}`).join(', ');
          indicesCode += `\t\t${suggestion.indexName}: index('${suggestion.indexName}').on(${columnRefs}),\n`;
        }
      }
      
      const replacement = constraintsMatch[1] + ',\n' + indicesCode + constraintsMatch[2];
      content = content.replace(constraintsPattern, replacement);
    }
  } else {
    // Add new constraints function
    let indicesCode = '';
    
    for (const suggestion of suggestions) {
      if (suggestion.columns.length === 1) {
        indicesCode += `\t\t${suggestion.indexName}: index('${suggestion.indexName}').on(table.${suggestion.columns[0]}),\n`;
      } else {
        const columnRefs = suggestion.columns.map(col => `table.${col}`).join(', ');
        indicesCode += `\t\t${suggestion.indexName}: index('${suggestion.indexName}').on(${columnRefs}),\n`;
      }
    }
    
    // Find the end of the table definition
    const tableEndPattern = new RegExp(`(export const ${tableName} = pgTable\\([^}]+})(\\)[^}]*;)`);
    const endMatch = tableEndPattern.exec(content);
    
    if (endMatch) {
      const constraintsFunction = `,\n\t(table) => ({\n${indicesCode}\t})`;
      const replacement = endMatch[1] + endMatch[2].replace(')', constraintsFunction + ')');
      content = content.replace(tableEndPattern, replacement);
    }
  }
  
  return content;
}

async function processFile(filePath: string): Promise<{ modified: boolean; suggestions: IndexSuggestion[] }> {
  const content = await readFile(filePath, 'utf-8');
  const suggestions = analyzeTableForIndices(content, filePath);
  
  if (suggestions.length === 0) {
    return { modified: false, suggestions: [] };
  }
  
  const modifiedContent = addIndicesToTable(content, suggestions);
  const modified = modifiedContent !== content;
  
  if (modified) {
    await writeFile(filePath, modifiedContent);
  }
  
  return { modified, suggestions };
}

async function main() {
  console.log(chalk.blue('🔍 Analyzing schema files for missing performance indices...\n'));
  
  const schemaDir = join(process.cwd(), 'db/schema');
  const files = await getAllSchemaFiles(schemaDir);
  
  let totalFiles = 0;
  let modifiedFiles = 0;
  let totalIndices = 0;
  const allSuggestions: IndexSuggestion[] = [];
  
  for (const file of files) {
    try {
      const result = await processFile(file);
      totalFiles++;
      
      if (result.modified) {
        modifiedFiles++;
        totalIndices += result.suggestions.length;
        
        const relativePath = file.replace(process.cwd(), '');
        console.log(`${chalk.green('✓')} ${relativePath}`);
        
        for (const suggestion of result.suggestions) {
          console.log(`  ${chalk.blue('+')} ${suggestion.indexName} (${suggestion.priority}): ${suggestion.reason}`);
        }
      }
      
      allSuggestions.push(...result.suggestions);
    } catch (error) {
      const relativePath = file.replace(process.cwd(), '');
      console.log(`${chalk.red('✗')} ${relativePath}: ${error}`);
    }
  }
  
  // Summary by priority
  const highPriority = allSuggestions.filter(s => s.priority === 'high').length;
  const mediumPriority = allSuggestions.filter(s => s.priority === 'medium').length;
  const lowPriority = allSuggestions.filter(s => s.priority === 'low').length;
  
  console.log(chalk.green(`\n🎯 Index Generation Summary:`));
  console.log(`  Files processed: ${totalFiles}`);
  console.log(`  Files modified: ${modifiedFiles}`);
  console.log(`  Total indices added: ${totalIndices}`);
  console.log(`  High priority: ${chalk.red(highPriority)}`);
  console.log(`  Medium priority: ${chalk.yellow(mediumPriority)}`);
  console.log(`  Low priority: ${chalk.blue(lowPriority)}`);
  
  if (modifiedFiles > 0) {
    console.log(chalk.yellow('\n💡 Next steps:'));
    console.log('  1. Review the generated indices for your specific query patterns');
    console.log('  2. Run database migration to create the indices');
    console.log('  3. Monitor query performance and adjust as needed');
  }
}

main().catch(console.error);