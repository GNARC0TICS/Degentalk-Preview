#!/usr/bin/env tsx

/**
 * Import Validation Script
 * 
 * Validates all TypeScript imports in the codebase, checking:
 * - Path alias resolution (@/, @server/, @shared/, etc.)
 * - File existence for imports
 * - Module boundary enforcement
 * - Banned import patterns
 */

import * as path from 'path';
import * as fs from 'fs';
import { glob } from 'glob';
import chalk from 'chalk';

interface ImportIssue {
  file: string;
  line: number;
  importPath: string;
  issue: string;
  severity: 'error' | 'warning';
}

interface ValidationOptions {
  fix: boolean;
  verbose: boolean;
}

class ImportValidator {
  private issues: ImportIssue[] = [];
  private projectRoot: string;
  private pathMappings: Map<string, string> = new Map();

  constructor() {
    this.projectRoot = path.resolve(process.cwd());
    this.setupPathMappings();
  }

  private setupPathMappings() {
    // Based on tsconfig.json path mappings
    this.pathMappings.set('@/', path.join(this.projectRoot, 'client/src/'));
    this.pathMappings.set('@server/', path.join(this.projectRoot, 'server/'));
    this.pathMappings.set('@shared/', path.join(this.projectRoot, 'shared/'));
    this.pathMappings.set('@db/', path.join(this.projectRoot, 'db/'));
    this.pathMappings.set('@scripts/', path.join(this.projectRoot, 'scripts/'));
    this.pathMappings.set('@db', path.join(this.projectRoot, 'db/'));
    this.pathMappings.set('@core/', path.join(this.projectRoot, 'server/src/core/'));
  }

  private resolveImportPath(importPath: string, fromFile: string): string | null {
    // Handle relative imports
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      return path.resolve(path.dirname(fromFile), importPath);
    }

    // Handle path alias imports
    for (const [alias, basePath] of Array.from(this.pathMappings.entries())) {
      if (importPath.startsWith(alias)) {
        const relativePath = importPath.slice(alias.length);
        return path.join(basePath, relativePath);
      }
    }

    // Node modules - don't validate
    if (!importPath.startsWith('.') && !importPath.includes('/')) {
      return null;
    }

