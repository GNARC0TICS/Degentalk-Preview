import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Pattern to match foreign key field definitions
const FK_PATTERNS = [
  // uuid('field_name').references(...)
  /uuid\(['"]([^'"]+_id)['"]\)\.references/g,
  // Other ID fields that might be foreign keys
  /uuid\(['"]([^'"]+Id)['"]\)/g,
  // Fields ending with _id that might be foreign keys
  /['"]([^'"]+_id)['"]\s*:/g
];

// Tables to exclude (these are the primary keys, not foreign keys)
const EXCLUDE_FIELDS = [
  'id', 'uuid', 'unique_id', 'api_id', 'external_id', 'transaction_id', 
  'receipt_id', 'blockchain_id', 'payment_id', 'invoice_id'
];

const foreignKeys = new Map();
const indexedFields = new Set();

// First, find all existing indexes
function findExistingIndexes(content, filename) {
  // Pattern to match index definitions
  const indexPatterns = [
    /index\(['"]([^'"]+)['"]\)\.on\(table\.([^)]+)\)/g,
    /idx_[^']+\.on\(table\.([^)]+)\)/g,
    /CREATE\s+INDEX[^ON]+ON\s+(\w+)\s*\(([^)]+)\)/gi
  ];
  
  indexPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const field = match[2] || match[1];
      if (field) {
        indexedFields.add(field.trim());
      }
    }
  });
}

// Find foreign key fields
function findForeignKeys(content, filename) {
  FK_PATTERNS.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const field = match[1];
      if (!EXCLUDE_FIELDS.includes(field) && 
          (field.endsWith('_id') || field.endsWith('Id'))) {
        
        // Extract table name from filename
        const tableName = path.basename(filename, '.ts');
        
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

schemaFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  findExistingIndexes(content, file);
  findForeignKeys(content, file);
});

// Output results
console.log('=== FOREIGN KEY COLUMNS WITHOUT INDEXES ===\n');

let totalMissingIndexes = 0;
const createIndexStatements = [];

foreignKeys.forEach((fields, tableName) => {
  const missingIndexes = Array.from(fields).filter(field => !indexedFields.has(field));
  
  if (missingIndexes.length > 0) {
    console.log(`Table: ${tableName}`);
    missingIndexes.forEach(field => {
      console.log(`  - ${field} (no index)`);
      
      // Generate CREATE INDEX statement
      const indexName = `idx_${tableName}_${field}`.toLowerCase();
      const createStmt = `CREATE INDEX CONCURRENTLY IF NOT EXISTS ${indexName} ON ${tableName}(${field});`;
      createIndexStatements.push(createStmt);
      totalMissingIndexes++;
    });
    console.log();
  }
});

console.log(`\nTotal foreign key columns without indexes: ${totalMissingIndexes}`);

if (createIndexStatements.length > 0) {
  console.log('\n=== RECOMMENDED INDEX CREATION STATEMENTS ===\n');
  createIndexStatements.forEach(stmt => console.log(stmt));
  
  // Write to SQL file
  const sqlContent = `-- Foreign Key Index Creation Script
-- Generated on ${new Date().toISOString()}
-- Total indexes to create: ${createIndexStatements.length}

BEGIN;

${createIndexStatements.join('\n')}

-- Analyze tables after index creation
${Array.from(foreignKeys.keys()).map(table => `ANALYZE ${table};`).join('\n')}

COMMIT;
`;

  fs.writeFileSync('scripts/create-foreign-key-indexes.sql', sqlContent);
  console.log('\n✅ SQL script saved to: scripts/create-foreign-key-indexes.sql');
}