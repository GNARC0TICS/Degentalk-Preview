import { Project, SyntaxKind, StringLiteral, CallExpression, Node } from 'ts-morph';
import fg from 'fast-glob';
import path from 'node:path';
import fs from 'node:fs/promises';

/**
 * Codemod: brand-ids (SAFE VERSION)
 * --------------------------------------------------
 * Searches for raw string IDs (or crypto.randomUUID()) assigned to variables or
 * object-literal properties ending in `Id` and wraps them with the correct
 * branded-ID helper (toUserId, toForumId, …).  The helper is auto-imported from
 * '@shared/utils/id' if not already present.
 *
 * SAFETY FEATURES ADDED:
 * - Dry run mode by default
 * - Backup creation before modifications
 * - UUID validation for string literals
 * - Skip already wrapped IDs
 * - Better error handling
 * - Detailed logging of changes
 * - Rollback capability
 *
 * Usage:
 *   # Dry run (default):
 *   pnpm ts-node scripts/codemods/brand-ids-safe.ts
 *   
 *   # Execute changes:
 *   pnpm ts-node scripts/codemods/brand-ids-safe.ts --execute
 *   
 *   # With specific directories:
 *   pnpm ts-node scripts/codemods/brand-ids-safe.ts --dirs "client/src/features,shared/lib"
 */

// ------------------------ Configuration -----------------------------
const DRY_RUN = !process.argv.includes('--execute');
const BACKUP_DIR = '.codemod-backups/brand-ids';
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// More comprehensive helper mapping
const helperMap: Record<string, string> = {
  // User-related
  user: 'toUserId',
  author: 'toUserId',
  recipient: 'toUserId',
  moderator: 'toModeratorId',
  admin: 'toAdminId',
  adminUser: 'toAdminUserId',
  reporter: 'toReporterId',
  
  // Forum structure
  zone: 'toZoneId',
  parentZone: 'toParentZoneId',
  forum: 'toForumId',
  thread: 'toThreadId',
  post: 'toPostId',
  structure: 'toStructureId',
  category: 'toCategoryId',
  
  // Communication
  group: 'toGroupId',
  message: 'toMessageId',
  conversation: 'toConversationId',
  room: 'toRoomId',
  mention: 'toMentionId',
  
  // Gamification
  title: 'toTitleId',
  badge: 'toBadgeId',
  achievement: 'toAchievementId',
  mission: 'toMissionId',
  level: 'toLevelId',
  path: 'toPathId',
  
  // Commerce
  product: 'toProductId',
  item: 'toItemId',
  frame: 'toFrameId',
  order: 'toOrderId',
  purchaseOrder: 'toPurchaseOrderId',
  transaction: 'toTransactionId',
  wallet: 'toWalletId',
  cryptoWallet: 'toCryptoWalletId',
  
  // Economy-specific
  rainEvent: 'toRainEventId',
  withdrawal: 'toWithdrawalId',
  dgtPackage: 'toDgtPackageId',
  
  // Other
  tag: 'toTagId',
  emoji: 'toEmojiId',
  report: 'toReportId',
  draft: 'toDraftId',
  announcement: 'toAnnouncementId',
  entity: 'toEntityId',
  content: 'toContentId',
  whale: 'toWhaleId',
  
  // Special handling for common patterns
  activeFrame: 'toFrameId',
  activeTitle: 'toTitleId',
  activeBadge: 'toBadgeId',
  parentForum: 'toForumId',
  parentCategory: 'toCategoryId',
};

interface ChangeLog {
  file: string;
  line: number;
  column: number;
  before: string;
  after: string;
  type: 'variable' | 'property';
}

const changes: ChangeLog[] = [];

function guessHelper(idName: string): string | null {
  // First try exact match after stripping Id
  const base = idName.replace(/Id$/, '');
  if (helperMap[base]) return helperMap[base];
  
  // Then try suffix matching for compound names
  const entries = Object.keys(helperMap);
  const match = entries.find((k) => base.toLowerCase().endsWith(k.toLowerCase()));
  return match ? helperMap[match] : null;
}

