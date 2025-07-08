#!/usr/bin/env tsx

/**
 * Emergency codemod to eliminate ALL remaining res.json() calls
 * Replaces them with standardized response helpers
 */

import { Project, SyntaxKind, CallExpression, PropertyAccessExpression } from 'ts-morph';
import { globSync } from 'glob';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../../');

export async function eliminateResJsonCalls(dryRun = false) {
  console.log(`🚀 Eliminating ALL res.json() calls ${dryRun ? '(DRY RUN)' : ''}`);
  
  const project = new Project({
    tsConfigFilePath: path.join(projectRoot, 'tsconfig.json'),
  });
  
  // Target all server domain files
  const filePaths = globSync('server/src/domains/**/*.{ts,tsx}', {
    cwd: projectRoot,
    ignore: [
      '**/*.test.ts',
      '**/*.spec.ts',
      '**/transformers/**/*.ts', // Skip transformer files
      'server/src/core/**' // Skip core utilities
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
      let addedImports = false;

      // Find all res.json() calls
      sourceFile.forEachDescendant(node => {
        if (node.getKind() === SyntaxKind.CallExpression) {
          const callExpr = node as CallExpression;
          const expression = callExpr.getExpression();
          
          if (expression.getKind() === SyntaxKind.PropertyAccessExpression) {
            const propAccess = expression as PropertyAccessExpression;
            const object = propAccess.getExpression().getText().trim();
            const method = propAccess.getName();
            
            if (object === 'res' && method === 'json') {
              // Add imports if not already added
              if (!addedImports) {
                const existingImport = sourceFile.getImportDeclaration(i => 
                  i.getModuleSpecifierValue() === '@server/src/core/utils/transformer.helpers'
                );
                
                if (!existingImport) {
                  sourceFile.addImportDeclaration({
                    moduleSpecifier: '@server/src/core/utils/transformer.helpers',
                    namedImports: ['sendSuccessResponse', 'sendErrorResponse']
                  });
                }
                addedImports = true;
              }

              // Get the full statement to understand context
              const statement = node.getFirstAncestorByKind(SyntaxKind.ExpressionStatement) ||
                               node.getFirstAncestorByKind(SyntaxKind.ReturnStatement);
              
              if (statement) {
                const args = callExpr.getArguments();
                if (args.length === 1) {
                  const arg = args[0].getText();
                  
                  // Check if this is an error response
                  const parentText = statement.getText();
                  const isErrorResponse = parentText.includes('.status(') && 
                                        (parentText.includes('400') || parentText.includes('404') || 
                                         parentText.includes('500') || parentText.includes('error'));
                  
                  if (isErrorResponse) {
                    // Extract status code if present
                    const statusMatch = parentText.match(/\.status\((\d+)\)/);
                    const statusCode = statusMatch ? statusMatch[1] : '500';
                    
                    // Extract error message
                    let errorMessage = 'Server error';
                    if (arg.includes('error:') || arg.includes('message:')) {
                      // Try to extract the actual error message
                      const messageMatch = arg.match(/(error|message):\s*['"`]([^'"`]+)['"`]/);
                      if (messageMatch) {
                        errorMessage = messageMatch[2];
                      }
                    }
                    
                    // Replace with sendErrorResponse
                    const replacement = `sendErrorResponse(res, '${errorMessage}', ${statusCode});`;
                    statement.replaceWithText(replacement);
                  } else {
                    // Success response
                    const replacement = `sendSuccessResponse(res, ${arg});`;
                    statement.replaceWithText(replacement);
                  }
                  
                  transformCount++;
                  fileModified = true;
                }
              }
            }
          }
        }
      });

      if (fileModified && !dryRun) {
        await sourceFile.save();
        transformedFiles.push(relPath);
      }
      
      if (fileModified) {
        console.log(`   ✅ Fixed ${relPath}`);
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${relPath}:`, error);
      errors.push({ file: relPath, error: error.message });
    }
  }

  console.log(`\n📊 Results:`);
  console.log(`   Transformations: ${transformCount}`);
  console.log(`   Files modified: ${transformedFiles.length}`);
  console.log(`   Errors: ${errors.length}`);

  if (errors.length > 0) {
    console.log(`\n❌ Errors:`);
    errors.forEach(err => console.log(`   ${err.file}: ${err.error}`));
  }

  return {
    transformCount,
    transformedFiles,
    errors
  };
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const dryRun = process.argv.includes('--dry-run');
  
  eliminateResJsonCalls(dryRun).catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}