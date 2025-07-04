import { Project, SyntaxKind, TypeNode, PropertySignature, Parameter, InterfaceDeclaration } from 'ts-morph';
import { globSync } from 'glob';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Codemod: numeric-id-migration
 * -----------------------------
 * Final push to eliminate numeric ID types in favor of branded types
 * 
 * Transforms:
 * - userId: number → userId: UserId
 * - threadId: bigint → threadId: ThreadId  
 * - interface { id: number } → interface { id: EntityId }
 * 
 * Handles:
 * - Interface properties
 * - Function parameters  
 * - Type annotations
 * - Variable declarations
 * 
 * Usage:
 * - pnpm codemod:numeric-ids
 * - pnpm codemod:numeric-ids --dry-run
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../../');

// Mapping of numeric ID patterns to branded types
const ID_TYPE_MAP: Record<string, string> = {
  'userId': 'UserId',
  'threadId': 'ThreadId',
  'postId': 'PostId', 
  'walletId': 'WalletId',
  'transactionId': 'TransactionId',
  'forumId': 'ForumId',
  'categoryId': 'CategoryId',
  'itemId': 'ItemId',
  'frameId': 'FrameId',
  'badgeId': 'BadgeId',
  'titleId': 'TitleId',
  'prefixId': 'PrefixId',
  'missionId': 'MissionId',
  'achievementId': 'AchievementId',
  'productId': 'ProductId',
  'pathId': 'PathId',
  'adminId': 'AdminId',
  'reportId': 'ReportId',
  'conversationId': 'ConversationId',
  'roomId': 'RoomId',
  'vaultId': 'VaultId',
  'actionId': 'ActionId',
  'tipId': 'TipId',
  'entityId': 'EntityId',
  'emojiId': 'EmojiId',
  'reporterId': 'ReporterId',
  'contentId': 'ContentId',
  'levelId': 'LevelId',
  'tagId': 'TagId',
  'orderId': 'OrderId',
  'groupId': 'GroupId',
  'zoneId': 'ZoneId',
  'structureId': 'StructureId',
  'inventoryId': 'InventoryId',
  'messageId': 'MessageId',
  'announcementId': 'AnnouncementId',
  'mentionId': 'MentionId',
  'cryptoWalletId': 'CryptoWalletId',
  'rainEventId': 'RainEventId',
  'withdrawalId': 'WithdrawalId',
  'dgtPackageId': 'DgtPackageId',
  'purchaseOrderId': 'PurchaseOrderId'
};

// Generic ID property patterns (for 'id' fields)
const GENERIC_ID_CONTEXTS = [
  'Entity', 'Model', 'Record', 'Item', 'Object'
];

interface MigrationResult {
  transformCount: number;
  transformedFiles: string[];
  errors: Array<{ file: string; error: string }>;
  summary: string;
}

