#!/usr/bin/env tsx
/**
 * Missing References Fixer
 * 
 * Systematically adds missing .references() declarations to FK columns
 * based on naming conventions and schema analysis.
 */

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';

interface ReferenceMapping {
  column: string;
  targetTable: string;
  targetFile: string;
}

interface FileContext {
  filePath: string;
  content: string;
  imports: string[];
  tableName: string;
}

// Common FK patterns and their target tables
const FK_MAPPINGS: Record<string, ReferenceMapping> = {
  // User references
  'userId': { column: 'userId', targetTable: 'users', targetFile: '../user/users' },
  'user_id': { column: 'user_id', targetTable: 'users', targetFile: '../user/users' },
  'createdBy': { column: 'createdBy', targetTable: 'users', targetFile: '../user/users' },
  'updatedBy': { column: 'updatedBy', targetTable: 'users', targetFile: '../user/users' },
  'authorId': { column: 'authorId', targetTable: 'users', targetFile: '../user/users' },
  'senderId': { column: 'senderId', targetTable: 'users', targetFile: '../user/users' },
  'recipientId': { column: 'recipientId', targetTable: 'users', targetFile: '../user/users' },
  'followerId': { column: 'followerId', targetTable: 'users', targetFile: '../user/users' },
  'followeeId': { column: 'followeeId', targetTable: 'users', targetFile: '../user/users' },
  'requesterId': { column: 'requesterId', targetTable: 'users', targetFile: '../user/users' },
  'addresseeId': { column: 'addresseeId', targetTable: 'users', targetFile: '../user/users' },
  'mentionedUserId': { column: 'mentionedUserId', targetTable: 'users', targetFile: '../user/users' },
  'mentioningUserId': { column: 'mentioningUserId', targetTable: 'users', targetFile: '../user/users' },
  'adminId': { column: 'adminId', targetTable: 'users', targetFile: '../user/users' },
  'moderatorId': { column: 'moderatorId', targetTable: 'users', targetFile: '../user/users' },
  'reporterId': { column: 'reporterId', targetTable: 'users', targetFile: '../user/users' },
  'likedByUserId': { column: 'likedByUserId', targetTable: 'users', targetFile: '../user/users' },
  'payerUserId': { column: 'payerUserId', targetTable: 'users', targetFile: '../user/users' },
  'proposerUserId': { column: 'proposerUserId', targetTable: 'users', targetFile: '../user/users' },
  'voterUserId': { column: 'voterUserId', targetTable: 'users', targetFile: '../user/users' },
  'advertiserUserId': { column: 'advertiserUserId', targetTable: 'users', targetFile: '../user/users' },
  'profileUserId': { column: 'profileUserId', targetTable: 'users', targetFile: '../user/users' },
  'targetUserId': { column: 'targetUserId', targetTable: 'users', targetFile: '../user/users' },
  'followingId': { column: 'followingId', targetTable: 'users', targetFile: '../user/users' },
  'ignoredUserId': { column: 'ignoredUserId', targetTable: 'users', targetFile: '../user/users' },
  
  // Thread references
  'threadId': { column: 'threadId', targetTable: 'threads', targetFile: '../forum/threads' },
  'discussionThreadId': { column: 'discussionThreadId', targetTable: 'threads', targetFile: '../forum/threads' },
  
  // Post references
  'postId': { column: 'postId', targetTable: 'posts', targetFile: '../forum/posts' },
  
  // Structure references (zones/categories)
  'structureId': { column: 'structureId', targetTable: 'forumStructure', targetFile: '../forum/structure' },
  
  // Role references
  'roleId': { column: 'roleId', targetTable: 'userRoles', targetFile: '../user/userRoles' },
  
  // Template references
  'templateId': { column: 'templateId', targetTable: 'emailTemplates', targetFile: '../admin/emailTemplates' },
  
  // Campaign references
  'campaignId': { column: 'campaignId', targetTable: 'campaigns', targetFile: '../advertising/campaigns' },
  
  // Product/inventory references
  'productId': { column: 'productId', targetTable: 'products', targetFile: '../shop/products' },
  'inventoryId': { column: 'inventoryId', targetTable: 'userInventory', targetFile: '../shop/userInventory' },
  
  // Message references
  'messageId': { column: 'messageId', targetTable: 'messages', targetFile: '../messaging/messages' },
  
  // Session references  
  'sessionId': { column: 'sessionId', targetTable: 'sessions', targetFile: '../user/sessions' },
  
  // Tag references
  'tagId': { column: 'tagId', targetTable: 'tags', targetFile: '../forum/tags' },
  
  // Placement references
  'placementId': { column: 'placementId', targetTable: 'placements', targetFile: '../advertising/placements' },
  
  // Content references (generic)
  'contentId': { column: 'contentId', targetTable: 'posts', targetFile: '../forum/posts' }, // Most content is posts
  
  // Sticker references
  'stickerId': { column: 'stickerId', targetTable: 'stickers', targetFile: '../collectibles/stickers' },
  
  // Achievement references
  'achievementId': { column: 'achievementId', targetTable: 'achievements', targetFile: '../gamification/achievements' },
  
  // Mission references
  'missionId': { column: 'missionId', targetTable: 'missions', targetFile: '../gamification/missions' },
  
  // Badge references
  'badgeId': { column: 'badgeId', targetTable: 'badges', targetFile: '../economy/badges' },
  
  // Title references
  'titleId': { column: 'titleId', targetTable: 'titles', targetFile: '../economy/titles' },
  
  // Conversation references
  'conversationId': { column: 'conversationId', targetTable: 'conversations', targetFile: '../messaging/conversations' },
  
  // Poll references
  'pollId': { column: 'pollId', targetTable: 'polls', targetFile: '../forum/polls' },
  'optionId': { column: 'optionId', targetTable: 'pollOptions', targetFile: '../forum/pollOptions' },
  
  // Airdrop references
  'airdropBatchId': { column: 'airdropBatchId', targetTable: 'airdropRecords', targetFile: '../economy/airdropRecords' },
  
  // Related entity references
  'relatedId': { column: 'relatedId', targetTable: 'users', targetFile: '../user/users' }, // Often user-related
  
  // Operation references
  'operationId': { column: 'operationId', targetTable: 'adminBackups', targetFile: '../admin/backups' },
  'sourceBackupId': { column: 'sourceBackupId', targetTable: 'adminBackups', targetFile: '../admin/backups' },
  
  // Collection references
  'collectionId': { column: 'collectionId', targetTable: 'collections', targetFile: '../collections/collections' },
  'quoteId': { column: 'quoteId', targetTable: 'quotes', targetFile: '../quotes/quotes' },
  
  // Proposal references
  'proposalId': { column: 'proposalId', targetTable: 'proposals', targetFile: '../proposals/proposals' }
};

