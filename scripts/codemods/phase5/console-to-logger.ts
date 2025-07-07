import { Project, SyntaxKind, CallExpression, PropertyAccessExpression } from 'ts-morph';
import { globSync } from 'glob';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Codemod: console-to-logger
 * -------------------------
 * Converts console.log/info/debug/trace to logger equivalents
 * 
 * Transforms:
 * - console.log("msg") → logger.info("msg")
 * - console.info("msg") → logger.info("msg") 
 * - console.debug("msg") → logger.debug("msg")
 * - console.trace("msg") → logger.debug("msg")
 * 
 * Skips: test files, core/logger.ts, scripts/, client/
 * 
 * Usage:
 * - pnpm codemod:console
 * - pnpm codemod:console --dry-run
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../../');

export async function consoleToLoggerCodemod(dryRun = false) {
  console.log(`🚀 Starting console-to-logger codemod ${dryRun ? '(DRY RUN)' : ''}`);
  
  const project = new Project({
    tsConfigFilePath: path.join(projectRoot, 'tsconfig.json'),
  });
  
  const filePaths = globSync('**/*.{ts,tsx}', {
    cwd: projectRoot,
    ignore: [
      'node_modules/**',
      '**/*.test.ts',
      '**/*.spec.ts', 
      'scripts/**',
      'client/**',
      'tests/**',
      'e2e/**',
      'shared/**',
      'server/src/core/logger.ts',
      'server/utils/**', // Skip wallet CLI utilities
      'archive/**',
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
      let needsLoggerImport = false;

      // Find all console.log, console.info, console.debug, console.trace calls
      sourceFile.forEachDescendant(node => {
        if (node.getKind() === SyntaxKind.CallExpression) {
          const callExpr = node as CallExpression;
          const expression = callExpr.getExpression();
          
          if (expression.getKind() === SyntaxKind.PropertyAccessExpression) {
            const propAccess = expression as PropertyAccessExpression;
            const object = propAccess.getExpression().getText().trim();
            const property = propAccess.getName();
            
            if (object === 'console' && ['log', 'info', 'debug', 'trace', 'warn', 'error'].includes(property)) {
              needsLoggerImport = true;
              
              // Map console methods → logger methods
              const loggerMethod = property === 'log'   ? 'info'  :
                                  property === 'trace' ? 'debug' :
                                  property; // 'info', 'debug', 'warn', 'error' remain unchanged
              
              // Get arguments and preserve them
              const args = callExpr.getArguments().map(arg => arg.getText()).join(', ');
              
              // Replace the call
              callExpr.replaceWithText(`logger.${loggerMethod}(${args})`);
              transformCount++;
              fileModified = true;
            }
          }
        }
      });

      // Add logger import if needed and not already present
      if (needsLoggerImport) {
        const existingImport = sourceFile.getImportDeclaration(imp => 
          imp.getModuleSpecifierValue().includes('logger')
        );
        
        if (!existingImport) {
          // Generate relative import path to core/logger
          const relativePath = generateRelativeLoggerImport(relPath);
          
          sourceFile.addImportDeclaration({
            moduleSpecifier: relativePath,
            namedImports: ['logger']
          });
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

  // Results summary
  const result = {
    transformCount,
    transformedFiles,
    errors,
    summary: `${dryRun ? '[DRY RUN] ' : ''}Transformed ${transformCount} console calls in ${transformedFiles.length} files`
  };

  if (errors.length > 0) {
    console.log(`⚠️  Errors encountered in ${errors.length} files:`);
    errors.forEach(e => console.log(`  ${e.file}: ${e.error}`));
  }

  return result;
}

// Helper to generate relative path to logger
function generateRelativeLoggerImport(filePath: string): string {
  // Use ts-morph independent path helper to ensure accuracy across OSes
  const from = path.dirname(path.join(projectRoot, filePath));
  const to   = path.join(projectRoot, 'server/src/core/logger');
  return path.relative(from, to).replace(/\\/g, '/').replace(/\.ts$/, '') || './logger';
}

// ESM-safe CLI entry point check
// In ESM mode `require` is undefined, so protect with typeof guard
if (typeof require !== 'undefined' && require.main === module) {
  const dryRun = process.argv.includes('--dry-run') || process.argv.includes('--dry');
  
  consoleToLoggerCodemod(dryRun).then(result => {
    console.log('\n' + result.summary);
    
    if (dryRun && result.transformedFiles.length > 0) {
      console.log('\n📝 Files that would be modified:');
      result.transformedFiles.forEach(f => console.log(`  - ${f}`));
    }
    
    if (!dryRun && result.transformCount > 0) {
      console.log('\n✅ Console-to-logger transformation complete!');
      console.log('💡 Next steps:');
      console.log('  1. Run `pnpm typecheck` to verify imports');
      console.log('  2. Test that logger is working in affected files');
      console.log('  3. Commit changes: `git add . && git commit -m "refactor: convert console to logger"`');
    }
    
    if (result.errors.length > 0) {
      console.log('\n❌ Some files had errors and were skipped');
      process.exit(1);
    }
  }).catch(error => {
    console.error('❌ Codemod failed:', error);
    process.exit(1);
  });
}