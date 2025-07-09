#!/usr/bin/env tsx

/**
 * Validates that all Drizzle pgTable definitions have unique table names.
 * This prevents schema conflicts and ensures database integrity.
 */

import { globSync } from 'glob';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');

interface TableDefinition {
  name: string;
  file: string;
  line: number;
  exportName: string;
}

function extractTableDefinitions(filePath: string): TableDefinition[] {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const definitions: TableDefinition[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Look for pgTable definitions
    // Pattern: export const tableName = pgTable('table_name', {
    const pgTableMatch = line.match(/export const (\w+) = pgTable\(['"]([^'"]+)['"], \{/);
    if (pgTableMatch) {
      const [, exportName, tableName] = pgTableMatch;
      definitions.push({
        name: tableName,
        file: filePath,
        line: i + 1,
        exportName
      });
    }
  }
  
  return definitions;
}

function validateUniqueTableNames(): void {
  console.log('🔍 Validating unique pgTable names...');
  
  // Find all TypeScript files in db/schema
  const schemaFiles = globSync(join(projectRoot, 'db/schema/**/*.ts'), {
    absolute: true,
    ignore: ['**/*.test.ts', '**/*.spec.ts', '**/migrations/**']
  });
  
  const allTables: TableDefinition[] = [];
  
  // Extract table definitions from all files
  for (const file of schemaFiles) {
    const tables = extractTableDefinitions(file);
    allTables.push(...tables);
  }
  
  console.log(`📊 Found ${allTables.length} pgTable definitions across ${schemaFiles.length} files`);
  
  // Group by table name to find duplicates
  const tablesByName = new Map<string, TableDefinition[]>();
  
  for (const table of allTables) {
    if (!tablesByName.has(table.name)) {
      tablesByName.set(table.name, []);
    }
    tablesByName.get(table.name)!.push(table);
  }
  
  // Check for duplicates
  const duplicates = Array.from(tablesByName.entries())
    .filter(([, tables]) => tables.length > 1);
  
  if (duplicates.length === 0) {
    console.log('✅ All pgTable names are unique!');
    return;
  }
  
  // Report duplicates
  console.error(`❌ Found ${duplicates.length} duplicate table name(s):`);
  console.error('');
  
  for (const [tableName, tables] of duplicates) {
    console.error(`Table name: "${tableName}"`);
    for (const table of tables) {
      const relativePath = table.file.replace(projectRoot + '/', '');
      console.error(`  - ${table.exportName} in ${relativePath}:${table.line}`);
    }
    console.error('');
  }
  
  console.error('💡 Resolution: Choose one canonical definition and remove the others.');
  console.error('   Update imports to reference the canonical location.');
  
  process.exit(1);
}

// Run validation
validateUniqueTableNames();