    return null;
  }

  private checkFileExists(filePath: string): boolean {
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.d.ts'];
    
    // Check exact path
    if (fs.existsSync(filePath)) return true;

    // Check with extensions
    for (const ext of extensions) {
      if (fs.existsSync(filePath + ext)) return true;
    }

    // Check index files
    for (const ext of extensions) {
      if (fs.existsSync(path.join(filePath, 'index' + ext))) return true;
    }

    return false;
  }

  private validateModuleBoundaries(importPath: string, fromFile: string): string | null {
    const fromContext = this.getFileContext(fromFile);
    const toContext = this.getFileContextFromImport(importPath);

    // Boundary rules
    const violations: { [key: string]: string[] } = {
      'client': ['server'],
      'server': ['client'],
    };

    if (violations[fromContext]?.includes(toContext)) {
      return `Cross-boundary import: ${fromContext} → ${toContext}`;
    }

    return null;
  }

  private getFileContext(filePath: string): string {
    if (filePath.includes('/client/')) return 'client';
    if (filePath.includes('/server/')) return 'server';
    if (filePath.includes('/shared/')) return 'shared';
    if (filePath.includes('/db/')) return 'db';
    if (filePath.includes('/scripts/')) return 'scripts';
    return 'unknown';
  }

  private getFileContextFromImport(importPath: string): string {
    if (importPath.startsWith('@/')) return 'client';
    if (importPath.startsWith('@server/')) return 'server';
    if (importPath.startsWith('@shared/')) return 'shared';
    if (importPath.startsWith('@db/')) return 'db';
    if (importPath.startsWith('@scripts/')) return 'scripts';
    return 'unknown';
  }

  private checkBannedImports(importPath: string, filePath: string): string | null {
    const context = this.getFileContext(filePath);
    
    // Check for banned patterns based on context
    if (context === 'client') {
      if (importPath.startsWith('@app/')) {
        return 'Deprecated @app/ import - use @/ instead';
      }
      if (importPath.startsWith('@api/')) {
        return 'Deprecated @api/ import - use @/ instead';
      }
    }
    
    if (context === 'server') {
      if (importPath.startsWith('@api/')) {
        return 'Deprecated @api/ import - use @/ instead';
      }
      if (importPath.startsWith('@server-core/')) {
        return 'Deprecated @server-core/ import - use @core/ instead';
      }
    }
    
    return null;
  }

  private extractImports(fileContent: string): Array<{ line: number; importPath: string }> {
    const imports: Array<{ line: number; importPath: string }> = [];
    const lines = fileContent.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Match import statements
      const importMatch = line.match(/^\s*import\s+.*?from\s+['"`]([^'"`]+)['"`]/);
      if (importMatch) {
        imports.push({ line: i + 1, importPath: importMatch[1] });
        continue;
      }

      // Match dynamic imports
      const dynamicMatch = line.match(/import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/);
      if (dynamicMatch) {
        imports.push({ line: i + 1, importPath: dynamicMatch[1] });
        continue;
      }

      // Match require statements
      const requireMatch = line.match(/require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/);
      if (requireMatch) {
        imports.push({ line: i + 1, importPath: requireMatch[1] });
      }
    }

    return imports;
  }

  private validateFile(filePath: string): void {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const imports = this.extractImports(content);

      for (const { line, importPath } of imports) {
        // Skip node_modules
        if (!importPath.startsWith('.') && !importPath.includes('@')) continue;

        // Check for banned imports
        const bannedImport = this.checkBannedImports(importPath, filePath);
        if (bannedImport) {
          this.issues.push({
            file: path.relative(this.projectRoot, filePath),
            line,
            importPath,
            issue: bannedImport,
            severity: 'error'
          });
        }

        const resolvedPath = this.resolveImportPath(importPath, filePath);
        
        if (resolvedPath) {
          // Check if file exists
          if (!this.checkFileExists(resolvedPath)) {
            this.issues.push({
              file: path.relative(this.projectRoot, filePath),
              line,
              importPath,
              issue: `File not found: ${path.relative(this.projectRoot, resolvedPath)}`,
              severity: 'error'
            });
          }
        }

        // Check module boundaries
        const boundaryViolation = this.validateModuleBoundaries(importPath, filePath);
        if (boundaryViolation) {
          this.issues.push({
            file: path.relative(this.projectRoot, filePath),
            line,
            importPath,
            issue: boundaryViolation,
            severity: 'error'
          });
        }
      }
    } catch (error) {
      this.issues.push({
        file: path.relative(this.projectRoot, filePath),
        line: 0,
        importPath: '',
        issue: `Failed to read file: ${error}`,
        severity: 'error'
      });
    }
  }

  async validate(options: ValidationOptions = { fix: false, verbose: false }): Promise<boolean> {
    console.log(chalk.blue('🔍 Validating imports...'));

    // Find all TypeScript files
    const tsFiles = await glob('**/*.{ts,tsx}', {
      cwd: this.projectRoot,
      ignore: [
        'node_modules/**',
        'dist/**',
        'build/**',
        '.next/**',
        'coverage/**',
        '**/*.d.ts'
      ],
      absolute: true
    });

    console.log(chalk.gray(`Found ${tsFiles.length} TypeScript files`));

    for (const file of tsFiles) {
      this.validateFile(file);
    }

    // Report results
    if (this.issues.length === 0) {
      console.log(chalk.green('✅ All imports are valid!'));
      return true;
    }

    console.log(chalk.red(`\n❌ Found ${this.issues.length} import issues:\n`));

    const errors = this.issues.filter(i => i.severity === 'error');
    const warnings = this.issues.filter(i => i.severity === 'warning');

    if (errors.length > 0) {
      console.log(chalk.red(`Errors (${errors.length}):`));
      for (const issue of errors) {
        console.log(chalk.red(`  ${issue.file}:${issue.line} - ${issue.importPath}`));
        console.log(chalk.red(`    ${issue.issue}`));
      }
    }

    if (warnings.length > 0) {
      console.log(chalk.yellow(`\nWarnings (${warnings.length}):`));
      for (const issue of warnings) {
        console.log(chalk.yellow(`  ${issue.file}:${issue.line} - ${issue.importPath}`));
        console.log(chalk.yellow(`    ${issue.issue}`));
      }
    }

    return errors.length === 0;
  }
}

async function main() {
  const validator = new ImportValidator();
  const args = process.argv.slice(2);
  
  const options: ValidationOptions = {
    fix: args.includes('--fix'),
    verbose: args.includes('--verbose')
  };

  const success = await validator.validate(options);
  process.exit(success ? 0 : 1);
}

// ESM compatibility check
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}