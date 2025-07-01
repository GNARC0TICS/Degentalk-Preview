#!/usr/bin/env tsx
/**
 * UUID Migration Validation Script
 * 
 * Comprehensive validation of the UUID migration status across the DegenTalk platform.
 * Checks schema consistency, type definitions, and identifies remaining migration work.
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';

interface ValidationResult {
  schemaFiles: {
    total: number;
    uuidPrimaryKeys: number;
    integerPrimaryKeys: number;
    mixedPrimaryKeys: number;
  };
  foreignKeys: {
    total: number;
    uuidReferences: number;
    integerReferences: number;
    mismatches: Array<{
      file: string;
      column: string;
      issue: string;
    }>;
  };
  typeDefinitions: {
    total: number;
    brandedTypes: number;
    missingTypes: string[];
  };
  recommendations: string[];
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

async function analyzeSchemaFile(filePath: string): Promise<{
  hasPrimaryKey: boolean;
  primaryKeyType: 'uuid' | 'integer' | 'serial' | 'string' | 'mixed';
  foreignKeys: Array<{
    column: string;
    type: 'uuid' | 'integer';
    referencesTable?: string;
  }>;
  tableName?: string;
}> {
  const content = await readFile(filePath, 'utf-8');
  
  // Extract table name
  const tableMatch = content.match(/export const (\w+) = pgTable\(/);
  const tableName = tableMatch?.[1];
  
  // Check for primary key patterns
  const uuidPkPattern = /uuid\([^)]+\)\.primaryKey\(\)/g;
  const integerPkPattern = /(serial|integer)\([^)]+\)\.primaryKey\(\)/g;
  const stringPkPattern = /(text|varchar)\([^)]+\)\.primaryKey\(\)/g;
  
  const hasUuidPk = uuidPkPattern.test(content);
  const hasIntegerPk = integerPkPattern.test(content);
  const hasStringPk = stringPkPattern.test(content);
  
  let primaryKeyType: 'uuid' | 'integer' | 'serial' | 'string' | 'mixed' = 'uuid';
  
  if (hasUuidPk && (hasIntegerPk || hasStringPk)) {
    primaryKeyType = 'mixed';
  } else if (hasUuidPk) {
    primaryKeyType = 'uuid';
  } else if (hasIntegerPk) {
    primaryKeyType = content.includes('serial(') ? 'serial' : 'integer';
  } else if (hasStringPk) {
    primaryKeyType = 'string';
  }
  
  // Extract foreign key references
  const foreignKeys: Array<{
    column: string;
    type: 'uuid' | 'integer';
    referencesTable?: string;
  }> = [];
  
  // Pattern for foreign key definitions
  const fkPattern = /(\w+):\s*(uuid|integer)\([^)]+\)[^.]*\.references\(\s*\(\)\s*=>\s*(\w+)\.id/g;
  let fkMatch;
  
  while ((fkMatch = fkPattern.exec(content)) !== null) {
    foreignKeys.push({
      column: fkMatch[1],
      type: fkMatch[2] as 'uuid' | 'integer',
      referencesTable: fkMatch[3]
    });
  }
  
  return {
    hasPrimaryKey: hasUuidPk || hasIntegerPk || hasStringPk,
    primaryKeyType,
    foreignKeys,
    tableName
  };
}

async function checkTypeDefinitions(): Promise<{
  total: number;
  brandedTypes: number;
  typeList: string[];
}> {
  const typesFile = join(process.cwd(), 'db/types/id.types.ts');
  const content = await readFile(typesFile, 'utf-8');
  
  // Extract branded type exports
  const typePattern = /export type (\w+Id) = Id<'(\w+)'>/g;
  const types: string[] = [];
  let match;
  
  while ((match = typePattern.exec(content)) !== null) {
    types.push(match[1]);
  }
  
  return {
    total: types.length,
    brandedTypes: types.length,
    typeList: types
  };
}

async function validateMigration(): Promise<ValidationResult> {
  console.log(chalk.blue('🔍 Starting UUID Migration Validation...\n'));
  
  const result: ValidationResult = {
    schemaFiles: {
      total: 0,
      uuidPrimaryKeys: 0,
      integerPrimaryKeys: 0,
      mixedPrimaryKeys: 0
    },
    foreignKeys: {
      total: 0,
      uuidReferences: 0,
      integerReferences: 0,
      mismatches: []
    },
    typeDefinitions: {
      total: 0,
      brandedTypes: 0,
      missingTypes: []
    },
    recommendations: []
  };
  
  // 1. Analyze schema files
  console.log(chalk.yellow('📁 Analyzing schema files...'));
  const schemaDir = join(process.cwd(), 'db/schema');
  const schemaFiles = await getAllSchemaFiles(schemaDir);
  
  result.schemaFiles.total = schemaFiles.length;
  
  const tableAnalysis = new Map<string, {
    primaryKeyType: string;
    foreignKeys: Array<{ column: string; type: string; referencesTable?: string }>;
  }>();
  
  for (const file of schemaFiles) {
    const analysis = await analyzeSchemaFile(file);
    
    if (analysis.hasPrimaryKey) {
      switch (analysis.primaryKeyType) {
        case 'uuid':
          result.schemaFiles.uuidPrimaryKeys++;
          break;
        case 'integer':
        case 'serial':
          result.schemaFiles.integerPrimaryKeys++;
          break;
        case 'mixed':
          result.schemaFiles.mixedPrimaryKeys++;
          break;
      }
    }
    
    if (analysis.tableName) {
      tableAnalysis.set(analysis.tableName, {
        primaryKeyType: analysis.primaryKeyType,
        foreignKeys: analysis.foreignKeys
      });
    }
    
    // Count foreign keys
    for (const fk of analysis.foreignKeys) {
      result.foreignKeys.total++;
      
      if (fk.type === 'uuid') {
        result.foreignKeys.uuidReferences++;
      } else {
        result.foreignKeys.integerReferences++;
      }
      
      // Check for mismatches
      if (fk.referencesTable) {
        const referencedTable = tableAnalysis.get(fk.referencesTable);
        if (referencedTable) {
          const referencedPkType = referencedTable.primaryKeyType;
          
          if (
            (fk.type === 'integer' && referencedPkType === 'uuid') ||
            (fk.type === 'uuid' && (referencedPkType === 'integer' || referencedPkType === 'serial'))
          ) {
            result.foreignKeys.mismatches.push({
              file: file.replace(process.cwd(), ''),
              column: fk.column,
              issue: `${fk.type} FK references ${referencedPkType} PK in ${fk.referencesTable}`
            });
          }
        }
      }
    }
  }
  
  // 2. Check type definitions
  console.log(chalk.yellow('🏷️  Checking type definitions...'));
  const typeAnalysis = await checkTypeDefinitions();
  result.typeDefinitions = {
    total: typeAnalysis.total,
    brandedTypes: typeAnalysis.brandedTypes,
    missingTypes: [] // Could implement logic to find missing types
  };
  
  // 3. Generate recommendations
  console.log(chalk.yellow('💡 Generating recommendations...'));
  
  if (result.foreignKeys.mismatches.length > 0) {
    result.recommendations.push(
      `Fix ${result.foreignKeys.mismatches.length} foreign key type mismatches`
    );
  }
  
  if (result.schemaFiles.integerPrimaryKeys > 20) {
    result.recommendations.push(
      `Consider migrating remaining ${result.schemaFiles.integerPrimaryKeys} integer primary keys to UUID`
    );
  }
  
  if (result.schemaFiles.mixedPrimaryKeys > 0) {
    result.recommendations.push(
      `Review ${result.schemaFiles.mixedPrimaryKeys} files with mixed primary key types`
    );
  }
  
  const migrationPercentage = Math.round(
    (result.schemaFiles.uuidPrimaryKeys / result.schemaFiles.total) * 100
  );
  
  if (migrationPercentage < 90) {
    result.recommendations.push(
      `Complete UUID migration - currently ${migrationPercentage}% complete`
    );
  }
  
  return result;
}

function displayResults(result: ValidationResult): void {
  console.log(chalk.green('\n🎯 UUID Migration Validation Results\n'));
  
  // Schema Files Summary
  console.log(chalk.cyan('📊 Schema Files Analysis:'));
  console.log(`  Total files: ${result.schemaFiles.total}`);
  console.log(`  UUID primary keys: ${chalk.green(result.schemaFiles.uuidPrimaryKeys)}`);
  console.log(`  Integer primary keys: ${chalk.yellow(result.schemaFiles.integerPrimaryKeys)}`);
  console.log(`  Mixed primary keys: ${chalk.red(result.schemaFiles.mixedPrimaryKeys)}`);
  
  const migrationPercentage = Math.round(
    (result.schemaFiles.uuidPrimaryKeys / result.schemaFiles.total) * 100
  );
  console.log(`  Migration progress: ${chalk.bold(migrationPercentage + '%')}\n`);
  
  // Foreign Keys Summary
  console.log(chalk.cyan('🔗 Foreign Key Analysis:'));
  console.log(`  Total foreign keys: ${result.foreignKeys.total}`);
  console.log(`  UUID references: ${chalk.green(result.foreignKeys.uuidReferences)}`);
  console.log(`  Integer references: ${chalk.yellow(result.foreignKeys.integerReferences)}`);
  console.log(`  Type mismatches: ${chalk.red(result.foreignKeys.mismatches.length)}\n`);
  
  // Mismatches Detail
  if (result.foreignKeys.mismatches.length > 0) {
    console.log(chalk.red('🚨 Foreign Key Type Mismatches:'));
    for (const mismatch of result.foreignKeys.mismatches) {
      console.log(`  ${chalk.red('✗')} ${mismatch.file}:${mismatch.column} - ${mismatch.issue}`);
    }
    console.log();
  }
  
  // Type Definitions Summary
  console.log(chalk.cyan('🏷️  Type Definitions:'));
  console.log(`  Branded ID types: ${chalk.green(result.typeDefinitions.brandedTypes)}`);
  console.log(`  Missing types: ${result.typeDefinitions.missingTypes.length}\n`);
  
  // Recommendations
  if (result.recommendations.length > 0) {
    console.log(chalk.yellow('💡 Recommendations:'));
    for (const recommendation of result.recommendations) {
      console.log(`  ${chalk.yellow('→')} ${recommendation}`);
    }
    console.log();
  }
  
  // Overall Status
  const hasIssues = result.foreignKeys.mismatches.length > 0 || result.recommendations.length > 0;
  
  if (hasIssues) {
    console.log(chalk.red('❌ Migration has issues that need attention'));
  } else {
    console.log(chalk.green('✅ UUID migration is in good state!'));
  }
}

// Main execution
async function main() {
  try {
    const result = await validateMigration();
    displayResults(result);
    
    // Exit with error code if there are issues
    const hasIssues = result.foreignKeys.mismatches.length > 0;
    process.exit(hasIssues ? 1 : 0);
    
  } catch (error) {
    console.error(chalk.red('Error during validation:'), error);
    process.exit(1);
  }
}

// ES module entry point
main();