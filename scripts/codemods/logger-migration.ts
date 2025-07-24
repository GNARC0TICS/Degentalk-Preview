/**
 * TS-Morph Codemod: Logger Migration (Phase 5 - Stream A)
 * 
 * Migrates from old logger system to canonical pino logger.
 * Follows Agent Rule A-2: Add new import AND remove all old logger imports.
 * 
 * Transformations:
 * - logger.error(err) → logger.error({ err }, 'error occurred')
 * - logger.info(msg) → logger.info('general', msg)
 * - Add: import { logger } from '@app/core/logger'
 * - Remove: all old logger imports
 * 
 * Usage:
 * - pnpm tsx scripts/codemods/logger-migration.ts
 * - pnpm tsx scripts/codemods/logger-migration.ts --dry-run
 */

import { Project, SyntaxKind, CallExpression, PropertyAccessExpression, SourceFile } from 'ts-morph';
import { globSync } from 'glob';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

interface TransformResult {
  transformCount: number;
  transformedFiles: string[];
  errors: Array<{ file: string; error: string }>;
  summary: string;
}

export async function loggerMigrationCodemod(dryRun = false): Promise<TransformResult> {
  console.log(`🚀 Starting logger migration codemod ${dryRun ? '(DRY RUN)' : ''}`);
  
  const project = new Project({
    tsConfigFilePath: path.join(projectRoot, 'tsconfig.json'),
  });
  
  // Focus on server files where logger is used
  const filePaths = globSync('server/**/*.{ts,tsx}', {
    cwd: projectRoot,
    ignore: [
      'node_modules/**',
      '**/*.test.ts',
      '**/*.spec.ts',
      'server/src/core/logger.ts', // Skip the logger file itself
      '**/*.d.ts'
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
      let needsNewLoggerImport = false;

      // Step 1: Transform logger calls
      sourceFile.forEachDescendant(node => {
        if (node.getKind() === SyntaxKind.CallExpression) {
          const callExpr = node as CallExpression;
          const expression = callExpr.getExpression();
          
          if (expression.getKind() === SyntaxKind.PropertyAccessExpression) {
            const propAccess = expression as PropertyAccessExpression;
            const object = propAccess.getExpression().getText().trim();
            const property = propAccess.getName();
            
            if (object === 'logger' && ['info', 'debug', 'warn', 'error'].includes(property)) {
              needsNewLoggerImport = true;
              
              const args = callExpr.getArguments();
              
              if (property === 'error' && args.length === 1) {
                // Transform: logger.error(err) → logger.error({ err }, 'error occurred')
                const arg = args[0].getText();
                callExpr.replaceWithText(`logger.error({ err: ${arg} }, 'error occurred')`);
              } else if (args.length === 1) {
                // Transform: logger.info(msg) → logger.info('general', msg)
                const arg = args[0].getText();
                callExpr.replaceWithText(`logger.${property}('general', ${arg})`);
              } else if (args.length === 2) {
                // Already in correct format: logger.info('namespace', 'message')
                // No transformation needed
              }
              
              transformCount++;
              fileModified = true;
            }
          }
        }
      });

      // Step 2: Remove old logger imports (Agent Rule A-2)
      const oldLoggerImports = sourceFile.getImportDeclarations().filter(imp => {
        const moduleSpecifier = imp.getModuleSpecifierValue();
        return moduleSpecifier.includes('logger') && 
               !moduleSpecifier.includes('@/core/logger') &&
               !moduleSpecifier.includes('./core/logger');
      });

      if (oldLoggerImports.length > 0) {
        oldLoggerImports.forEach(imp => imp.remove());
        fileModified = true;
      }

      // Step 3: Add new logger import if needed
      if (needsNewLoggerImport) {
        const existingNewImport = sourceFile.getImportDeclaration(imp => 
          imp.getModuleSpecifierValue().includes('@/core/logger') ||
          imp.getModuleSpecifierValue().includes('./core/logger')
        );
        
        if (!existingNewImport) {
          // Generate relative import path to core/logger
          const relativePath = generateRelativeLoggerImport(relPath);
          
          sourceFile.addImportDeclaration({
            moduleSpecifier: relativePath,
            namedImports: ['logger']
          });
          fileModified = true;
        }
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

  // Step 4: Run ESLint auto-fix to clean up imports (Agent Rule A-3)
  if (!dryRun && transformedFiles.length > 0) {
    console.log('🔧 Running ESLint auto-fix to clean up imports...');
    try {
      execSync('pnpm eslint --fix server/src/', { stdio: 'inherit' });
    } catch (error) {
      console.warn('⚠️  ESLint auto-fix failed:', error);
    }
  }

  const result: TransformResult = {
    transformCount,
    transformedFiles,
    errors,
    summary: `${dryRun ? '[DRY RUN] ' : ''}Transformed ${transformCount} logger calls in ${transformedFiles.length} files`
  };

  if (errors.length > 0) {
    console.log(`⚠️  Errors encountered in ${errors.length} files:`);
    errors.forEach(e => console.log(`  ${e.file}: ${e.error}`));
  }

  return result;
}

// Helper to generate relative path to logger
function generateRelativeLoggerImport(filePath: string): string {
  const from = path.dirname(path.join(projectRoot, filePath));
  const to = path.join(projectRoot, 'server/src/core/logger');
  const relativePath = path.relative(from, to).replace(/\\/g, '/');
  return relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
}

// CLI entry point (ES module compatible)
if (import.meta.url === `file://${process.argv[1]}`) {
  const dryRun = process.argv.includes('--dry-run') || process.argv.includes('--dry');
  
  loggerMigrationCodemod(dryRun).then(result => {
    console.log('\n' + result.summary);
    
    if (dryRun && result.transformedFiles.length > 0) {
      console.log('\n📝 Files that would be modified:');
      result.transformedFiles.forEach(f => console.log(`  - ${f}`));
    }
    
    if (!dryRun && result.transformCount > 0) {
      console.log('\n✅ Logger migration complete!');
      console.log('💡 Next steps:');
      console.log('  1. Run `pnpm typecheck` to verify imports');
      console.log('  2. Test logger functionality in affected files');
      console.log('  3. Commit: `git add . && git commit -m "[Stream A] Migrate to canonical pino logger"`');
    }
    
    if (result.errors.length > 0) {
      console.log('\n❌ Some files had errors and were skipped');
      process.exit(1);
    }
  }).catch(error => {
    console.error('❌ Logger migration failed:', error);
    process.exit(1);
  });
}