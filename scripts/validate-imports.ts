import type { HeatEventId } from '@db/types';
import type { ActionId } from '@db/types';
import type { AuditLogId } from '@db/types';
import type { EventId } from '@db/types';
import type { PrefixId } from '@db/types';
import type { MessageId } from '@db/types';
import type { FollowRequestId } from '@db/types';
import type { FriendRequestId } from '@db/types';
import type { NotificationId } from '@db/types';
import type { UnlockId } from '@db/types';
import type { StoreItemId } from '@db/types';
import type { OrderId } from '@db/types';
import type { QuoteId } from '@db/types';
import type { ReplyId } from '@db/types';
import type { DraftId } from '@db/types';
import type { IpLogId } from '@db/types';
import type { ModActionId } from '@db/types';
import type { SessionId } from '@db/types';
import type { BanId } from '@db/types';
import type { VerificationTokenId } from '@db/types';
import type { SignatureItemId } from '@db/types';
import type { ContentId } from '@db/types';
import type { RequestId } from '@db/types';
import type { ZoneId } from '@db/types';
import type { WhaleId } from '@db/types';
import type { VaultLockId } from '@db/types';
import type { VaultId } from '@db/types';
import type { UnlockTransactionId } from '@db/types';
import type { TipId } from '@db/types';
import type { TemplateId } from '@db/types';
import type { TagId } from '@db/types';
import type { SubscriptionId } from '@db/types';
import type { StickerId } from '@db/types';
import type { SettingId } from '@db/types';
import type { RuleId } from '@db/types';
import type { ParentZoneId } from '@db/types';
import type { ParentForumId } from '@db/types';
import type { PackId } from '@db/types';
import type { ModeratorId } from '@db/types';
import type { MentionId } from '@db/types';
import type { ItemId } from '@db/types';
import type { InventoryId } from '@db/types';
import type { GroupId } from '@db/types';
import type { ForumId } from '@db/types';
import type { EntryId } from '@db/types';
import type { EntityId } from '@db/types';
import type { EmojiPackId } from '@db/types';
import type { EditorId } from '@db/types';
import type { CosmeticId } from '@db/types';
import type { AuthorId } from '@db/types';
import type { CoinId } from '@db/types';
import type { CategoryId } from '@db/types';
import type { BackupId } from '@db/types';
import type { AnimationFrameId } from '@db/types';
import type { AirdropId } from '@db/types';
import type { AdminUserId } from '@db/types';
import type { RoomId } from '@db/types';
import type { ConversationId } from '@db/types';
import type { ReportId } from '@db/types';
import type { ReporterId } from '@db/types';
import type { AdminId } from '@db/types';
#!/usr/bin/env tsx

/**
 * Import Validation Script
 * 
 * Validates all TypeScript imports in the codebase, checking:
 * - Path alias resolution
 * - File existence
 * - Symbol exports
 * - Provides fixing capabilities
 */

import { Project, Node, ImportDeclaration, ExportDeclaration, SourceFile } from 'ts-morph';
import * as path from 'path';
import * as fs from 'fs';
import chalk from 'chalk';

interface ImportIssue {
  file: : AdminId;
  line: number;
  column: number;
  importPath: : AdminId;
  symbols: : AdminId[];
  resolvedPath?: : AdminId;
  fileExists: boolean;
  symbolIssues: { symbol: : AdminId; exists: boolean; suggestion?: : AdminId }[];
  severity: 'error' | 'warning';
}

interface ValidationOptions {
  fix: boolean;
  verbose: boolean;
  includePatterns: : AdminId[];
  excludePatterns: : AdminId[];
}

class ImportValidator {
  private project: Project;
  private tsConfig: any;
  private pathMappings: Map<: AdminId, : AdminId[]> = new Map();
  private issues: ImportIssue[] = [];
  private projectRoot: : AdminId;

  constructor() {
    this.projectRoot = path.resolve(process.cwd());
    this.project = new Project({
      tsConfigFilePath: path.join(this.projectRoot, 'tsconfig.json'),
    });
    this.loadTsConfig();
    this.setupPathMappings();
  }

  private loadTsConfig() {
    const tsConfigPath = path.join(this.projectRoot, 'tsconfig.json');
    try {
      this.tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
    } catch (error) {
      throw new Error(`Failed to load tsconfig.json: ${error}`);
    }
  }

