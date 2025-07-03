#!/usr/bin/env tsx
/**
 * Relations Generator
 * 
 * Generates Drizzle relations files for each domain to enable type-safe joins.
 * Creates relations based on existing FK references in schema files.
 */

import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import chalk from 'chalk';

interface Relation {
  tableName: string;
  columnName: string;
  targetTable: string;
  relationType: 'one' | 'many';
  relationName: string;
}

interface DomainRelations {
  domain: string;
  tables: string[];
  relations: Relation[];
  imports: Set<string>;
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

function extractDomainFromPath(filePath: string): string {
  const parts = filePath.split('/');
  const schemaIndex = parts.findIndex(p => p === 'schema');
  return parts[schemaIndex + 1] || 'core';
}

function extractTableAndImports(content: string): { tables: string[], imports: Set<string> } {
  const tables: string[] = [];
  const imports = new Set<string>();
  
  // Extract table exports
  const tableMatches = content.matchAll(/export const (\w+) = pgTable\(/g);
  for (const match of tableMatches) {
    tables.push(match[1]);
  }
  
  // Extract existing imports
  const importMatches = content.matchAll(/import\s*{[^}]+}\s*from\s*['"]([^'"]+)['"]/g);
  for (const match of importMatches) {
    const importPath = match[1];
    if (!importPath.startsWith('drizzle') && !importPath.startsWith('node:')) {
      imports.add(importPath);
    }
  }
  
  return { tables, imports };
}

function extractRelations(content: string, filePath: string): Relation[] {
  const relations: Relation[] = [];
  const domain = extractDomainFromPath(filePath);
  
  // Extract table name
  const tableMatch = content.match(/export const (\w+) = pgTable\(/);
  if (!tableMatch) return relations;
  
  const tableName = tableMatch[1];
  
  // Extract FK references
  const fkPattern = /(\w+):\s*uuid\([^)]+\)[^.]*\.references\(\(\)\s*=>\s*(\w+)\.id/g;
  let match;
  
  while ((match = fkPattern.exec(content)) !== null) {
    const columnName = match[1];
    const targetTable = match[2];
    
    // Generate relation name
    const relationName = columnName.endsWith('Id') 
      ? columnName.slice(0, -2) // remove 'Id'
      : columnName;
    
    relations.push({
      tableName,
      columnName,
      targetTable,
      relationType: 'one',
      relationName
    });
  }
  
  return relations;
}

function generateImportPath(fromDomain: string, targetDomain: string, targetTable: string): string {
  if (fromDomain === targetDomain) {
    return `./${targetTable}`;
  }
  
  return `../${targetDomain}/${targetTable}`;
}

function generateRelationsFile(domainRelations: DomainRelations): string {
  const { domain, tables, relations } = domainRelations;
  
  if (relations.length === 0 && tables.length === 0) {
    return '';
  }
  
  let content = `/**\n * ${domain.charAt(0).toUpperCase() + domain.slice(1)} Domain Relations\n * \n * Auto-generated Drizzle relations for type-safe joins\n */\n\n`;
  
  // Add imports
  content += `import { relations } from 'drizzle-orm';\n`;
  
  // Import local tables
  for (const table of tables) {
    content += `import { ${table} } from './${table}';\n`;
  }
  
  // Import external tables
  const externalImports = new Map<string, Set<string>>();
  
  for (const relation of relations) {
    // Check if target table is external (not in current domain)
    if (!tables.includes(relation.targetTable)) {
      // Try to determine the domain of the target table
      let targetDomain = 'user'; // Default assumption
      
      if (relation.targetTable === 'users') targetDomain = 'user';
      else if (relation.targetTable.includes('thread') || relation.targetTable.includes('post') || relation.targetTable.includes('forum')) targetDomain = 'forum';
      else if (relation.targetTable.includes('campaign') || relation.targetTable.includes('payment')) targetDomain = 'advertising';
      else if (relation.targetTable.includes('transaction') || relation.targetTable.includes('wallet') || relation.targetTable.includes('dgt')) targetDomain = 'economy';
      else if (relation.targetTable.includes('message') || relation.targetTable.includes('chat')) targetDomain = 'messaging';
      else if (relation.targetTable.includes('achievement') || relation.targetTable.includes('mission')) targetDomain = 'gamification';
      else if (relation.targetTable.includes('sticker') || relation.targetTable.includes('emoji')) targetDomain = 'collectibles';
      else if (relation.targetTable.includes('admin') || relation.targetTable.includes('audit')) targetDomain = 'admin';
      
      if (!externalImports.has(targetDomain)) {
        externalImports.set(targetDomain, new Set());
      }
      externalImports.get(targetDomain)!.add(relation.targetTable);
    }
  }
  
  // Add external imports
  for (const [targetDomain, tableSet] of externalImports) {
    const tableList = Array.from(tableSet).join(', ');
    content += `import { ${tableList} } from '../${targetDomain}';\n`;
  }
  
  content += '\n';
  
  // Generate relations for each table
  const relationsByTable = new Map<string, Relation[]>();
  
  for (const relation of relations) {
    if (!relationsByTable.has(relation.tableName)) {
      relationsByTable.set(relation.tableName, []);
    }
    relationsByTable.get(relation.tableName)!.push(relation);
  }
  
  for (const table of tables) {
    const tableRelations = relationsByTable.get(table) || [];
    
    if (tableRelations.length > 0) {
      content += `export const ${table}Relations = relations(${table}, ({ one, many }) => ({\n`;
      
      for (const relation of tableRelations) {
        content += `  ${relation.relationName}: one(${relation.targetTable}, {\n`;
        content += `    fields: [${table}.${relation.columnName}],\n`;
        content += `    references: [${relation.targetTable}.id]\n`;
        content += `  }),\n`;
      }
      
      content += `}));\n\n`;
    }
  }
  
  // Generate reverse relations (many-to-one)
  const reverseRelations = new Map<string, Array<{fromTable: string, relationName: string, foreignKey: string}>>();
  
  for (const relation of relations) {
    if (!reverseRelations.has(relation.targetTable)) {
      reverseRelations.set(relation.targetTable, []);
    }
    
    const pluralName = relation.tableName; // Assume table names are already plural
    reverseRelations.get(relation.targetTable)!.push({
      fromTable: relation.tableName,
      relationName: pluralName,
      foreignKey: relation.columnName
    });
  }
  
  for (const [targetTable, reverseRels] of reverseRelations) {
    if (tables.includes(targetTable) && reverseRels.length > 0) {
      // Only generate if target table is in current domain
      content += `export const ${targetTable}Relations = relations(${targetTable}, ({ one, many }) => ({\n`;
      
      for (const reverseRel of reverseRels) {
        content += `  ${reverseRel.relationName}: many(${reverseRel.fromTable}),\n`;
      }
      
      content += `}));\n\n`;
    }
  }
  
  return content;
}

async function processFile(filePath: string): Promise<DomainRelations> {
  const content = await readFile(filePath, 'utf-8');
  const domain = extractDomainFromPath(filePath);
  const { tables, imports } = extractTableAndImports(content);
  const relations = extractRelations(content, filePath);
  
  return {
    domain,
    tables,
    relations,
    imports
  };
}

async function main() {
  console.log(chalk.blue('🔗 Generating Drizzle relations files...\n'));
  
  const schemaDir = join(process.cwd(), 'db/schema');
  const files = await getAllSchemaFiles(schemaDir);
  
  // Group files by domain
  const domainFiles = new Map<string, string[]>();
  
  for (const file of files) {
    const domain = extractDomainFromPath(file);
    if (!domainFiles.has(domain)) {
      domainFiles.set(domain, []);
    }
    domainFiles.get(domain)!.push(file);
  }
  
  let totalGenerated = 0;
  
  for (const [domain, domainFileList] of domainFiles) {
    console.log(chalk.yellow(`📁 Processing ${domain} domain (${domainFileList.length} files)...`));
    
    // Collect all relations for this domain
    const allTables = new Set<string>();
    const allRelations: Relation[] = [];
    const allImports = new Set<string>();
    
    for (const file of domainFileList) {
      const fileData = await processFile(file);
      
      for (const table of fileData.tables) {
        allTables.add(table);
      }
      
      allRelations.push(...fileData.relations);
      
      for (const imp of fileData.imports) {
        allImports.add(imp);
      }
    }
    
    // Generate relations file
    const domainRelations: DomainRelations = {
      domain,
      tables: Array.from(allTables),
      relations: allRelations,
      imports: allImports
    };
    
    const relationsContent = generateRelationsFile(domainRelations);
    
    if (relationsContent) {
      const outputPath = join(schemaDir, domain, 'relations.ts');
      
      // Ensure directory exists
      await mkdir(dirname(outputPath), { recursive: true });
      
      await writeFile(outputPath, relationsContent);
      console.log(`  ${chalk.green('✓')} Generated ${outputPath}`);
      console.log(`    ${allTables.size} tables, ${allRelations.length} relations`);
      totalGenerated++;
    }
  }
  
  console.log(chalk.green(`\n🎯 Relations generation complete!`));
  console.log(`  Domains processed: ${domainFiles.size}`);
  console.log(`  Relations files generated: ${totalGenerated}`);
  
  if (totalGenerated > 0) {
    console.log(chalk.yellow('\n💡 Next steps:'));
    console.log('  1. Import relations in your queries for type-safe joins');
    console.log('  2. Update domain index files to export relations');
    console.log('  3. Regenerate Drizzle types with: npm run db:generate');
  }
}

main().catch(console.error);