function isValidUuid(value: string): boolean {
  return UUID_REGEX.test(value.replace(/['"]/g, ''));
}

function isAlreadyWrapped(node: Node): boolean {
  const parent = node.getParent();
  if (!parent) return false;
  
  // Check if parent is a call expression with a to*Id function
  if (parent.getKind() === SyntaxKind.CallExpression) {
    const callExpr = parent as CallExpression;
    const exprText = callExpr.getExpression().getText();
    // Check both our helper map and the generic toId function
    return Object.values(helperMap).includes(exprText) || exprText === 'toId';
  }
  
  // Check if this is an 'as' expression with a branded ID type
  if (parent.getKind() === SyntaxKind.AsExpression) {
    const typeText = parent.getType().getText();
    return typeText.endsWith('Id') || typeText.includes('Id<');
  }
  
  return false;
}

function shouldProcessStringLiteral(expr: StringLiteral): boolean {
  const value = expr.getLiteralValue();
  
  // Skip empty strings
  if (!value) return false;
  
  // Skip non-UUID strings (unless they look like numeric IDs during migration)
  if (!isValidUuid(value) && !/^\d+$/.test(value)) return false;
  
  // Skip if already wrapped
  if (isAlreadyWrapped(expr)) return false;
  
  return true;
}

function isRawId(expr: Node): boolean {
  if (expr.getKind() === SyntaxKind.StringLiteral) {
    return shouldProcessStringLiteral(expr as StringLiteral);
  }
  
  if (expr.getKind() === SyntaxKind.CallExpression) {
    const callExpr = expr as CallExpression;
    const exprText = callExpr.getExpression().getText();
    
    // Check for crypto.randomUUID() but not if already wrapped
    if (exprText === 'crypto.randomUUID' && !isAlreadyWrapped(callExpr)) {
      return true;
    }
  }
  
  return false;
}

async function createBackup(filePath: string): Promise<void> {
  if (DRY_RUN) return;
  
  const backupPath = path.join(BACKUP_DIR, filePath);
  await fs.mkdir(path.dirname(backupPath), { recursive: true });
  await fs.copyFile(filePath, backupPath);
}

async function run() {
  console.log(`🔧 Brand IDs Codemod - ${DRY_RUN ? 'DRY RUN' : 'EXECUTE MODE'}`);
  console.log('================================================\n');
  
  if (!DRY_RUN) {
    console.log('⚠️  WARNING: This will modify files. Backups will be created in:', BACKUP_DIR);
    console.log('Press Ctrl+C to cancel...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  const project = new Project({ tsConfigFilePath: path.resolve('tsconfig.json') });
  
  // Allow custom directories via --dirs flag
  const customDirs = process.argv.find(arg => arg.startsWith('--dirs='))?.split('=')[1];
  const patterns = customDirs 
    ? customDirs.split(',').map(dir => `${dir}/**/*.{ts,tsx}`)
    : ['client/src/**/*.{ts,tsx}', 'shared/**/*.{ts,tsx}'];
  
  const files = await fg(patterns, {
    ignore: [
      '**/*.d.ts',
      '**/node_modules/**',
      '**/*.test.ts',
      '**/*.spec.ts',
      '**/scripts/codemods/**',
      '**/.codemod-backups/**'
    ],
  });
  
  console.log(`Found ${files.length} files to process\n`);
  
  files.forEach((filePath) => project.addSourceFileAtPathIfExists(filePath));
  
  const sourceFiles = project.getSourceFiles();
  const stats = { touched: 0, rewrites: 0, skipped: 0, errors: 0 };
  
  for (const sf of sourceFiles) {
    const filePath = sf.getFilePath();
    const relPath = path.relative(process.cwd(), filePath);
    const usedHelpers = new Set<string>();
    let fileChanged = false;
    
    try {
      // Defer backup until we know the file will actually change
      let backupTaken = false;
      
      // VARIABLE DECLARATIONS -------------------------------------------------
      sf.getVariableDeclarations().forEach((decl) => {
        const name = decl.getName();
        if (!name.endsWith('Id')) return;
        
        const helper = guessHelper(name);
        if (!helper) {
          console.log(`⚠️  No helper found for: ${name} in ${relPath}`);
          stats.skipped++;
          return;
        }
        
        const init = decl.getInitializer();
        if (!init || !isRawId(init)) return;
        
        const before = init.getText();
        const after = `${helper}(${before})`;
        
        if (!DRY_RUN) {
          decl.setInitializer(after);
        }
        
        usedHelpers.add(helper);
        stats.rewrites++;
        fileChanged = true;
        
        const pos = init.getStart();
        const { line, column } = sf.getLineAndColumnAtPos(pos);
        
        changes.push({
          file: relPath,
          line,
          column,
          before,
          after,
          type: 'variable'
        });
      });
      
      // OBJECT LITERAL PROPERTY ASSIGNMENTS ----------------------------------
      sf.getDescendantsOfKind(SyntaxKind.PropertyAssignment).forEach((prop) => {
        const nameNode = prop.getNameNode();
        if (!nameNode || nameNode.getKind() !== SyntaxKind.Identifier) return;
        
        const name = nameNode.getText();
        if (!name.endsWith('Id')) return;
        
        const helper = guessHelper(name);
        if (!helper) {
          console.log(`⚠️  No helper found for property: ${name} in ${relPath}`);
          stats.skipped++;
          return;
        }
        
        const initializer = prop.getInitializer();
        if (!initializer || !isRawId(initializer)) return;
        
        const before = initializer.getText();
        const after = `${helper}(${before})`;
        
        if (!DRY_RUN) {
          prop.setInitializer(after);
        }
        
        usedHelpers.add(helper);
        stats.rewrites++;
        fileChanged = true;
        
        const pos = initializer.getStart();
        const { line, column } = sf.getLineAndColumnAtPos(pos);
        
        changes.push({
          file: relPath,
          line,
          column,
          before,
          after,
          type: 'property'
        });
      });
      
      // IMPORT MANAGEMENT -----------------------------------------------------
      if (usedHelpers.size > 0 && !DRY_RUN) {
        let importDecl = sf.getImportDeclaration((d) => 
          d.getModuleSpecifierValue() === '@shared/utils/id'
        );

        if (!importDecl) {
          // Simply append a new import; ts-morph will place it after existing imports
          importDecl = sf.addImportDeclaration({
            moduleSpecifier: '@shared/utils/id',
            namedImports: []
          });
        }

        const existing = new Set(importDecl.getNamedImports().map((ni) => ni.getName()));
        const helpersToAdd = Array.from(usedHelpers)
          .filter(helper => !existing.has(helper))
          .sort(); // Sort for consistent output

        helpersToAdd.forEach(helper => importDecl!.addNamedImport(helper));
      }

      // Take backup *after* we've determined the file will change and before saving
      if (fileChanged && !backupTaken && !DRY_RUN) {
        await createBackup(filePath);
        backupTaken = true;
      }
      
      if (fileChanged) {
        stats.touched++;
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${relPath}:`, error);
      stats.errors++;
    }
  }
  
  // Save changes
  if (!DRY_RUN && stats.touched > 0) {
    await project.save();
  }
  
  // Print detailed change log
  console.log('\n📋 Change Summary:');
  console.log('==================\n');
  
  if (changes.length === 0) {
    console.log('No changes needed! 🎉');
  } else {
    // Group changes by file
    const changesByFile = changes.reduce((acc, change) => {
      if (!acc[change.file]) acc[change.file] = [];
      acc[change.file].push(change);
      return acc;
    }, {} as Record<string, ChangeLog[]>);
    
    Object.entries(changesByFile).forEach(([file, fileChanges]) => {
      console.log(`\n📄 ${file}:`);
      fileChanges.forEach(change => {
        console.log(`  Line ${change.line}:${change.column} [${change.type}]`);
        console.log(`    - ${change.before}`);
        console.log(`    + ${change.after}`);
      });
    });
  }
  
  // Print stats
  console.log('\n📊 Statistics:');
  console.log('==============');
  console.log(`Files analyzed: ${sourceFiles.length}`);
  console.log(`Files modified: ${stats.touched}`);
  console.log(`ID rewrites: ${stats.rewrites}`);
  console.log(`Skipped (no helper): ${stats.skipped}`);
  console.log(`Errors: ${stats.errors}`);
  
  if (DRY_RUN) {
    console.log('\n✅ Dry run complete. No files were modified.');
    console.log('Run with --execute to apply changes.');
  } else {
    console.log('\n✅ Codemod complete!');
    console.log(`Backups saved to: ${BACKUP_DIR}`);
  }
}

// Rollback functionality
async function rollback() {
  console.log('🔄 Rolling back changes...');
  const backupFiles = await fg([`${BACKUP_DIR}/**/*`]);
  
  for (const backupFile of backupFiles) {
    const originalPath = backupFile.replace(BACKUP_DIR + '/', '');
    await fs.copyFile(backupFile, originalPath);
    console.log(`  Restored: ${originalPath}`);
  }
  
  console.log('✅ Rollback complete!');
}

// Main execution
if (process.argv.includes('--rollback')) {
  rollback().catch(console.error);
} else {
  run().catch((err) => {
    console.error('\n❌ Fatal error:', err);
    process.exit(1);
  });
}