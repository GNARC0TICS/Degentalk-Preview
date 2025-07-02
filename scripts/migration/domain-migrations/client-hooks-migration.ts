#!/usr/bin/env tsx

/**
 * Client-Hooks Domain Migration Script
 * 
 * Targeted migration for the client-hooks domain
 * MEDIUM RISK - React Query hooks with ID transformations
 */

import { readFileSync, writeFileSync } from 'fs';
import { Project, SourceFile, SyntaxKind } from 'ts-morph';
import { glob } from 'glob';

interface MigrationResult {
  file: string;
  changes: Change[];
  status: 'success' | 'error' | 'skipped';
  error?: string;
  backup?: string;
}

interface Change {
  line: number;
  original: string;
  replacement: string;
  confidence: number;
  type: 'id_definition' | 'id_usage' | 'id_conversion' | 'import_addition';
}

class ClientHooksMigration {
  private project: Project;
  private results: MigrationResult[] = [];
  private dryRun: boolean;

  constructor(dryRun: boolean = true) {
    this.dryRun = dryRun;
    this.project = new Project({
      tsConfigFilePath: './tsconfig.json',
      skipAddingFilesFromTsConfig: true
    });
  }

  async migrate(): Promise<void> {
    console.log('🚀 Client-Hooks Domain Migration');
    console.log('=================================');
    console.log(`Mode: ${this.dryRun ? 'DRY RUN' : 'LIVE MIGRATION'}`);
    console.log('Risk Level: MEDIUM\n');

    // Get client-hooks domain files
    const files = await this.getClientHooksFiles();
    console.log(`📁 Found ${files.length} client-hooks files`);

    // Phase 1: Analyze and plan
    console.log('\n📊 Phase 1: Analysis and Planning');
    await this.analyzeFiles(files);

    // Phase 2: Safe migrations (high confidence)
    console.log('\n🛡️ Phase 2: High-confidence migrations');
    await this.performSafeMigrations(files);

    // Phase 3: Manual review required
    console.log('\n⚠️ Phase 3: Manual review required');
    await this.identifyManualReviewItems(files);

    // Generate report
    console.log('\n📄 Generating migration report...');
    this.generateReport();

    console.log('\n✅ Client-hooks migration analysis complete');
  }

  private async getClientHooksFiles(): Promise<string[]> {
    const patterns = [
      // Client hooks files
      'client/src/hooks/**/*.{ts,tsx}',
      'client/src/features/**/hooks/**/*.{ts,tsx}',
      'client/src/lib/hooks/**/*.{ts,tsx}'
    ];

    const files: string[] = [];
    for (const pattern of patterns) {
      const matches = await glob(pattern, { cwd: process.cwd() });
      files.push(...matches);
    }

    return [...new Set(files)]; // Remove duplicates
  }

  private async analyzeFiles(files: string[]): Promise<void> {
    console.log('🔍 Analyzing client hooks files...');

    for (const file of files) {
      try {
        const content = readFileSync(file, 'utf-8');
        const patterns = this.findNumericIdPatterns(content, file);
        
        if (patterns.length > 0) {
          console.log(`  📄 ${file}: ${patterns.length} patterns found`);
          patterns.forEach(p => {
            console.log(`    - Line ${p.line}: ${p.original} → ${p.replacement} (confidence: ${p.confidence})`);
          });
        }
      } catch (error) {
        console.error(`❌ Error analyzing ${file}:`, error);
      }
    }
  }

