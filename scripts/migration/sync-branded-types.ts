#!/usr/bin/env tsx
/**
 * Branded Types Synchronizer
 * 
 * Ensures all tables in the schema have corresponding branded ID types
 * and suggests missing types that should be added.
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';

interface TableInfo {
  tableName: string;
  file: string;
  domain: string;
  expectedType: string;
}

interface TypesAnalysis {
  existingTypes: Set<string>;
  missingTypes: string[];
  schemaEntities: TableInfo[];
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

function extractTablesFromSchema(content: string, filePath: string): TableInfo[] {
  const tables: TableInfo[] = [];
  const domain = extractDomainFromPath(filePath);
  
  const tableMatches = content.matchAll(/export const (\w+) = pgTable\(/g);
  
  for (const match of tableMatches) {
    const tableName = match[1];
    const expectedType = generateBrandedTypeName(tableName);
    
    tables.push({
      tableName,
      file: filePath.replace(process.cwd(), ''),
      domain,
      expectedType
    });
  }
  
  return tables;
}

function generateBrandedTypeName(tableName: string): string {
  // Convert table name to singular branded type
  let typeName = tableName;
  
  // Handle common plural endings
  if (typeName.endsWith('ies')) {
    typeName = typeName.slice(0, -3) + 'y';
  } else if (typeName.endsWith('es') && !typeName.endsWith('ses')) {
    typeName = typeName.slice(0, -2);
  } else if (typeName.endsWith('s') && typeName.length > 3) {
    typeName = typeName.slice(0, -1);
  }
  
  // Capitalize first letter and add Id suffix
  typeName = typeName.charAt(0).toUpperCase() + typeName.slice(1) + 'Id';
  
  // Handle special cases
  const specialCases: Record<string, string> = {
    'UserRolesId': 'UserRoleId',
    'UserBadgesId': 'UserBadgeId',
    'UserTitlesId': 'UserTitleId',
    'ForumStructureId': 'StructureId',
    'DgtPackagesId': 'DgtPackageId',
    'CryptoWalletsId': 'CryptoWalletId',
    'AdminBackupsId': 'BackupId',
    'AirdropRecordsId': 'AirdropId',
    'UserAchievementsId': 'UserAchievementId',
    'ThreadTagsId': 'ThreadTagId',
    'PostLikesId': 'PostLikeId',
    'PollVotesId': 'PollVoteId',
    'PollOptionsId': 'PollOptionId',
    'CustomEmojisId': 'CustomEmojiId',
    'EmojiPacksId': 'EmojiPackId',
    'ThreadDraftsId': 'ThreadDraftId',
    'PostDraftsId': 'PostDraftId',
    'ShoutboxMessagesId': 'ShoutboxMessageId',
    'DirectMessagesId': 'DirectMessageId',
    'ConversationParticipantsId': 'ConversationParticipantId',
    'MessageReadsId': 'MessageReadId',
    'UserInventoryId': 'InventoryId',
    'InventoryTransactionsId': 'InventoryTransactionId'
  };
  
  return specialCases[typeName] || typeName;
}

function parseExistingTypes(content: string): Set<string> {
  const types = new Set<string>();
  
  // Match export type declarations
  const typeMatches = content.matchAll(/export type (\w+) = /g);
  for (const match of typeMatches) {
    types.add(match[1]);
  }
  
  return types;
}

function generateMissingTypeDeclarations(missingTypes: string[]): string {
  if (missingTypes.length === 0) return '';
  
  let content = '\n// Auto-generated missing types\n';
  
  // Group by domain for better organization
  const grouped = new Map<string, string[]>();
  
  for (const type of missingTypes) {
    const domain = getDomainFromType(type);
    if (!grouped.has(domain)) {
      grouped.set(domain, []);
    }
    grouped.get(domain)!.push(type);
  }
  
  for (const [domain, domainTypes] of grouped) {
    content += `\n// ${domain.charAt(0).toUpperCase() + domain.slice(1)} domain\n`;
    
    for (const type of domainTypes.sort()) {
      const entityName = type.replace('Id', '').toLowerCase();
      content += `export type ${type} = Id<'${entityName}'>;\n`;
    }
  }
  
  return content;
}

function getDomainFromType(typeName: string): string {
  const domainKeywords = {
    'User': 'user',
    'Admin': 'admin',
    'Thread': 'forum',
    'Post': 'forum',
    'Forum': 'forum',
    'Structure': 'forum',
    'Tag': 'forum',
    'Rule': 'forum',
    'Prefix': 'forum',
    'Poll': 'forum',
    'Emoji': 'forum',
    'Draft': 'forum',
    'Bookmark': 'forum',
    'Message': 'messaging',
    'Conversation': 'messaging',
    'Chat': 'messaging',
    'Shoutbox': 'messaging',
    'Direct': 'messaging',
    'Transaction': 'economy',
    'Wallet': 'economy',
    'Dgt': 'economy',
    'Airdrop': 'economy',
    'Badge': 'economy',
    'Title': 'economy',
    'Level': 'economy',
    'Xp': 'economy',
    'Tip': 'economy',
    'Rain': 'economy',
    'Vault': 'economy',
    'Withdrawal': 'economy',
    'Achievement': 'gamification',
    'Mission': 'gamification',
    'Leaderboard': 'gamification',
    'Sticker': 'collectibles',
    'Pack': 'collectibles',
    'Inventory': 'shop',
    'Product': 'shop',
    'Order': 'shop',
    'Animation': 'shop',
    'Signature': 'shop',
    'Campaign': 'advertising',
    'Placement': 'advertising',
    'Promotion': 'advertising',
    'Payment': 'advertising',
    'Performance': 'advertising',
    'Template': 'admin',
    'Backup': 'admin',
    'Report': 'admin',
    'Audit': 'admin',
    'Feature': 'admin',
    'Theme': 'admin',
    'Setting': 'admin',
    'Brand': 'admin',
    'Media': 'admin',
    'Moderation': 'admin',
    'Schedule': 'admin',
    'Seo': 'admin',
    'Site': 'admin',
    'Ui': 'admin'
  };
  
  for (const [keyword, domain] of Object.entries(domainKeywords)) {
    if (typeName.includes(keyword)) {
      return domain;
    }
  }
  
  return 'system';
}

async function analyzeTypes(): Promise<TypesAnalysis> {
  console.log(chalk.blue('🔍 Analyzing schema entities and branded types...\n'));
  
  // Get existing types
  const typesFile = join(process.cwd(), 'db/types/id.types.ts');
  const typesContent = await readFile(typesFile, 'utf-8');
  const existingTypes = parseExistingTypes(typesContent);
  
  // Get all schema entities
  const schemaDir = join(process.cwd(), 'db/schema');
  const files = await getAllSchemaFiles(schemaDir);
  
  const schemaEntities: TableInfo[] = [];
  
  for (const file of files) {
    const content = await readFile(file, 'utf-8');
    const tables = extractTablesFromSchema(content, file);
    schemaEntities.push(...tables);
  }
  
  // Find missing types
  const requiredTypes = new Set(schemaEntities.map(e => e.expectedType));
  const missingTypes = Array.from(requiredTypes).filter(type => !existingTypes.has(type));
  
  // Generate recommendations
  const recommendations = [];
  
  if (missingTypes.length > 0) {
    recommendations.push(`Add ${missingTypes.length} missing branded ID types to db/types/id.types.ts`);
  }
  
  // Check for unused types (optional)
  const usedTypes = new Set(schemaEntities.map(e => e.expectedType));
  const potentiallyUnused = Array.from(existingTypes).filter(type => 
    type.endsWith('Id') && !usedTypes.has(type)
  );
  
  if (potentiallyUnused.length > 0) {
    recommendations.push(`Review ${potentiallyUnused.length} potentially unused types`);
  }
  
  return {
    existingTypes,
    missingTypes: missingTypes.sort(),
    schemaEntities,
    recommendations
  };
}

async function updateTypesFile(missingTypes: string[]): Promise<void> {
  if (missingTypes.length === 0) return;
  
  const typesFile = join(process.cwd(), 'db/types/id.types.ts');
  const currentContent = await readFile(typesFile, 'utf-8');
  
  const newTypeDeclarations = generateMissingTypeDeclarations(missingTypes);
  const updatedContent = currentContent + newTypeDeclarations;
  
  await writeFile(typesFile, updatedContent);
  console.log(chalk.green(`✓ Added ${missingTypes.length} missing types to id.types.ts`));
}

async function main() {
  const analysis = await analyzeTypes();
  
  console.log(chalk.green('🎯 Branded Types Analysis Results\n'));
  console.log(chalk.cyan('📊 Summary:'));
  console.log(`  Schema entities: ${analysis.schemaEntities.length}`);
  console.log(`  Existing types: ${analysis.existingTypes.size}`);
  console.log(`  Missing types: ${chalk.red(analysis.missingTypes.length)}`);
  console.log(`  Recommendations: ${analysis.recommendations.length}\n`);
  
  if (analysis.missingTypes.length > 0) {
    console.log(chalk.red('🚨 Missing Types:'));
    for (const type of analysis.missingTypes) {
      console.log(`  ${chalk.red('●')} ${type}`);
    }
    console.log();
    
    // Auto-generate missing types
    await updateTypesFile(analysis.missingTypes);
  }
  
  if (analysis.recommendations.length > 0) {
    console.log(chalk.yellow('💡 Recommendations:'));
    for (const rec of analysis.recommendations) {
      console.log(`  ${chalk.yellow('→')} ${rec}`);
    }
    console.log();
  }
  
  if (analysis.missingTypes.length === 0) {
    console.log(chalk.green('✅ All schema entities have corresponding branded types!'));
  }
  
  // Display schema coverage by domain
  const domainCoverage = new Map<string, number>();
  for (const entity of analysis.schemaEntities) {
    domainCoverage.set(entity.domain, (domainCoverage.get(entity.domain) || 0) + 1);
  }
  
  console.log(chalk.cyan('\n📁 Schema Coverage by Domain:'));
  for (const [domain, count] of Array.from(domainCoverage.entries()).sort()) {
    console.log(`  ${domain}: ${count} entities`);
  }
}

main().catch(console.error);