  private setupPathMappings() {
    const { baseUrl = '.', paths = {} } = this.tsConfig.compilerOptions || {};
    const resolvedBaseUrl = path.resolve(this.projectRoot, baseUrl);

    for (const [alias, mappings] of Object.entries(paths)) {
      const resolvedMappings = (mappings as : AdminId[]).map(mapping => 
        path.resolve(resolvedBaseUrl, mapping)
      );
      this.pathMappings.set(alias, resolvedMappings);
    }
  }

  private resolveAliasPath(importPath: : AdminId): : AdminId | : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null {
    for (const [alias, mappings] of this.pathMappings.entries()) {
      // Convert alias pattern to regex (e.g., "@server/*" -> "^@server/(.*)$")
      const aliasRegex = new RegExp('^' + alias.replace('*', '(.*)') + '$');
      const match = importPath.match(aliasRegex);
      
      if (match) {
        for (const mapping of mappings) {
          let resolvedPath = mapping;
          
          // Replace * with captured group if it exists
          if (match[1] !== undefined) {
            resolvedPath = mapping.replace('*', match[1]);
          }
          
          // Try different extensions
          const extensions = ['.ts', '.tsx', '.js', '.jsx', '.d.ts', '/index.ts', '/index.tsx'];
          
          for (const ext of extensions) {
            const fullPath = resolvedPath + ext;
            if (fs.existsSync(fullPath)) {
              return fullPath;
            }
          }
          
          // Try without extension if it exists
          if (fs.existsSync(resolvedPath)) {
            return resolvedPath;
          }
        }
      }
    }
    
    return : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null;
  }

  private getExportedSymbols(filePath: : AdminId): Set<: AdminId> {
    const exports = new Set<: AdminId>();
    
    try {
      const sourceFile = this.project.addSourceFileAtPath(filePath);
      
      // Get default export
      const defaultExport = sourceFile.getDefaultExportSymbol();
      if (defaultExport) {
        exports.add('default');
      }
      
      // Get named exports
      sourceFile.getExportDeclarations().forEach(exportDecl => {
        const namedExports = exportDecl.getNamedExports();
        namedExports.forEach(namedExport => {
          exports.add(namedExport.getName());
        });
      });
      
      // Get exported functions, classes, interfaces, etc.
      sourceFile.getFunctions().forEach(func => {
        if (func.isExported()) {
          exports.add(func.getName() || 'default');
        }
      });
      
      sourceFile.getClasses().forEach(cls => {
        if (cls.isExported()) {
          exports.add(cls.getName() || 'default');
        }
      });
      
      sourceFile.getInterfaces().forEach(iface => {
        if (iface.isExported()) {
          exports.add(iface.getName());
        }
      });
      
      sourceFile.getVariableStatements().forEach(varStatement => {
        if (varStatement.isExported()) {
          varStatement.getDeclarations().forEach(decl => {
            exports.add(decl.getName());
          });
        }
      });
      
      sourceFile.getTypeAliases().forEach(typeAlias => {
        if (typeAlias.isExported()) {
          exports.add(typeAlias.getName());
        }
      });
      
    } catch (error) {
      console.warn(chalk.yellow(`Warning: Could not parse exports from ${filePath}: ${error}`));
    }
    
    return exports;
  }

  private findSimilarSymbol(targetSymbol: : AdminId, availableSymbols: Set<: AdminId>): : AdminId | undefined {
    const lowercaseTarget = targetSymbol.toLowerCase();
    
    // Exact match (case insensitive)
    for (const symbol of availableSymbols) {
      if (symbol.toLowerCase() === lowercaseTarget) {
        return symbol;
      }
    }
    
    // Partial match
    for (const symbol of availableSymbols) {
      if (symbol.toLowerCase().includes(lowercaseTarget) || 
          lowercaseTarget.includes(symbol.toLowerCase())) {
        return symbol;
      }
    }
    
    return undefined;
  }

