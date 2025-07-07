import { Project, SyntaxKind, ImportDeclaration } from 'ts-morph';
import { globSync } from 'glob';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Quick fix for missing branded ID imports
 * Adds missing imports to @shared/types for files that reference branded IDs
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../../');

// Common branded ID types that are missing
const BRANDED_ID_TYPES = [
  'UserId', 'ThreadId', 'PostId', 'WalletId', 'TransactionId', 'ForumId',
  'AchievementId', 'BadgeId', 'LevelId', 'EntityId', 'ReporterId', 'ContentId',
  'FrameId', 'TitleId', 'CategoryId', 'ItemId', 'MissionId', 'ProductId',
  'PathId', 'AdminId', 'ReportId', 'ConversationId', 'RoomId', 'VaultId',
  'ModeratorId', 'BanId', 'WarningId', 'PermissionId', 'RoleId', 'DraftId',
  'EmojiPackId', 'CosmeticId', 'PackageId', 'InventoryItemId', 'TemplateId',
  'SubscriptionId', 'ActionId', 'TipId', 'EmojiId', 'TagId', 'OrderId',
  'GroupId', 'ParentZoneId', 'ZoneId', 'StructureId', 'InventoryId',
  'MessageId', 'AnnouncementId', 'MentionId'
];

export async function fixImports(dryRun = false) {
  console.log(`🔧 Fixing missing branded ID imports ${dryRun ? '(DRY RUN)' : ''}`);
  
  const project = new Project({
    tsConfigFilePath: path.join(projectRoot, 'tsconfig.json'),
  });
  
  // Focus on client files that are failing TypeScript
  const filePaths = globSync('client/src/**/*.{ts,tsx}', {
    cwd: projectRoot,
    ignore: [
      '**/*.test.*',
      '**/*.spec.*'
    ]
  });
  
  let fixedFiles = 0;
  
  for (const filePath of filePaths) {
    const sourceFile = project.getSourceFile(filePath);
    if (!sourceFile) continue;
    
    const fileText = sourceFile.getFullText();
    const usedBrandedIds = BRANDED_ID_TYPES.filter(id => 
      fileText.includes(id) && !fileText.includes(`import.*${id}`)
    );
    
    if (usedBrandedIds.length === 0) continue;
    
    // Check if @shared/types import exists
    let sharedTypesImport = sourceFile.getImportDeclaration('@shared/types');
    
    if (!sharedTypesImport) {
      // Add new import
      sourceFile.addImportDeclaration({
        moduleSpecifier: '@shared/types',
        namedImports: usedBrandedIds.map(id => ({ name: id, isTypeOnly: true }))
      });
    } else {
      // Add to existing import
      const existingImports = sharedTypesImport.getNamedImports().map(imp => imp.getName());
      const missingImports = usedBrandedIds.filter(id => !existingImports.includes(id));
      
      if (missingImports.length > 0) {
        sharedTypesImport.addNamedImports(
          missingImports.map(id => ({ name: id, isTypeOnly: true }))
        );
      }
    }
    
    if (!dryRun) {
      await sourceFile.save();
    }
    
    fixedFiles++;
    console.log(`   ✅ Fixed imports in ${filePath} (added: ${usedBrandedIds.join(', ')})`);
  }
  
  console.log(`   ✅ Fixed ${fixedFiles} files`);
  return { fixedFiles };
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const dryRun = process.argv.includes('--dry-run') || process.argv.includes('--dry');
  fixImports(dryRun);
}