// External system IDs that should NOT get references
const EXTERNAL_ID_PATTERNS = [
  /ccpayment.*id/i,
  /external.*id/i,
  /blockchain.*id/i,
  /tx.*id/i,
  /webhook.*id/i,
  /payment.*id/i,
  /record.*id/i,
  /x.*id/i, // Twitter/X IDs
  /discord.*id/i,
  /github.*id/i,
  /stripe.*id/i,
  /paypal.*id/i
];

function isExternalId(columnName: string): boolean {
  return EXTERNAL_ID_PATTERNS.some(pattern => pattern.test(columnName));
}

function extractFileContext(content: string, filePath: string): FileContext {
  // Extract imports
  const importLines = content.split('\n').filter(line => line.trim().startsWith('import'));
  
  // Extract table name
  const tableMatch = content.match(/export const (\w+) = pgTable\(/);
  const tableName = tableMatch?.[1] || '';
  
  return {
    filePath,
    content,
    imports: importLines,
    tableName
  };
}

function needsImport(context: FileContext, targetFile: string, targetTable: string): boolean {
  const relativePath = targetFile;
  const importPattern = new RegExp(`import.*{[^}]*${targetTable}[^}]*}.*from.*['"]${relativePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`);
  return !context.imports.some(imp => importPattern.test(imp));
}

function addImport(content: string, targetFile: string, targetTable: string): string {
  const lines = content.split('\n');
  const lastImportIndex = lines.findLastIndex(line => line.trim().startsWith('import'));
  
  if (lastImportIndex >= 0) {
    const newImport = `import { ${targetTable} } from '${targetFile}';`;
    lines.splice(lastImportIndex + 1, 0, newImport);
  }
  
  return lines.join('\n');
}

function addReference(content: string, columnName: string, targetTable: string): string {
  // Pattern to match column definition without .references()
  const columnPattern = new RegExp(
    `(${columnName}:\\s*(?:uuid|varchar)\\([^)]+\\)[^.]*?)(?=\\s*[,}])`,
    'g'
  );
  
  return content.replace(columnPattern, (match, columnDef) => {
    // Check if already has .references()
    if (columnDef.includes('.references(')) {
      return match;
    }
    
    // Add the reference
    return `${columnDef.replace(/,?\s*$/, '')}.references(() => ${targetTable}.id)`;
  });
}

async function processFile(filePath: string): Promise<{ 
  modified: boolean; 
  changes: Array<{ column: string; target: string }> 
}> {
  const content = await readFile(filePath, 'utf-8');
  const context = extractFileContext(content, filePath);
  
  if (!context.tableName) {
    return { modified: false, changes: [] };
  }
  
  let modifiedContent = content;
  const changes: Array<{ column: string; target: string }> = [];
  let needsImports = new Map<string, string>();
  
  // Find columns that need references
  for (const [columnPattern, mapping] of Object.entries(FK_MAPPINGS)) {
    if (isExternalId(columnPattern)) continue;
    
    const columnRegex = new RegExp(`${mapping.column}:\\s*(?:uuid|varchar)\\([^)]+\\)(?![^.]*\\.references)`, 'g');
    
    if (columnRegex.test(content)) {
      // Check if import is needed
      if (needsImport(context, mapping.targetFile, mapping.targetTable)) {
        needsImports.set(mapping.targetFile, mapping.targetTable);
      }
      
      // Add the reference
      modifiedContent = addReference(modifiedContent, mapping.column, mapping.targetTable);
      changes.push({ column: mapping.column, target: mapping.targetTable });
    }
  }
  
  // Add required imports
  for (const [targetFile, targetTable] of needsImports) {
    modifiedContent = addImport(modifiedContent, targetFile, targetTable);
  }
  
  const modified = modifiedContent !== content;
  
  if (modified) {
    await writeFile(filePath, modifiedContent);
  }
  
  return { modified, changes };
}

async function main() {
  console.log(chalk.blue('🔧 Adding missing .references() to FK columns...\n'));
  
  const schemaDir = join(process.cwd(), 'db/schema');
  
  // Get list of files from the scan results CSV
  const csvPath = join(process.cwd(), 'uuid-migration-scan-2025-07-03T06-24-15-450Z.csv');
  const csvContent = await readFile(csvPath, 'utf-8');
  const lines = csvContent.split('\n').slice(1); // Skip header
  
  const filesToProcess = new Set<string>();
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    const [file] = line.split(',').map(field => field.replace(/^"|"$/g, ''));
    if (file && file.includes('Foreign key column missing .references()')) {
      filesToProcess.add(join(process.cwd(), file));
    }
  }
  
  console.log(chalk.yellow(`📁 Processing ${filesToProcess.size} files...`));
  
  let totalFiles = 0;
  let modifiedFiles = 0;
  let totalChanges = 0;
  
  for (const filePath of filesToProcess) {
    try {
      const result = await processFile(filePath);
      totalFiles++;
      
      if (result.modified) {
        modifiedFiles++;
        totalChanges += result.changes.length;
        
        const relativePath = filePath.replace(process.cwd(), '');
        console.log(`${chalk.green('✓')} ${relativePath}`);
        
        for (const change of result.changes) {
          console.log(`  ${chalk.blue('→')} ${change.column} → ${change.target}.id`);
        }
      }
    } catch (error) {
      const relativePath = filePath.replace(process.cwd(), '');
      console.log(`${chalk.red('✗')} ${relativePath}: ${error}`);
    }
  }
  
  console.log(chalk.green(`\n🎯 Summary:`));
  console.log(`  Files processed: ${totalFiles}`);
  console.log(`  Files modified: ${modifiedFiles}`);
  console.log(`  Total references added: ${totalChanges}`);
  
  if (modifiedFiles > 0) {
    console.log(chalk.yellow('\n💡 Re-run the scanner to verify fixes...'));
  }
}

main().catch(console.error);