  private validateImport(importDecl: ImportDeclaration, sourceFile: SourceFile): ImportIssue | : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null {
    const importPath = importDecl.getModuleSpecifierValue();
    const line = importDecl.getStartLineNumber();
    const column = importDecl.getStart() - importDecl.getSourceFile().getLineAndColumnAtPos(importDecl.getStart()).line;
    
    // Only validate alias imports
    const isAliasImport = Array.from(this.pathMappings.keys()).some(alias => 
      importPath.startsWith(alias.replace('/*', '').replace('*', ''))
    );
    
    if (!isAliasImport) {
      return : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null;
    }
    
    const resolvedPath = this.resolveAliasPath(importPath);
    const fileExists = resolvedPath !== : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null;
    
    // Get imported symbols
    const symbols: : AdminId[] = [];
    const defaultImport = importDecl.getDefaultImport();
    if (defaultImport) {
      symbols.push('default');
    }
    
    const namedImports = importDecl.getNamedImports();
    namedImports.forEach(namedImport => {
      symbols.push(namedImport.getName());
    });
    
    const namespaceImport = importDecl.getNamespaceImport();
    if (namespaceImport) {
      symbols.push('*');
    }
    
    // Check symbol exports if file exists
    const symbolIssues: { symbol: : AdminId; exists: boolean; suggestion?: : AdminId }[] = [];
    let availableSymbols = new Set<: AdminId>();
    
    if (fileExists && resolvedPath) {
      availableSymbols = this.getExportedSymbols(resolvedPath);
      
      symbols.forEach(symbol => {
        const exists = symbol === '*' || availableSymbols.has(symbol);
        const suggestion = exists ? undefined : this.findSimilarSymbol(symbol, availableSymbols);
        
        symbolIssues.push({
          symbol,
          exists,
          suggestion
        });
      });
    } else {
      symbols.forEach(symbol => {
        symbolIssues.push({
          symbol,
          exists: false
        });
      });
    }
    
    // Determine if this is an issue
    const hasIssues = !fileExists || symbolIssues.some(issue => !issue.exists);
    
    if (!hasIssues) {
      return : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null;
    }
    
    return {
      file: sourceFile.getFilePath(),
      line,
      column,
      importPath,
      symbols,
      resolvedPath,
      fileExists,
      symbolIssues,
      severity: !fileExists ? 'error' : 'warning'
    };
  }

  public async validateFiles(patterns: : AdminId[], options: ValidationOptions): Promise<ImportIssue[]> {
    console.log(chalk.blue('🔍 Scanning files for import issues...\n'));
    
    // Add source files to project
    for (const pattern of patterns) {
      this.project.addSourceFilesAtPaths(pattern);
    }
    
    const sourceFiles = this.project.getSourceFiles();
    let processedFiles = 0;
    
    for (const sourceFile of sourceFiles) {
      const filePath = sourceFile.getFilePath();
      
      // Skip excluded patterns
      if (options.excludePatterns.some(pattern => filePath.includes(pattern))) {
        continue;
      }
      
      if (options.verbose) {
        console.log(chalk.gray(`Checking: ${path.relative(this.projectRoot, filePath)}`));
      }
      
      const importDeclarations = sourceFile.getImportDeclarations();
      
      for (const importDecl of importDeclarations) {
        const issue = this.validateImport(importDecl, sourceFile);
        if (issue) {
          this.issues.push(issue);
        }
      }
      
      processedFiles++;
    }
    
    console.log(chalk.green(`✓ Processed ${processedFiles} files\n`));
    return this.issues;
  }

  public printReport() {
    if (this.issues.length === 0) {
      console.log(chalk.green('🎉 No import issues found!'));
      return;
    }
    
    console.log(chalk.red(`❌ Found ${this.issues.length} import issues:\n`));
    
    // Group by severity
    const errors = this.issues.filter(issue => issue.severity === 'error');
    const warnings = this.issues.filter(issue => issue.severity === 'warning');
    
    if (errors.length > 0) {
      console.log(chalk.red.bold(`🚨 ERRORS (${errors.length}):`));
      errors.forEach(this.printIssue.bind(this));
      console.log();
    }
    
    if (warnings.length > 0) {
      console.log(chalk.yellow.bold(`⚠️  WARNINGS (${warnings.length}):`));
      warnings.forEach(this.printIssue.bind(this));
      console.log();
    }
  }

