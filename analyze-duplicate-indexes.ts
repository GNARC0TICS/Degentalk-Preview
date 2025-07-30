#!/usr/bin/env tsx
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

interface IndexInfo {
  name: string;
  file: string;
  line: number;
  table?: string;
}

// Recursively find all .ts files in a directory
function findTsFiles(dir: string): string[] {
  const files: string[] = [];
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory() && item !== 'node_modules') {
      files.push(...findTsFiles(fullPath));
    } else if (item.endsWith('.ts') && !item.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Extract index definitions from a file
function extractIndexes(filePath: string): IndexInfo[] {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const indexes: IndexInfo[] = [];
  
  // Pattern to match index definitions
  const indexPattern = /index\(['"]([^'"]+)['"]\)/g;
  
  // Try to find the table name from pgTable definition
  let tableName: string | undefined;
  const tablePattern = /pgTable\s*\(\s*['"]([^'"]+)['"]/;
  const tableMatch = content.match(tablePattern);
  if (tableMatch) {
    tableName = tableMatch[1];
  }
  
  lines.forEach((line, idx) => {
    let match;
    while ((match = indexPattern.exec(line)) !== null) {
      indexes.push({
        name: match[1],
        file: relative(process.cwd(), filePath),
        line: idx + 1,
        table: tableName
      });
    }
  });
  
  return indexes;
}

// Main analysis
function analyzeIndexes() {
  const schemaDir = join(process.cwd(), 'db/schema');
  const files = findTsFiles(schemaDir);
  
  console.log(`Found ${files.length} TypeScript files in db/schema\n`);
  
  // Collect all indexes
  const allIndexes: IndexInfo[] = [];
  for (const file of files) {
    const indexes = extractIndexes(file);
    allIndexes.push(...indexes);
  }
  
  // Group by index name
  const indexGroups = new Map<string, IndexInfo[]>();
  for (const index of allIndexes) {
    if (!indexGroups.has(index.name)) {
      indexGroups.set(index.name, []);
    }
    indexGroups.get(index.name)!.push(index);
  }
  
  // Find duplicates
  const duplicates = Array.from(indexGroups.entries())
    .filter(([_, locations]) => locations.length > 1)
    .sort((a, b) => b[1].length - a[1].length);
  
  console.log(`Total indexes found: ${allIndexes.length}`);
  console.log(`Unique index names: ${indexGroups.size}`);
  console.log(`Duplicate index names: ${duplicates.length}\n`);
  
  // Report duplicates
  console.log('=== DUPLICATE INDEX REPORT ===\n');
  
  for (const [indexName, locations] of duplicates) {
    console.log(`Index: "${indexName}" (${locations.length} occurrences)`);
    for (const loc of locations) {
      console.log(`  - ${loc.file}:${loc.line}${loc.table ? ` (table: ${loc.table})` : ''}`);
    }
    console.log();
  }
  
  // Summary of affected tables
  const affectedTables = new Set<string>();
  for (const [_, locations] of duplicates) {
    for (const loc of locations) {
      if (loc.table) {
        affectedTables.add(loc.table);
      }
    }
  }
  
  console.log('\n=== AFFECTED TABLES ===');
  console.log(`Total: ${affectedTables.size} tables`);
  Array.from(affectedTables).sort().forEach(table => {
    console.log(`  - ${table}`);
  });
  
  // Suggest naming convention
  console.log('\n=== SUGGESTED FIX ===');
  console.log('PostgreSQL requires globally unique index names. Consider using one of these patterns:');
  console.log('1. Include table name: idx_<table>_<column(s)>');
  console.log('2. Use full path: idx_<domain>_<table>_<column(s)>');
  console.log('3. Use prefix: <table>_idx_<column(s)>');
  console.log('\nExample: Instead of "idx_user_id", use "idx_posts_user_id" for posts table');
}

// Run the analysis
analyzeIndexes();