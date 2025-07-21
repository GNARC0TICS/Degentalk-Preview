import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Pattern to match foreign key field definitions
const FK_PATTERNS = [
  // uuid('field_name').references(...)
  /uuid\(['"]([^'"]+)['"]\)\.references/g,
  // Other ID fields that are clearly foreign keys based on naming
  /uuid\(['"]([^'"]+(?:_id|Id))['"]\)/g,
];

// Pattern to match table definitions
const TABLE_PATTERN = /export\s+const\s+(\w+)\s*=\s*pgTable\s*\(\s*['"]([^'"]+)['"]/g;

// Pattern to match existing indexes
const INDEX_PATTERNS = [
  // Standard index definition: index('name').on(table.field)
  /index\(['"]([^'"]+)['"]\)\.on\(table\.([^)]+)\)/g,
  // Index in table definition
  /(\w+):\s*index\(['"][^'"]+['"]\)\.on\(table\.([^)]+)\)/g,
];

// Tables to exclude (these are the primary keys, not foreign keys)
const EXCLUDE_FIELDS = new Set([
  'id', 'uuid', 'unique_id', 'api_id', 'external_id'
]);

const tableMap = new Map(); // Maps const name to actual table name
const foreignKeys = new Map(); // Maps table name to Set of FK fields
const existingIndexes = new Map(); // Maps table name to Set of indexed fields

// Find table definitions
function findTables(content, filename) {
  let match;
  TABLE_PATTERN.lastIndex = 0;
  while ((match = TABLE_PATTERN.exec(content)) !== null) {
    const constName = match[1];
    const tableName = match[2];
    tableMap.set(constName, tableName);
  }
}

// Find existing indexes
function findExistingIndexes(content, filename) {
  INDEX_PATTERNS.forEach(pattern => {
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(content)) !== null) {
      const field = match[2] || match[1];
      if (field) {
        // Extract table name from filename
        const basename = path.basename(filename, '.ts');
        const tableName = tableMap.get(basename) || basename;
        
        if (!existingIndexes.has(tableName)) {
          existingIndexes.set(tableName, new Set());
        }
        existingIndexes.get(tableName).add(field.trim());
      }
    }
  });
}

// Find foreign key fields
function findForeignKeys(content, filename) {
  FK_PATTERNS.forEach(pattern => {
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(content)) !== null) {
      const field = match[1];
      
      // Skip if it's a primary key or excluded field
      if (EXCLUDE_FIELDS.has(field)) continue;
      
      // Only include fields that end with _id or Id (foreign key pattern)
      if (field.endsWith('_id') || (field.endsWith('Id') && field !== 'id')) {
        // Extract table name from filename
        const basename = path.basename(filename, '.ts');
        const tableName = tableMap.get(basename) || basename;
        
        if (!foreignKeys.has(tableName)) {
          foreignKeys.set(tableName, new Set());
        }
        foreignKeys.get(tableName).add(field);
      }
    }
  });
}

// Process all schema files
const schemaFiles = glob.sync('db/schema/**/*.ts');

// First pass: find all table definitions
schemaFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  findTables(content, file);
});

// Second pass: find indexes and foreign keys
schemaFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  findExistingIndexes(content, file);
  findForeignKeys(content, file);
});

// Output results
console.log('=== FOREIGN KEY ANALYSIS REPORT ===\n');
console.log(`Total tables analyzed: ${foreignKeys.size}`);
console.log(`Total table mappings found: ${tableMap.size}\n`);

let totalFKs = 0;
let totalMissingIndexes = 0;
const createIndexStatements = [];

// Sort tables alphabetically for better readability
const sortedTables = Array.from(foreignKeys.keys()).sort();

sortedTables.forEach(tableName => {
  const fields = foreignKeys.get(tableName);
  const indexes = existingIndexes.get(tableName) || new Set();
  const missingIndexes = Array.from(fields).filter(field => !indexes.has(field));
  
  totalFKs += fields.size;
  totalMissingIndexes += missingIndexes.length;
  
  if (missingIndexes.length > 0) {
    console.log(`Table: ${tableName}`);
    console.log(`  Total foreign keys: ${fields.size}`);
    console.log(`  Indexed: ${fields.size - missingIndexes.length}`);
    console.log(`  Missing indexes: ${missingIndexes.length}`);
    
    missingIndexes.forEach(field => {
      console.log(`    - ${field}`);
      
      // Generate CREATE INDEX statement with proper table name
      const indexName = `idx_${tableName}_${field}`.toLowerCase().replace(/-/g, '_');
      const createStmt = `CREATE INDEX CONCURRENTLY IF NOT EXISTS ${indexName} ON "${tableName}"("${field}");`;
      createIndexStatements.push({ tableName, field, statement: createStmt });
    });
    console.log();
  }
});

console.log(`\n=== SUMMARY ===`);
console.log(`Total foreign key columns found: ${totalFKs}`);
console.log(`Total foreign key columns without indexes: ${totalMissingIndexes}`);
console.log(`Index coverage: ${((totalFKs - totalMissingIndexes) / totalFKs * 100).toFixed(1)}%`);

if (createIndexStatements.length > 0) {
  console.log('\n=== RECOMMENDED INDEX CREATION STATEMENTS ===\n');
  
  // Group by priority (tables with most missing indexes first)
  const priorityGroups = new Map();
  createIndexStatements.forEach(({ tableName, statement }) => {
    if (!priorityGroups.has(tableName)) {
      priorityGroups.set(tableName, []);
    }
    priorityGroups.get(tableName).push(statement);
  });
  
  // Sort by number of missing indexes (descending)
  const sortedGroups = Array.from(priorityGroups.entries())
    .sort((a, b) => b[1].length - a[1].length);
  
  const sqlStatements = [];
  sortedGroups.forEach(([tableName, statements]) => {
    sqlStatements.push(`-- Table: ${tableName} (${statements.length} indexes)`);
    sqlStatements.push(...statements);
    sqlStatements.push('');
  });
  
  // Write to SQL file
  const sqlContent = `-- Foreign Key Index Creation Script
-- Generated on ${new Date().toISOString()}
-- Total indexes to create: ${createIndexStatements.length}
-- 
-- This script uses CONCURRENTLY to avoid locking tables during index creation.
-- However, this means it cannot be run inside a transaction block.
-- Run each statement individually or remove CONCURRENTLY if you need transactions.

${sqlStatements.join('\n')}

-- Analyze tables after index creation for better query planning
${Array.from(priorityGroups.keys()).map(table => `ANALYZE "${table}";`).join('\n')}
`;

  fs.writeFileSync('scripts/create-foreign-key-indexes-verified.sql', sqlContent);
  console.log('\n✅ SQL script saved to: scripts/create-foreign-key-indexes-verified.sql');
}