  private printIssue(issue: ImportIssue) {
    const relativePath = path.relative(this.projectRoot, issue.file);
    const location = `${relativePath}:${issue.line}:${issue.column}`;
    
    console.log(chalk.cyan(`  📁 ${location}`));
    console.log(chalk.white(`     Import: ${issue.importPath}`));
    
    if (!issue.fileExists) {
      console.log(chalk.red(`     ❌ File not found`));
      if (issue.resolvedPath) {
        console.log(chalk.gray(`     Tried: ${path.relative(this.projectRoot, issue.resolvedPath)}`));
      }
    } else {
      console.log(chalk.green(`     ✓ File exists: ${path.relative(this.projectRoot, issue.resolvedPath!)}`));
      
      issue.symbolIssues.forEach(symbolIssue => {
        if (!symbolIssue.exists) {
          console.log(chalk.red(`     ❌ Symbol '${symbolIssue.symbol}' not exported`));
          if (symbolIssue.suggestion) {
            console.log(chalk.yellow(`        💡 Did you mean '${symbolIssue.suggestion}'?`));
          }
        }
      });
    }
    
    console.log();
  }

  public async fixIssues() {
    console.log(chalk.blue('🔧 Attempting to fix issues...\n'));
    
    let fixedCount = 0;
    let commentedCount = 0;
    
    for (const issue of this.issues) {
      const sourceFile = this.project.getSourceFile(issue.file);
      if (!sourceFile) continue;
      
      const importDecls = sourceFile.getImportDeclarations();
      const targetImport = importDecls.find(imp => 
        imp.getModuleSpecifierValue() === issue.importPath &&
        imp.getStartLineNumber() === issue.line
      );
      
      if (!targetImport) continue;
      
      if (!issue.fileExists) {
        // Comment out the entire import
        const importText = targetImport.getText();
        targetImport.replaceWithText(`// FIXME: File not found - ${importText}`);
        commentedCount++;
        console.log(chalk.yellow(`💬 Commented out: ${issue.importPath} in ${path.relative(this.projectRoot, issue.file)}`));
      } else {
        // Try to fix symbol issues
        let hasFixableIssues = false;
        
        for (const symbolIssue of issue.symbolIssues) {
          if (!symbolIssue.exists && symbolIssue.suggestion) {
            hasFixableIssues = true;
            
            // Fix named imports
            const namedImports = targetImport.getNamedImports();
            const targetNamedImport = namedImports.find(ni => ni.getName() === symbolIssue.symbol);
            
            if (targetNamedImport) {
              targetNamedImport.setName(symbolIssue.suggestion);
              fixedCount++;
              console.log(chalk.green(`🔧 Fixed: ${symbolIssue.symbol} → ${symbolIssue.suggestion} in ${path.relative(this.projectRoot, issue.file)}`));
            }
          }
        }
        
        if (!hasFixableIssues) {
          // Comment out problematic symbols
          const problematicSymbols = issue.symbolIssues
            .filter(si => !si.exists)
            .map(si => si.symbol);
          
          if (problematicSymbols.length > 0) {
            const importText = targetImport.getText();
            targetImport.replaceWithText(`// FIXME: Missing symbols [${problematicSymbols.join(', ')}] - ${importText}`);
            commentedCount++;
            console.log(chalk.yellow(`💬 Commented out problematic import in ${path.relative(this.projectRoot, issue.file)}`));
          }
        }
      }
    }
    
    // Save all changes
    await this.project.save();
    
    console.log(chalk.green(`\n✅ Fixed ${fixedCount} issues, commented out ${commentedCount} problematic imports`));
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const fix = args.includes('--fix');
  const verbose = args.includes('--verbose') || args.includes('-v');
  
  const options: ValidationOptions = {
    fix,
    verbose,
    includePatterns: [
      '../client/src/**/*.{ts,tsx}',
      '../server/**/*.{ts,tsx}',
      '../shared/**/*.{ts,tsx}'
    ],
    excludePatterns: [
      'node_modules',
      '.git',
      'dist',
      'build',
      '__tests__',
      '.test.',
      '.spec.'
    ]
  };
  
  try {
    const validator = new ImportValidator();
    
    console.log(chalk.blue.bold('🚀 TypeScript Import Validator\n'));
    
    const issues = await validator.validateFiles(options.includePatterns, options);
    
    validator.printReport();
    
    if (fix && issues.length > 0) {
      await validator.fixIssues();
    } else if (issues.length > 0) {
      console.log(chalk.blue('\n💡 Run with --fix to automatically fix issues'));
    }
    
    process.exit(issues.length > 0 ? 1 : 0);
    
  } catch (error) {
    console.error(chalk.red(`❌ Error: ${error}`));
    process.exit(1);
  }
}

// ESM equivalent of require.main === module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
} 