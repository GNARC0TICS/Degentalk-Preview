#!/usr/bin/env tsx

/**
 * Client-API Domain Migration Script
 * 
 * Targeted migration for the client-api domain (1 ID issue, 6 files)
 * LOW RISK - single straightforward API pattern
 */

import { readFileSync, writeFileSync } from 'fs';
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
  type: 'id_definition' | 'id_usage' | 'id_conversion';
}

class ClientApiMigration {
  private results: MigrationResult[] = [];
  private dryRun: boolean;

  constructor(dryRun: boolean = true) {
    this.dryRun = dryRun;
  }

  async migrate(): Promise<void> {
    console.log('🚀 Client-API Domain Migration');
    console.log('=================================');
    console.log(`Mode: ${this.dryRun ? 'DRY RUN' : 'LIVE MIGRATION'}`);
    console.log('Risk Level: LOW\n');

    // Get client-api domain files
    const files = await this.getClientApiFiles();
    console.log(`📁 Found ${files.length} client-api files`);

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

    console.log('\n✅ Client-api migration analysis complete');
  }

  private async getClientApiFiles(): Promise<string[]> {
    const patterns = [
      // Client API layer files
      'client/src/core/api.ts',
      'client/src/lib/api/**/*.{ts,tsx}',
      'client/src/services/**/*.{ts,tsx}'
    ];

    const files: string[] = [];
    for (const pattern of patterns) {
      const matches = await glob(pattern, { cwd: process.cwd() });
      files.push(...matches);
    }

    return [...new Set(files)]; // Remove duplicates
  }

  private async analyzeFiles(files: string[]): Promise<void> {
    console.log('🔍 Analyzing client API files...');

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

    // Client-api specific patterns
    const patterns = [
      // API parameter patterns (most common in client API layer)
      { regex: /\bid:\s*number\b/g, replacement: 'id: UserId', confidence: 0.8, type: 'id_definition' as const },
      { regex: /\buserId:\s*number\b/g, replacement: 'userId: UserId', confidence: 1.0, type: 'id_definition' as const },
      { regex: /\buser_id:\s*number\b/g, replacement: 'user_id: UserId', confidence: 1.0, type: 'id_definition' as const },
      { regex: /\bthreadId:\s*number\b/g, replacement: 'threadId: ThreadId', confidence: 1.0, type: 'id_definition' as const },
      { regex: /\bpostId:\s*number\b/g, replacement: 'postId: PostId', confidence: 1.0, type: 'id_definition' as const },
    ];

    lines.forEach((line, index) => {
      patterns.forEach(({ regex, replacement, confidence, type }) => {
        regex.lastIndex = 0; // Reset regex
        const matches = [...line.matchAll(regex)];
        
        matches.forEach(() => {
          // Skip lines with explicit comments saying "should be number"
          if (line.includes('should be number')) {
            return;
          }

          // Skip inventory item IDs (they're not user/thread/post IDs)
          if (filepath.includes('inventory') && line.includes('inventory item')) {
            return;
          }

          // Context-aware replacement for generic 'id: number'
          let finalReplacement = replacement;
          let finalConfidence = confidence;

          if (replacement === 'id: UserId') {
            if (line.includes('thread') || line.includes('Thread')) {
              finalReplacement = 'id: ThreadId';
              finalConfidence = 0.9;
            } else if (line.includes('post') || line.includes('Post')) {
              finalReplacement = 'id: PostId';
              finalConfidence = 0.9;
            } else if (line.includes('achievement') || line.includes('Achievement') || filepath.includes('achievements')) {
              finalReplacement = 'id: AchievementId';
              finalConfidence = 0.9;
            } else if (line.includes('user') || line.includes('User') || line.includes('recipients')) {
              finalReplacement = 'id: UserId';
              finalConfidence = 0.9;
            } else {
              // Generic API parameter - needs manual review
              finalConfidence = 0.7;
            }
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

  private async identifyManualReviewItems(files: string[]): Promise<void> {
    console.log('⚠️ Identifying items requiring manual review...');

    for (const file of files) {
      try {
        const content = readFileSync(file, 'utf-8');
        const changes = this.findNumericIdPatterns(content, file);
        
        // Items with lower confidence need manual review
        const manualReviewItems = changes.filter(c => c.confidence < 0.9);
        
        if (manualReviewItems.length > 0) {
          console.log(`  📋 ${file}: ${manualReviewItems.length} items need manual review`);
          manualReviewItems.forEach(item => {
            console.log(`    - Line ${item.line}: ${item.original} (confidence: ${item.confidence})`);
          });
        }
      } catch (error) {
        console.error(`❌ Error reviewing ${file}:`, error);
      }
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

  const migration = new ClientApiMigration(isDryRun);
  await migration.migrate();
}

// ESM entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ClientApiMigration };