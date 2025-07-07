import { Project, SyntaxKind, PropertyAccessExpression, VariableDeclaration, ObjectBindingPattern } from 'ts-morph';
import { globSync } from 'glob';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Codemod: req-user-removal
 * -------------------------
 * Replaces direct req.user access with getAuthenticatedUser(req) helper
 * 
 * Transforms:
 * - req.user → getAuthenticatedUser(req)
 * - const { user } = req → const user = getAuthenticatedUser(req)
 * - const user = req.user → const user = getAuthenticatedUser(req)
 * 
 * Creates helper file if it doesn't exist: @server/src/core/utils/auth.helpers.ts
 * 
 * Usage:
 * - pnpm codemod:req-user  
 * - pnpm codemod:req-user --dry-run
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../../');

export async function reqUserRemovalCodemod(dryRun = false) {
  console.log(`🚀 Starting req.user removal codemod ${dryRun ? '(DRY RUN)' : ''}`);
  
  const project = new Project({
    tsConfigFilePath: path.join(projectRoot, 'tsconfig.json'),
  });
  
  // Focus on server-side files only
  const filePaths = globSync('server/**/*.{ts,tsx}', {
    cwd: projectRoot,
    ignore: [
      '**/*.test.ts',
      '**/*.spec.ts',
      'server/src/core/utils/auth.helpers.ts' // Skip the helper file itself
    ]
  });

  let transformCount = 0;
  const transformedFiles: string[] = [];
  const errors: Array<{ file: string; error: string }> = [];

  // Ensure auth helper exists
  if (!dryRun) {
    await ensureAuthHelperExists(project);
  }

  for (const relPath of filePaths) {
    try {
      const fullPath = path.join(projectRoot, relPath);
      const sourceFile = project.addSourceFileAtPath(fullPath);
      let fileModified = false;
      let needsAuthHelperImport = false;

      // Pattern 1: Direct property access req.user
      sourceFile.forEachDescendant(node => {
        if (node.getKind() === SyntaxKind.PropertyAccessExpression) {
          const propAccess = node as PropertyAccessExpression;
          const expression = propAccess.getExpression().getText().trim();
          const property = propAccess.getName();
          
          if (expression === 'req' && property === 'user') {
            // Replace req.user with getAuthenticatedUser(req)
            propAccess.replaceWithText('getAuthenticatedUser(req)');
            transformCount++;
            fileModified = true;
            needsAuthHelperImport = true;
          }
        }
      });

      // Pattern 2: Variable declarations const user = req.user
      sourceFile.forEachDescendant(node => {
        if (node.getKind() === SyntaxKind.VariableDeclaration) {
          const varDecl = node as VariableDeclaration;
          const initializer = varDecl.getInitializer();
          
          if (initializer?.getKind() === SyntaxKind.PropertyAccessExpression) {
            const propAccess = initializer as PropertyAccessExpression;
            const object = propAccess.getExpression().getText().trim();
            const property = propAccess.getName();
            
            if (object === 'req' && property === 'user') {
              // Replace initializer
              varDecl.setInitializer('getAuthenticatedUser(req)');
              transformCount++;
              fileModified = true;
              needsAuthHelperImport = true;
            }
          }
        }
      });

      // Pattern 3: Destructuring const { user } = req
      sourceFile.forEachDescendant(node => {
        if (node.getKind() === SyntaxKind.VariableDeclaration) {
          const varDecl = node as VariableDeclaration;
          const nameNode = varDecl.getNameNode();
          const initializer = varDecl.getInitializer();
          
          if (nameNode.getKind() === SyntaxKind.ObjectBindingPattern && initializer?.getText() === 'req') {
            const bindingPattern = nameNode as ObjectBindingPattern;
            const elements = bindingPattern.getElements();
            
            // Check if 'user' is being destructured
            const userElement = elements.find(el => 
              el.getPropertyNameNode()?.getText() === 'user' || 
              el.getName() === 'user'
            );
            
            if (userElement) {
              // Convert { user, ...other } = req to user = getAuthenticatedUser(req), { ...other } = req
              // For simplicity, we'll handle the common case of just { user } = req
              const otherElements = elements.filter(el => el !== userElement);
              
              if (otherElements.length === 0) {
                // Simple case: const { user } = req; → const user = getAuthenticatedUser(req);
                varDecl.set({
                  name: 'user',
                  initializer: 'getAuthenticatedUser(req)'
                });
              } else {
                // Complex case: leave a comment for manual intervention
                varDecl.replaceWithText(`// TODO: Manual conversion needed - was destructuring user from req
const user = getAuthenticatedUser(req);
const { ${otherElements.map(el => el.getText()).join(', ')} } = req;`);
              }
              
              transformCount++;
              fileModified = true;
              needsAuthHelperImport = true;
            }
          }
        }
      });

      // Add import if needed
      if (needsAuthHelperImport) {
        const existingImport = sourceFile.getImportDeclaration('"@server/src/core/utils/auth.helpers"') ||
                               sourceFile.getImportDeclaration("'@server/src/core/utils/auth.helpers'");
        
        if (!existingImport) {
          sourceFile.addImportDeclaration({
            moduleSpecifier: '@server/src/core/utils/auth.helpers',
            namedImports: ['getAuthenticatedUser']
          });
        } else {
          // Check if getAuthenticatedUser is already imported
          const namedImports = existingImport.getNamedImports();
          const hasGetAuthenticatedUser = namedImports.some(imp => 
            imp.getName() === 'getAuthenticatedUser'
          );
          
          if (!hasGetAuthenticatedUser) {
            existingImport.addNamedImport('getAuthenticatedUser');
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

  return {
    transformCount,
    transformedFiles,
    errors,
    summary: `${dryRun ? '[DRY RUN] ' : ''}Transformed ${transformCount} req.user patterns in ${transformedFiles.length} files`
  };
}

async function ensureAuthHelperExists(project: Project) {
  const helperPath = path.join(projectRoot, 'server/src/core/utils/auth.helpers.ts');
  
  try {
    // Check if file exists
    project.addSourceFileAtPath(helperPath);
    console.log('✅ Auth helper already exists');
  } catch (error) {
    // File doesn't exist, create it
    console.log('📝 Creating auth helper file...');
    
    const helperContent = `/**
 * Auth Helper Utilities
 * Centralizes authentication-related helper functions
 */

import type { Request } from 'express';
import type { UserId } from '@shared/types/ids';

export interface AuthenticatedUser {
  id: UserId;
  username: string;
  email: string;
  role: 'user' | 'moderator' | 'admin' | 'owner';
  emailVerified: boolean;
  createdAt: Date;
  lastSeen?: Date;
}

/**
 * Safely extract authenticated user from request
 * Replaces direct req.user access for better type safety
 * 
 * @param req Express request object
 * @returns Authenticated user or null if not authenticated
 */
export function getAuthenticatedUser(req: Request): AuthenticatedUser | null {
  return (req as any).user || null;
}

/**
 * Assert that user is authenticated (throws if not)
 * Use for endpoints that require authentication
 * 
 * @param req Express request object
 * @returns Authenticated user (guaranteed non-null)
 * @throws Error if user is not authenticated
 */
export function requireAuthenticatedUser(req: Request): AuthenticatedUser {
  const user = getAuthenticatedUser(req);
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user;
}

/**
 * Check if user has admin privileges
 */
export function isAdmin(user: AuthenticatedUser | null): boolean {
  return user?.role === 'admin' || user?.role === 'owner';
}

/**
 * Check if user has moderator or higher privileges  
 */
export function isModerator(user: AuthenticatedUser | null): boolean {
  return user?.role === 'moderator' || isAdmin(user);
}

/**
 * Check if user owns the resource (user ID matches)
 */
export function isOwner(user: AuthenticatedUser | null, resourceUserId: UserId): boolean {
  return user?.id === resourceUserId;
}

/**
 * Check if user can access resource (admin, moderator, or owner)
 */
export function canAccessResource(user: AuthenticatedUser | null, resourceUserId: UserId): boolean {
  return isModerator(user) || isOwner(user, resourceUserId);
}`;

    const sourceFile = project.createSourceFile(helperPath, helperContent);
    await sourceFile.save();
    console.log('✅ Auth helper created');
  }
}

// CLI interface
if (typeof require !== 'undefined' && require.main === module) {
  const dryRun = process.argv.includes('--dry-run') || process.argv.includes('--dry');
  
  reqUserRemovalCodemod(dryRun).then(result => {
    console.log('\n' + result.summary);
    
    if (dryRun && result.transformedFiles.length > 0) {
      console.log('\n📝 Files that would be modified:');
      result.transformedFiles.forEach(f => console.log(`  - ${f}`));
    }
    
    if (!dryRun && result.transformCount > 0) {
      console.log('\n✅ req.user removal complete!');
      console.log('💡 Next steps:');
      console.log('  1. Review auth.helpers.ts and adjust types as needed');
      console.log('  2. Run `pnpm typecheck` to verify imports');
      console.log('  3. Test authentication flows in affected files');
      console.log('  4. Commit changes: `git add . && git commit -m "refactor: replace req.user with helper"`');
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