  private findNumericIdPatterns(content: string, filepath: string): Change[] {
    const changes: Change[] = [];
    const lines = content.split('\n');

    // Client-hooks specific patterns
    const patterns = [
      // Hook parameter patterns
      { regex: /\bid:\s*number\b/g, replacement: 'id: UserId', confidence: 0.85, type: 'id_definition' as const },
      { regex: /\buserId:\s*number\b/g, replacement: 'userId: UserId', confidence: 1.0, type: 'id_definition' as const },
      { regex: /\bthreadId:\s*number\b/g, replacement: 'threadId: ThreadId', confidence: 1.0, type: 'id_definition' as const },
      { regex: /\bpostId:\s*number\b/g, replacement: 'postId: PostId', confidence: 1.0, type: 'id_definition' as const },
      
      // React Query key patterns (lower confidence - need manual review)
      { regex: /parseInt\(.*?id.*?\)/g, replacement: 'id as UserId', confidence: 0.7, type: 'id_conversion' as const },
      { regex: /Number\(.*?id.*?\)/g, replacement: 'id as UserId', confidence: 0.7, type: 'id_conversion' as const },
      
      // URL parameter patterns (common in hooks)
      { regex: /params\.id/g, replacement: 'params.id as UserId', confidence: 0.8, type: 'id_conversion' as const },
      { regex: /searchParams\.get\(['"]id['"]\)/g, replacement: 'searchParams.get("id") as UserId', confidence: 0.8, type: 'id_conversion' as const }
    ];

    lines.forEach((line, index) => {
      patterns.forEach(({ regex, replacement, confidence, type }) => {
        regex.lastIndex = 0; // Reset regex
        const matches = [...line.matchAll(regex)];
        
        matches.forEach(() => {
          // Skip lines with explicit comments saying "should be number"
          if (line.includes('should be number') || line.includes('@ts-ignore')) {
            return;
          }

          // Context-aware replacement for generic 'id: number'
          let finalReplacement = replacement;
          let finalConfidence = confidence;

          if (replacement === 'id: UserId') {
            if (filepath.includes('forum') || line.includes('thread')) {
              finalReplacement = 'id: ThreadId';
            } else if (line.includes('post')) {
              finalReplacement = 'id: PostId';
            } else if (line.includes('achievement')) {
              finalReplacement = 'id: AchievementId';
            }
          }

          // Lower confidence for conversion patterns that might need different handling
          if (type === 'id_conversion' && line.includes('parseInt')) {
            finalConfidence = 0.6; // Needs manual review
          }

          changes.push({
            line: index + 1,
            original: line.trim(),
            replacement: line.replace(regex, finalReplacement),
            confidence: finalConfidence,
            type
          });
        });
      });
    });

    return changes;
  }

  private async performSafeMigrations(files: string[]): Promise<void> {
    console.log('🛡️ Performing high-confidence migrations...');

    for (const file of files) {
      try {
        const content = readFileSync(file, 'utf-8');
        const changes = this.findNumericIdPatterns(content, file);
        
        // Only apply high-confidence changes (≥0.9)
        const safeChanges = changes.filter(c => c.confidence >= 0.9);
        
        if (safeChanges.length > 0) {
          const result = await this.applyChanges(file, safeChanges);
          this.results.push(result);
          
          if (result.status === 'success') {
            console.log(`  ✅ ${file}: ${safeChanges.length} changes applied`);
          } else {
            console.log(`  ❌ ${file}: ${result.error}`);
          }
        }
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error);
        this.results.push({
          file,
          changes: [],
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  private async applyChanges(file: string, changes: Change[]): Promise<MigrationResult> {
    try {
      // Create backup
      const originalContent = readFileSync(file, 'utf-8');
      const backupPath = `${file}.backup.${Date.now()}`;
      
      if (!this.dryRun) {
        writeFileSync(backupPath, originalContent);
      }

      // Apply changes
      let modifiedContent = originalContent;
      const lines = modifiedContent.split('\n');

      // Apply changes in reverse order to maintain line numbers
      for (const change of changes.reverse()) {
        if (change.line - 1 < lines.length) {
          lines[change.line - 1] = change.replacement;
        }
      }

      modifiedContent = lines.join('\n');

      // Add imports if needed
      modifiedContent = this.addRequiredImports(modifiedContent, changes);

      // Write modified content (if not dry run)
      if (!this.dryRun) {
        writeFileSync(file, modifiedContent);
      }

      return {
        file,
        changes,
        status: 'success',
        backup: this.dryRun ? undefined : backupPath
      };

    } catch (error) {
      return {
        file,
        changes,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private addRequiredImports(content: string, changes: Change[]): string {
    const usedTypes = new Set<string>();
    
    changes.forEach(change => {
      if (change.replacement.includes('UserId')) usedTypes.add('UserId');
      if (change.replacement.includes('ThreadId')) usedTypes.add('ThreadId');
      if (change.replacement.includes('PostId')) usedTypes.add('PostId');
      if (change.replacement.includes('AchievementId')) usedTypes.add('AchievementId');
    });

    if (usedTypes.size === 0) return content;

    const importStatement = `import type { ${Array.from(usedTypes).join(', ')} } from '@db/types';\n`;
    
    // Check if import already exists
    if (content.includes('from \'@db/types\'') || content.includes('from "@db/types"')) {
      return content;
    }

    // Add import at the top after existing imports
    const lines = content.split('\n');
    let insertIndex = 0;
    
    // Find the last import statement
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ') && !lines[i].includes('import.meta')) {
        insertIndex = i + 1;
      }
    }

    lines.splice(insertIndex, 0, importStatement);
    return lines.join('\n');
  }

  private async identifyManualReviewItems(files: string[]): Promise<void> {
    console.log('⚠️ Identifying items requiring manual review...');
    const manualReviewItems: Array<{file: string, items: Change[]}> = [];

    for (const file of files) {
      try {
        const content = readFileSync(file, 'utf-8');
        const changes = this.findNumericIdPatterns(content, file);
        
        // Items with lower confidence need manual review
        const reviewItems = changes.filter(c => c.confidence < 0.9);
        
        if (reviewItems.length > 0) {
          console.log(`  📋 ${file}: ${reviewItems.length} items need manual review`);
          reviewItems.forEach(item => {
            console.log(`    - Line ${item.line}: ${item.original} (confidence: ${item.confidence})`);
          });
          manualReviewItems.push({ file, items: reviewItems });
        }
      } catch (error) {
        console.error(`❌ Error reviewing ${file}:`, error);
      }
    }

    // Generate manual review checklist
    if (manualReviewItems.length > 0) {
      this.generateManualReviewChecklist(manualReviewItems);
    }
  }

  private generateManualReviewChecklist(items: Array<{file: string, items: Change[]}>): void {
    const checklistPath = 'scripts/migration/output/hooks-review.md';
    let checklist = '# Client-Hooks Manual Review Checklist\n\n';
    checklist += 'Generated from migration dry-run. Review these items before applying changes.\n\n';

    items.forEach(({ file, items }) => {
      checklist += `## ${file}\n\n`;
      items.forEach((item, index) => {
        checklist += `- [ ] **Line ${item.line}** (confidence: ${item.confidence})\n`;
        checklist += `  - Original: \`${item.original}\`\n`;
        checklist += `  - Suggested: \`${item.replacement}\`\n`;
        checklist += `  - Type: ${item.type}\n\n`;
      });
    });

    checklist += '\n## Common Issues to Check\n\n';
    checklist += '- [ ] `parseInt(id)` patterns - ensure correct type casting\n';
    checklist += '- [ ] URL parameter extractions - verify context (user, thread, post)\n';
    checklist += '- [ ] React Query keys - ensure proper type propagation\n';
    checklist += '- [ ] Hook parameter types - verify calling components pass correct types\n';

    if (!this.dryRun) {
      writeFileSync(checklistPath, checklist);
      console.log(`📋 Manual review checklist generated: ${checklistPath}`);
    } else {
      console.log('\n📋 Manual Review Checklist Preview:');
      console.log(checklist.substring(0, 500) + '...');
    }
  }

  private generateReport(): void {
    const successCount = this.results.filter(r => r.status === 'success').length;
    const errorCount = this.results.filter(r => r.status === 'error').length;
    const totalChanges = this.results.reduce((sum, r) => sum + r.changes.length, 0);

    console.log('\n📊 Migration Report');
    console.log('==================');
    console.log(`Files processed: ${this.results.length}`);
    console.log(`Successful migrations: ${successCount}`);
    console.log(`Failed migrations: ${errorCount}`);
    console.log(`Total changes applied: ${totalChanges}`);
    console.log(`Mode: ${this.dryRun ? 'DRY RUN' : 'LIVE MIGRATION'}`);

    if (errorCount > 0) {
      console.log('\n❌ Errors encountered:');
      this.results.filter(r => r.status === 'error').forEach(r => {
        console.log(`  - ${r.file}: ${r.error}`);
      });
    }

    if (!this.dryRun && successCount > 0) {
      console.log('\n💾 Backup files created:');
      this.results.filter(r => r.backup).forEach(r => {
        console.log(`  - ${r.backup}`);
      });
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const isDryRun = !args.includes('--live');

  if (!isDryRun) {
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise<string>((resolve) => {
      rl.question('⚠️  You are about to run LIVE migration. This will modify files. Continue? (y/N): ', resolve);
    });

    rl.close();

    if (answer.toLowerCase() !== 'y') {
      console.log('Migration cancelled.');
      process.exit(0);
    }
  }

  const migration = new ClientHooksMigration(isDryRun);
  await migration.migrate();
}

// ESM entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ClientHooksMigration };