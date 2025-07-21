import { Project, SyntaxKind, CallExpression, PropertyAccessExpression, Node } from 'ts-morph';
import { globSync } from 'glob';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Codemod: console-to-logger
 * -------------------------
 * Converts console.log/info/debug/trace/warn/error to logger equivalents
 * 
 * Transforms:
 * Server-side:
 * - console.log("msg") → logger.info("msg")
 * - console.error("msg", err) → logger.error(LogAction.SYSTEM_ERROR, "msg", err)
 * 
 * Client-side:
 * - console.log("msg") → logger.info("Component", "msg")
 * - console.error("msg", err) → logger.error("Component", "msg", err)
 * 
 * Skips: test files, logger.ts files themselves, scripts/
 * 
 * Usage:
 * - pnpm codemod:console
 * - pnpm codemod:console --dry-run
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../../');

export async function consoleToLoggerCodemod(dryRun = false, includeShared = false) {
  console.log(`🚀 Starting console-to-logger codemod ${dryRun ? '(DRY RUN)' : ''}`);
  if (includeShared) {
    console.log('  Including shared files (experimental)');
  }
  
  const project = new Project({
    tsConfigFilePath: path.join(projectRoot, 'tsconfig.json'),
  });
  
  // Get both client and server files
  const clientFiles = globSync('client/src/**/*.{ts,tsx}', {
    cwd: projectRoot,
    ignore: [
      'node_modules/**',
      '**/*.test.ts',
      '**/*.spec.ts',
      'client/src/lib/logger.ts', // Skip client logger itself
      '**/*.d.ts'
    ]
  });
  
  const serverFiles = globSync('server/src/**/*.{ts,tsx}', {
    cwd: projectRoot,
    ignore: [
      'node_modules/**',
      '**/*.test.ts',
      '**/*.spec.ts',
      'server/src/core/logger.ts', // Skip server logger itself
      'server/utils/**', // Skip wallet CLI utilities
      '**/*.d.ts'
    ]
  });
  
  const sharedFiles = includeShared ? globSync('shared/**/*.ts', {
    cwd: projectRoot,
    ignore: [
      'node_modules/**',
      '**/*.test.ts',
      '**/*.spec.ts',
      '**/*.d.ts',
      'shared/types/ids.ts', // Skip security warnings in IDs
      '**/*.js' // Skip JS files
    ]
  }) : [];
  
  const filePaths = [...clientFiles, ...serverFiles, ...sharedFiles];

  let transformCount = 0;
  const transformedFiles: string[] = [];
  const errors: Array<{ file: string; error: string }> = [];

  for (const relPath of filePaths) {
    try {
      const fullPath = path.join(projectRoot, relPath);
      const sourceFile = project.addSourceFileAtPath(fullPath);
      let fileModified = false;
      let needsLoggerImport = false;
      const isClientFile = relPath.startsWith('client/');
      const isSharedFile = relPath.startsWith('shared/');
      
      // Derive component name from file path for client files
      const componentName = isClientFile ? deriveComponentName(relPath) : null;

      // Find all console calls
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
              
              // Get arguments
              const args = callExpr.getArguments();
              const argsText = args.map(arg => arg.getText());
              
              // Transform based on client vs server vs shared
              let newCall: string;
              if (isClientFile) {
                // Client: logger.method(component, message, context?)
                if (argsText.length === 0) {
                  newCall = `logger.${loggerMethod}('${componentName}', 'No message')`;
                } else if (argsText.length === 1) {
                  newCall = `logger.${loggerMethod}('${componentName}', ${argsText[0]})`;
                } else {
                  // Multiple args - first is message, rest as context
                  const [message, ...rest] = argsText;
                  if (rest.length === 1 && (property === 'error' || property === 'warn')) {
                    // Special case for console.error("msg", error)
                    newCall = `logger.${loggerMethod}('${componentName}', ${message}, ${rest[0]})`;
                  } else {
                    // Wrap multiple args in context object
                    newCall = `logger.${loggerMethod}('${componentName}', ${message}, { data: [${rest.join(', ')}] })`;
                  }
                }
              } else if (isSharedFile) {
                // Shared files: Keep console for now, just comment that it needs manual review
                console.warn(`⚠️  Shared file ${relPath} has console usage that needs manual review`);
                return; // Skip transformation for shared files
              } else {
                // Server: logger.method(LogAction?, message, data?)
                if (property === 'error' || property === 'warn') {
                  // For errors/warnings, add LogAction
                  if (argsText.length === 0) {
                    newCall = `logger.${loggerMethod}(LogAction.SYSTEM_ERROR, 'No message')`;
                  } else if (argsText.length === 1) {
                    newCall = `logger.${loggerMethod}(LogAction.SYSTEM_ERROR, ${argsText[0]})`;
                  } else {
                    newCall = `logger.${loggerMethod}(LogAction.SYSTEM_ERROR, ${argsText.join(', ')})`;
                  }
                } else {
                  // For info/debug, keep simple
                  newCall = `logger.${loggerMethod}(${argsText.join(', ')})`;
                }
              }
              
              // Replace the call
              callExpr.replaceWithText(newCall);
              transformCount++;
              fileModified = true;
            }
          }
        }
      });

      // Add logger import if needed and not already present
      if (needsLoggerImport) {
        const existingLoggerImport = sourceFile.getImportDeclaration(imp => {
          const specifier = imp.getModuleSpecifierValue();
          return isClientFile 
            ? specifier === '@/lib/logger' || specifier.endsWith('/logger')
            : specifier.includes('logger');
        });
        
        if (!existingLoggerImport) {
          if (isClientFile) {
            // Client imports from @/lib/logger
            sourceFile.addImportDeclaration({
              moduleSpecifier: '@/lib/logger',
              namedImports: ['logger']
            });
          } else {
            // Server imports from relative path
            const relativePath = generateRelativeLoggerImport(relPath);
            
            // Check if we need LogAction import for server files
            const needsLogAction = sourceFile.getText().includes('LogAction.');
            
            sourceFile.addImportDeclaration({
              moduleSpecifier: relativePath,
              namedImports: needsLogAction ? ['logger', 'LogAction'] : ['logger']
            });
          }
        } else if (!isClientFile) {
          // Check if existing import needs LogAction added
          const needsLogAction = sourceFile.getText().includes('LogAction.');
          if (needsLogAction) {
            const namedImports = existingLoggerImport.getNamedImports();
            const hasLogAction = namedImports.some(imp => imp.getName() === 'LogAction');
            
            if (!hasLogAction) {
              existingLoggerImport.addNamedImport('LogAction');
            }
          }
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
  const clientFileList = transformedFiles.filter(f => f.startsWith('client/'));
  const serverFileList = transformedFiles.filter(f => f.startsWith('server/'));
  
  const result = {
    transformCount,
    transformedFiles,
    clientFileCount: clientFileList.length,
    serverFileCount: serverFileList.length,
    errors,
    summary: `${dryRun ? '[DRY RUN] ' : ''}Transformed ${transformCount} console calls in ${transformedFiles.length} files (${clientFileList.length} client, ${serverFileList.length} server)`
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

// Helper to derive component name from file path
function deriveComponentName(filePath: string): string {
  // Extract component name from file path
  // client/src/components/forum/ThreadList.tsx → ThreadList
  // client/src/pages/admin/ui-config.tsx → UIConfig
  // client/src/hooks/use-admin-modules.ts → useAdminModules
  
  const basename = path.basename(filePath, path.extname(filePath));
  
  // Handle special cases
  if (basename.startsWith('use-')) {
    // Convert kebab-case hooks to camelCase
    return basename.split('-').map((part, i) => 
      i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
    ).join('');
  }
  
  if (basename.includes('-')) {
    // Convert kebab-case to PascalCase
    return basename.split('-').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join('');
  }
  
  // Default: use basename with first letter capitalized
  return basename.charAt(0).toUpperCase() + basename.slice(1);
}

// ESM entry point - check if this file is being run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  const dryRun = process.argv.includes('--dry-run') || process.argv.includes('--dry');
  const includeShared = process.argv.includes('--include-shared');
  
  consoleToLoggerCodemod(dryRun, includeShared).then(result => {
    console.log('\n' + result.summary);
    
    if (dryRun && result.transformedFiles.length > 0) {
      console.log('\n📝 Files that would be modified:');
      if (result.clientFileCount > 0) {
        console.log('\n  Client files:');
        result.transformedFiles.filter(f => f.startsWith('client/')).forEach(f => console.log(`    - ${f}`));
      }
      if (result.serverFileCount > 0) {
        console.log('\n  Server files:');
        result.transformedFiles.filter(f => f.startsWith('server/')).forEach(f => console.log(`    - ${f}`));
      }
    }
    
    if (!dryRun && result.transformCount > 0) {
      console.log('\n✅ Console-to-logger transformation complete!');
      console.log(`   📱 Client: ${result.clientFileCount} files updated`);
      console.log(`   🖥️  Server: ${result.serverFileCount} files updated`);
      console.log('\n💡 Next steps:');
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