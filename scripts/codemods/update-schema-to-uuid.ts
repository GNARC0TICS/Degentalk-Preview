#!/usr/bin/env tsx
/**
 * Schema UUID Migration Codemod
 * 
 * Converts Drizzle schema files from serial/integer primary keys to uuid
 * and updates all foreign key references accordingly.
 */

import { Project, SyntaxKind, Node } from 'ts-morph';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import minimist from 'minimist';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// CLI args
const argv = minimist(process.argv.slice(2), {
  boolean: ['dry', 'verbose'],
  default: { dry: false, verbose: false }
});
const isDryRun = argv.dry as boolean;
const verbose = argv.verbose as boolean;

// Track changes for summary
let changesCount = 0;
const changedFiles: string[] = [];

// Prepare ts-morph project
const project = new Project({
  tsConfigFilePath: path.resolve('tsconfig.json'),
  skipAddingFilesFromTsConfig: false
});

// Find all schema files
const schemaFiles = project.addSourceFilesAtPaths([
  'db/schema/**/*.ts'
]);

// Tables that should keep integer primary keys (exceptions)
const keepIntegerPK = new Set([
  'levels', // Uses level number as primary key
  'roles', // System roles use integer IDs
  'permissions', // Permission system uses integers
  'settings', // Settings use integer IDs
  'features', // Feature flags use integers
  'categories' // Legacy forum categories
]);

// ID field mappings for foreign keys
const foreignKeyMappings = new Map([
  ['users.id', 'uuid'],
  ['threads.id', 'uuid'],
  ['posts.id', 'uuid'],
  ['messages.id', 'uuid'],
  ['wallets.id', 'uuid'],
  ['products.id', 'uuid'],
  ['badges.id', 'uuid'],
  ['titles.id', 'uuid']
]);

function log(message: string) {
  if (verbose) {
    console.log(`[SCHEMA-UUID] ${message}`);
  }
}

function updateSchemaFile(sourceFile: any) {
  const filePath = sourceFile.getFilePath();
  const fileName = path.basename(filePath);
  let fileModified = false;

  log(`Processing ${fileName}...`);

  // Find pgTable calls
  sourceFile.forEachDescendant((node: any) => {
    if (Node.isCallExpression(node) && 
        node.getExpression().getText() === 'pgTable') {
      
      const args = node.getArguments();
      if (args.length >= 2) {
        const tableName = args[0].getText().replace(/['"]/g, '');
        const schemaObject = args[1];
        
        // Skip tables that should keep integer PKs
        if (keepIntegerPK.has(tableName)) {
          log(`  Skipping ${tableName} (keeping integer PK)`);
          return;
        }

        if (Node.isObjectLiteralExpression(schemaObject)) {
          // Update primary key to UUID
          schemaObject.getProperties().forEach((prop: any) => {
            if (Node.isPropertyAssignment(prop)) {
              const propName = prop.getName();
              const initializer = prop.getInitializer();
              
              // Convert primary key: serial('id').primaryKey() -> uuid('id').primaryKey().defaultRandom()
              if (propName === 'id' && initializer && Node.isCallExpression(initializer)) {
                const callChain = initializer.getText();
                if (callChain.includes('serial(') && callChain.includes('.primaryKey()')) {
                  const newPK = `uuid('id').primaryKey().defaultRandom()`;
                  prop.setInitializer(newPK);
                  fileModified = true;
                  changesCount++;
                  log(`  Updated ${tableName}.id to UUID primary key`);
                }
              }
              
              // Update foreign key references
              if (propName.endsWith('Id') && initializer && Node.isCallExpression(initializer)) {
                const callChain = initializer.getText();
                
                // Convert integer FKs to uuid FKs where appropriate
                if (callChain.includes('integer(') && callChain.includes('.references(')) {
                  // Determine if this should be a UUID FK
                  const shouldBeUuid = shouldForeignKeyBeUuid(propName, callChain);
                  if (shouldBeUuid) {
                    const newFK = callChain.replace(/integer\(/g, 'uuid(');
                    prop.setInitializer(newFK);
                    fileModified = true;
                    changesCount++;
                    log(`  Updated ${tableName}.${propName} to UUID foreign key`);
                  }
                }
              }
            }
          });
        }
      }
    }
  });

  // Add uuid import if not present and file was modified
  if (fileModified) {
    ensureUuidImport(sourceFile);
    changedFiles.push(fileName);
    log(`  ✓ Modified ${fileName}`);
  }
}

function shouldForeignKeyBeUuid(fieldName: string, callChain: string): boolean {
  // Check if the reference points to a table that will have UUID PKs
  if (callChain.includes('users.id')) return true;
  if (callChain.includes('threads.id')) return true;
  if (callChain.includes('posts.id')) return true;
  if (callChain.includes('messages.id')) return true;
  
  // User-related fields should be UUIDs
  if (fieldName === 'userId' || fieldName === 'authorId' || fieldName === 'ownerId') return true;
  if (fieldName === 'threadId' || fieldName === 'postId' || fieldName === 'messageId') return true;
  
  return false;
}

function ensureUuidImport(sourceFile: any) {
  const existingImport = sourceFile.getImportDeclarations()
    .find((imp: any) => imp.getModuleSpecifier().getLiteralText() === 'drizzle-orm/pg-core');
  
  if (existingImport) {
    const namedImports = existingImport.getNamedImports().map((ni: any) => ni.getName());
    if (!namedImports.includes('uuid')) {
      existingImport.addNamedImport('uuid');
      log(`  Added uuid import to existing drizzle-orm/pg-core import`);
    }
  } else {
    // This shouldn't happen in schema files, but just in case
    sourceFile.addImportDeclaration({
      moduleSpecifier: 'drizzle-orm/pg-core',
      namedImports: ['uuid']
    });
    log(`  Added new drizzle-orm/pg-core import with uuid`);
  }
}

// Process all schema files
console.log(`🔄 Processing ${schemaFiles.length} schema files...`);

for (const sourceFile of schemaFiles) {
  updateSchemaFile(sourceFile);
}

// Save changes
if (!isDryRun && changedFiles.length > 0) {
  project.saveSync();
  console.log(`\n✅ Schema UUID migration completed!`);
} else if (isDryRun) {
  console.log(`\n🔍 Dry run completed - no files were modified`);
} else {
  console.log(`\n ℹ️ No schema changes needed`);
}

// Summary
console.log(`\n📊 Summary:`);
console.log(`  - Files processed: ${schemaFiles.length}`);
console.log(`  - Files modified: ${changedFiles.length}`);
console.log(`  - Changes made: ${changesCount}`);

if (changedFiles.length > 0) {
  console.log(`\n📝 Modified files:`);
  changedFiles.forEach(file => console.log(`  - ${file}`));
}

console.log(`\n🎯 Next steps:`);
console.log(`  1. Run 'pnpm db:migrate' to generate migration`);
console.log(`  2. Review the generated SQL migration`);
console.log(`  3. Test the migration on a copy of your database`);
console.log(`  4. Apply with 'pnpm db:migrate:apply'`);