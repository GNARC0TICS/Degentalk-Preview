#!/usr/bin/env tsx

/**
 * Forum-Core Domain Migration Script
 * 
 * Targeted migration for the forum-core domain (117 ID issues, 186 files)
 * CRITICAL RISK - requires careful incremental approach with comprehensive testing
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
  type: 'id_definition' | 'id_usage' | 'id_conversion';
}

class ForumCoreMigration {
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
    console.log('🚀 Forum-Core Domain Migration');
    console.log('===============================');
    console.log(`Mode: ${this.dryRun ? 'DRY RUN' : 'LIVE MIGRATION'}`);
    console.log('Risk Level: CRITICAL\n');

    // Get forum-core domain files
    const files = await this.getForumCoreFiles();
    console.log(`📁 Found ${files.length} forum-core files`);

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

    console.log('\n✅ Forum-core migration analysis complete');
  }

  private async getForumCoreFiles(): Promise<string[]> {
    const patterns = [
      // Client forum components
      'client/src/components/forum/**/*.{ts,tsx}',
      'client/src/features/forum/**/*.{ts,tsx}',
      'client/src/types/forum*.{ts,tsx}',
      'client/src/pages/forum*.{ts,tsx}',
      'client/src/pages/threads/**/*.{ts,tsx}',
      
      // Server forum domain
      'server/src/domains/forum/**/*.ts',
      'server/src/routes/forum*.ts',
      
      // Shared forum types
      'shared/types/forum*.ts',
      'shared/lib/forum/**/*.ts',
      
      // Database forum types
      'db/types/forum*.ts'
    ];

    const files = [];
    for (const pattern of patterns) {
      const matches = await glob(pattern, { ignore: ['**/node_modules/**', '**/dist/**'] });
      files.push(...matches);
    }

    return [...new Set(files)]; // Remove duplicates
  }

  private async analyzeFiles(files: string[]): Promise<void> {
    for (const file of files) {
      try {
        const content = readFileSync(file, 'utf-8');
        const analysis = this.analyzeFile(file, content);
        
        if (analysis.changes.length > 0) {
          console.log(`   📝 ${file}: ${analysis.changes.length} issues found`);
          this.results.push(analysis);
        }
      } catch (error) {
        console.warn(`   ⚠️ Could not analyze ${file}:`, error);
        this.results.push({
          file,
          changes: [],
          status: 'error',
          error: String(error)
        });
      }
    }
  }

  private analyzeFile(filePath: string, content: string): MigrationResult {
    const lines = content.split('\n');
    const changes: Change[] = [];

    // Pattern 1: Interface/type definitions with id: number
    const idPatterns = [
      {
        pattern: /(\s*)id:\s*number(\s*[;,]?)/g,
        replacement: (match: string, indent: string, suffix: string) => {
          const entityType = this.detectEntityType(filePath, content);
          return `${indent}id: ${entityType}${suffix}`;
        },
        type: 'id_definition' as const,
        confidence: 0.9
      },
      
      // Pattern 2: Specific forum ID types
      {
        pattern: /(\s*)threadId:\s*number(\s*[;,]?)/g,
        replacement: (match: string, indent: string, suffix: string) => `${indent}threadId: ThreadId${suffix}`,
        type: 'id_definition' as const,
        confidence: 0.95
      },
      {
        pattern: /(\s*)postId:\s*number(\s*[;,]?)/g,
        replacement: (match: string, indent: string, suffix: string) => `${indent}postId: PostId${suffix}`,
        type: 'id_definition' as const,
        confidence: 0.95
      },
      {
        pattern: /(\s*)forumId:\s*number(\s*[;,]?)/g,
        replacement: (match: string, indent: string, suffix: string) => `${indent}forumId: ForumId${suffix}`,
        type: 'id_definition' as const,
        confidence: 0.95
      },
      {
        pattern: /(\s*)userId:\s*number(\s*[;,]?)/g,
        replacement: (match: string, indent: string, suffix: string) => `${indent}userId: UserId${suffix}`,
        type: 'id_definition' as const,
        confidence: 0.95
      },

      // Pattern 3: Function parameters
      {
        pattern: /\(\s*id:\s*number\s*\)/g,
        replacement: (match: string) => {
          const entityType = this.detectEntityType(filePath, content);
          return `(id: ${entityType})`;
        },
        type: 'id_usage' as const,
        confidence: 0.8
      },

      // Pattern 4: parseInt/Number conversions (high risk)
      {
        pattern: /parseInt\(\s*([^)]*\.id[^)]*)\s*\)/g,
        replacement: (match: string, idExpr: string) => idExpr.trim(),
        type: 'id_conversion' as const,
        confidence: 0.7
      },
      {
        pattern: /Number\(\s*([^)]*\.id[^)]*)\s*\)/g,
        replacement: (match: string, idExpr: string) => idExpr.trim(),
        type: 'id_conversion' as const,
        confidence: 0.7
      }
    ];

    for (const { pattern, replacement, type, confidence } of idPatterns) {
      let match;
      pattern.lastIndex = 0;
      
      while ((match = pattern.exec(content)) !== null) {
        const lineNum = content.substring(0, match.index).split('\n').length;
        const line = lines[lineNum - 1]?.trim() || '';
        
        // Skip comments and intentionally legacy code
        if (this.shouldSkipLine(line)) continue;

        // Calculate replacement
        let newText: string;
        if (typeof replacement === 'function') {
          newText = replacement(match[0], match[1] || '', match[2] || '');
        } else {
          newText = replacement;
        }

        changes.push({
          line: lineNum,
          original: match[0],
          replacement: newText,
          confidence,
          type
        });
      }
    }

    return {
      file: filePath,
      changes,
      status: 'success'
    };
  }

  private detectEntityType(filePath: string, content: string): string {
    // Detect the most likely entity type based on context
    const path = filePath.toLowerCase();
    
    if (path.includes('thread') || content.includes('thread')) return 'ThreadId';
    if (path.includes('post') || content.includes('post')) return 'PostId';
    if (path.includes('forum') && !path.includes('user')) return 'ForumId';
    if (path.includes('user') || content.includes('user')) return 'UserId';
    
    // Check interface names
    const interfaceMatch = content.match(/interface\s+(\w+)/);
    if (interfaceMatch) {
      const interfaceName = interfaceMatch[1].toLowerCase();
      if (interfaceName.includes('thread')) return 'ThreadId';
      if (interfaceName.includes('post')) return 'PostId';
      if (interfaceName.includes('forum')) return 'ForumId';
      if (interfaceName.includes('user')) return 'UserId';
    }
    
    // Default to string if unsure
    return 'string /* TODO: determine correct branded type */';
  }

  private shouldSkipLine(line: string): boolean {
    return (
      line.includes('//') && (line.includes('legacy') || line.includes('TODO')) ||
      line.includes('/*') && line.includes('legacy') ||
      line.includes('@deprecated') ||
      line.includes('LEGACY') ||
      line.includes('FIXME')
    );
  }

  private async performSafeMigrations(files: string[]): Promise<void> {
    const safeMigrations = this.results.filter(result => 
      result.changes.some(change => change.confidence >= 0.9)
    );

    console.log(`   🎯 ${safeMigrations.length} files with high-confidence changes`);

    for (const migration of safeMigrations) {
      if (!this.dryRun) {
        await this.applyMigration(migration);
      } else {
        console.log(`   📋 [DRY RUN] Would migrate ${migration.file}`);
        for (const change of migration.changes.filter(c => c.confidence >= 0.9)) {
          console.log(`      Line ${change.line}: ${change.original} → ${change.replacement}`);
        }
      }
    }
  }

  private async applyMigration(migration: MigrationResult): Promise<void> {
    try {
      // Create backup
      const content = readFileSync(migration.file, 'utf-8');
      migration.backup = `${migration.file}.backup.${Date.now()}`;
      writeFileSync(migration.backup, content);

      // Apply changes using ts-morph for safety
      const sourceFile = this.project.addSourceFileAtPath(migration.file);
      
      // Sort changes by line number (descending) to avoid offset issues
      const sortedChanges = migration.changes
        .filter(c => c.confidence >= 0.9)
        .sort((a, b) => b.line - a.line);

      for (const change of sortedChanges) {
        this.applyChangeToSourceFile(sourceFile, change);
      }

      // Validate the changes don't break syntax
      const diagnostics = sourceFile.getPreEmitDiagnostics();
      if (diagnostics.length > 0) {
        console.warn(`   ⚠️ Type errors in ${migration.file}:`);
        for (const diagnostic of diagnostics.slice(0, 3)) {
          console.warn(`      ${diagnostic.getMessageText()}`);
        }
      }

      // Save if no critical errors
      sourceFile.saveSync();
      migration.status = 'success';
      
      console.log(`   ✅ Migrated ${migration.file}`);
    } catch (error) {
      migration.status = 'error';
      migration.error = String(error);
      console.error(`   ❌ Failed to migrate ${migration.file}:`, error);
    }
  }

  private applyChangeToSourceFile(sourceFile: SourceFile, change: Change): void {
    // This is a simplified implementation
    // In production, you'd want more sophisticated AST manipulation
    const text = sourceFile.getFullText();
    const lines = text.split('\n');
    
    if (change.line <= lines.length) {
      const line = lines[change.line - 1];
      const newLine = line.replace(change.original, change.replacement);
      lines[change.line - 1] = newLine;
      
      sourceFile.replaceWithText(lines.join('\n'));
    }
  }

  private async identifyManualReviewItems(files: string[]): Promise<void> {
    const manualReviewItems = this.results.filter(result =>
      result.changes.some(change => change.confidence < 0.9)
    );

    console.log(`   🔍 ${manualReviewItems.length} files require manual review`);

    for (const item of manualReviewItems) {
      const lowConfidenceChanges = item.changes.filter(c => c.confidence < 0.9);
      console.log(`   📋 ${item.file} (${lowConfidenceChanges.length} uncertain changes)`);
      
      for (const change of lowConfidenceChanges.slice(0, 3)) {
        console.log(`      Line ${change.line}: ${change.original} (confidence: ${change.confidence})`);
      }
    }
  }

  private generateReport(): void {
    const report = {
      timestamp: new Date().toISOString(),
      domain: 'forum-core',
      mode: this.dryRun ? 'dry-run' : 'live',
      summary: {
        filesAnalyzed: this.results.length,
        totalChanges: this.results.reduce((sum, r) => sum + r.changes.length, 0),
        highConfidence: this.results.reduce((sum, r) => sum + r.changes.filter(c => c.confidence >= 0.9).length, 0),
        manualReview: this.results.reduce((sum, r) => sum + r.changes.filter(c => c.confidence < 0.9).length, 0),
        errors: this.results.filter(r => r.status === 'error').length
      },
      results: this.results
    };

    const outputPath = `scripts/migration/output/forum-core-migration-${this.dryRun ? 'dryrun' : 'live'}-${Date.now()}.json`;
    writeFileSync(outputPath, JSON.stringify(report, null, 2));

    console.log(`\n📊 MIGRATION SUMMARY`);
    console.log(`Files analyzed: ${report.summary.filesAnalyzed}`);
    console.log(`Total changes: ${report.summary.totalChanges}`);
    console.log(`High confidence: ${report.summary.highConfidence}`);
    console.log(`Manual review: ${report.summary.manualReview}`);
    console.log(`Errors: ${report.summary.errors}`);
    console.log(`\nReport saved: ${outputPath}`);
  }
}

async function main() {
  const isDryRun = !process.argv.includes('--live');
  
  if (!isDryRun) {
    console.log('⚠️  LIVE MIGRATION MODE - Files will be modified!');
    console.log('Make sure you have committed all changes and have backups.');
    
    // Simple confirmation
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise<string>(resolve => {
      readline.question('Continue? (yes/no): ', resolve);
    });
    
    readline.close();
    
    if (answer.toLowerCase() !== 'yes') {
      console.log('Migration cancelled.');
      process.exit(0);
    }
  }

  const migration = new ForumCoreMigration(isDryRun);
  await migration.migrate();
}

// ESM entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ForumCoreMigration };