export async function numericIdMigrationCodemod(dryRun = false): Promise<MigrationResult> {
  console.log(`🚀 Starting numeric ID migration codemod ${dryRun ? '(DRY RUN)' : ''}`);
  
  const project = new Project({
    tsConfigFilePath: path.join(projectRoot, 'tsconfig.json'),
  });
  
  // Include both server and shared files, but exclude tests and node_modules
  const filePaths = globSync('**/*.{ts,tsx}', {
    cwd: projectRoot,
    ignore: [
      'node_modules/**',
      '**/*.test.ts',
      '**/*.spec.ts',
      'archive/**',
      '**/*.d.ts',
      'client/**', // Skip client for now - different import patterns
      'db/types/id.types.ts' // Skip the bridge file
    ]
  });

  let transformCount = 0;
  const transformedFiles: string[] = [];
  const errors: Array<{ file: string; error: string }> = [];

  for (const relPath of filePaths) {
    try {
      const fullPath = path.join(projectRoot, relPath);
      const sourceFile = project.addSourceFileAtPath(fullPath);
      let fileModified = false;
      const usedBrandedTypes = new Set<string>();

      // Pattern 1: Interface property signatures
      sourceFile.forEachDescendant(node => {
        if (node.getKind() === SyntaxKind.PropertySignature) {
          const propSig = node as PropertySignature;
          const propertyName = propSig.getName();
          const typeNode = propSig.getTypeNode();
          
          if (typeNode && isNumericType(typeNode)) {
            const brandedType = getBrandedTypeForProperty(propertyName, propSig);
            if (brandedType) {
              typeNode.replaceWithText(brandedType);
              usedBrandedTypes.add(brandedType);
              transformCount++;
              fileModified = true;
            }
          }
        }
      });

      // Pattern 2: Function parameters  
      sourceFile.forEachDescendant(node => {
        if (node.getKind() === SyntaxKind.Parameter) {
          const param = node as Parameter;
          const paramName = param.getName();
          const typeNode = param.getTypeNode();
          
          if (typeNode && isNumericType(typeNode)) {
            const brandedType = ID_TYPE_MAP[paramName];
            if (brandedType) {
              typeNode.replaceWithText(brandedType);
              usedBrandedTypes.add(brandedType);
              transformCount++;
              fileModified = true;
            }
          }
        }
      });

      // Pattern 3: Variable declarations with type annotations
      sourceFile.forEachDescendant(node => {
        if (node.getKind() === SyntaxKind.VariableDeclaration) {
          const varDecl = node as any; // TypeScript morph typing issues
          const varName = varDecl.getName?.();
          const typeNode = varDecl.getTypeNode?.();
          
          if (typeNode && varName && isNumericType(typeNode)) {
            const brandedType = ID_TYPE_MAP[varName];
            if (brandedType) {
              typeNode.replaceWithText(brandedType);
              usedBrandedTypes.add(brandedType);
              transformCount++;
              fileModified = true;
            }
          }
        }
      });

      // Pattern 4: Type aliases
      sourceFile.forEachDescendant(node => {
        if (node.getKind() === SyntaxKind.TypeAliasDeclaration) {
          const typeAlias = node as any;
          const aliasName = typeAlias.getName?.();
          const typeNode = typeAlias.getTypeNode?.();
          
          if (typeNode && aliasName && isNumericType(typeNode)) {
            // Check if this is an ID type alias
            if (aliasName.toLowerCase().includes('id')) {
              const brandedType = ID_TYPE_MAP[aliasName] || 'EntityId';
              typeNode.replaceWithText(brandedType);
              usedBrandedTypes.add(brandedType);
              transformCount++;
              fileModified = true;
            }
          }
        }
      });

      // Add @shared/types import if we used any branded types
      if (usedBrandedTypes.size > 0) {
        addSharedTypesImport(sourceFile, Array.from(usedBrandedTypes));
      }

      if (fileModified) {
        transformedFiles.push(relPath);
        if (!dryRun) {
          await sourceFile.save();
        }
      }
    } catch (error) {
      errors.push({
        file: relPath,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  return {
    transformCount,
    transformedFiles,
    errors,
    summary: `${dryRun ? '[DRY RUN] ' : ''}Transformed ${transformCount} numeric ID types in ${transformedFiles.length} files`
  };
}

function isNumericType(typeNode: TypeNode): boolean {
  const typeText = typeNode.getText().trim();
  return typeText === 'number' || typeText === 'bigint';
}

function getBrandedTypeForProperty(propertyName: string, propSig: PropertySignature): string | null {
  // Direct mapping from property name
  if (ID_TYPE_MAP[propertyName]) {
    return ID_TYPE_MAP[propertyName];
  }
  
  // Generic 'id' property - try to infer from context
  if (propertyName === 'id') {
    const interfaceDecl = propSig.getParent();
    if (interfaceDecl && interfaceDecl.getKind() === SyntaxKind.InterfaceDeclaration) {
      const interfaceName = (interfaceDecl as InterfaceDeclaration).getName();
      return inferIdTypeFromContext(interfaceName);
    }
    return 'EntityId'; // Fallback for generic ID
  }
  
  // Properties ending with 'Id'
  if (propertyName.endsWith('Id')) {
    return ID_TYPE_MAP[propertyName] || 'EntityId';
  }
  
  return null;
}

function inferIdTypeFromContext(contextName: string): string {
  const lowerContext = contextName.toLowerCase();
  
  // Try to match context to specific types
  if (lowerContext.includes('user')) return 'UserId';
  if (lowerContext.includes('thread')) return 'ThreadId';
  if (lowerContext.includes('post')) return 'PostId';
  if (lowerContext.includes('wallet')) return 'WalletId';
  if (lowerContext.includes('transaction')) return 'TransactionId';
  if (lowerContext.includes('forum')) return 'ForumId';
  if (lowerContext.includes('category')) return 'CategoryId';
  if (lowerContext.includes('message')) return 'MessageId';
  if (lowerContext.includes('conversation')) return 'ConversationId';
  
  // Generic fallback
  return 'EntityId';
}

function addSharedTypesImport(sourceFile: any, typesToImport: string[]): void {
  const existingImport = sourceFile.getImportDeclaration('"@shared/types"') ||
                         sourceFile.getImportDeclaration("'@shared/types'");
  
  if (existingImport) {
    // Add missing types to existing import
    const existingImports = existingImport.getNamedImports().map((imp: any) => imp.getName());
    const newImports = typesToImport.filter(type => !existingImports.includes(type));
    
    if (newImports.length > 0) {
      existingImport.addNamedImports(newImports);
    }
  } else {
    // Create new import
    sourceFile.addImportDeclaration({
      moduleSpecifier: '@shared/types',
      namedImports: typesToImport
    });
  }
}

// Bridge file removal utility
export async function removeBridgeFile(dryRun = false): Promise<boolean> {
  const bridgePath = path.join(projectRoot, 'db/types/id.types.ts');
  
  console.log(`🔍 Checking for remaining @db/types imports...`);
  
  // Search for any remaining imports of the bridge file
  const remainingImports = globSync('**/*.{ts,tsx}', {
    cwd: projectRoot,
    ignore: ['node_modules/**', 'archive/**']
  }).map(file => {
    const fullPath = path.join(projectRoot, file);
    try {
      const content = require('fs').readFileSync(fullPath, 'utf8');
      if (content.includes('@db/types') && !file.includes('db/types/id.types.ts')) {
        return file;
      }
    } catch (error) {
      // Ignore files that can't be read
    }
    return null;
  }).filter(Boolean);

  if (remainingImports.length > 0) {
    console.log(`❌ Cannot remove bridge file - ${remainingImports.length} files still import @db/types:`);
    remainingImports.forEach(file => console.log(`  - ${file}`));
    return false;
  }

  if (dryRun) {
    console.log(`✅ [DRY RUN] Bridge file can be safely removed`);
    return true;
  }

  try {
    const fs = require('fs');
    fs.unlinkSync(bridgePath);
    console.log(`✅ Bridge file removed: ${bridgePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to remove bridge file:`, error);
    return false;
  }
}

// CLI interface
if (typeof require !== 'undefined' && require.main === module) {
  const dryRun = process.argv.includes('--dry-run') || process.argv.includes('--dry');
  const removeBridge = process.argv.includes('--remove-bridge');
  
  async function main() {
    const result = await numericIdMigrationCodemod(dryRun);
    
    console.log('\n' + result.summary);
    
    if (dryRun && result.transformedFiles.length > 0) {
      console.log('\n📝 Files that would be modified:');
      result.transformedFiles.forEach(f => console.log(`  - ${f}`));
    }
    
    if (result.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      result.errors.forEach(e => console.log(`  ${e.file}: ${e.error}`));
    }
    
    if (!dryRun && result.transformCount > 0) {
      console.log('\n✅ Numeric ID migration complete!');
      console.log('💡 Next steps:');
      console.log('  1. Run `pnpm typecheck` to verify all imports');
      console.log('  2. Test affected functionality');
      console.log('  3. Only AFTER typecheck passes, run with --remove-bridge');
    }
    
    // Handle bridge file removal - ONLY if typecheck passes
    if (removeBridge) {
      console.log('\n🔍 Validating TypeScript compilation before bridge removal...');
      
      try {
        const { execSync } = require('child_process');
        execSync('pnpm typecheck', { stdio: 'pipe' });
        console.log('✅ TypeScript compilation successful');
        
        console.log('\n🗑️  Attempting to remove bridge file...');
        const removed = await removeBridgeFile(dryRun);
        if (removed && !dryRun) {
          console.log('🎉 Bridge file successfully removed - migration complete!');
        }
      } catch (error) {
        console.log('❌ TypeScript compilation failed - bridge file removal aborted');
        console.log('💡 Fix compilation errors first, then re-run with --remove-bridge');
        process.exit(1);
      }
    }
    
    if (result.errors.length > 0) {
      process.exit(1);
    }
  }
  
  main().catch(error => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
}