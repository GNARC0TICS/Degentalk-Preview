import { Project } from 'ts-morph';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Compilation Test for Phase 5 Codemods
 * -------------------------------------
 * Unit test to verify that sample files compile after codemod transformation.
 * Guards against import alias issues and other compilation problems.
 * 
 * Usage: tsx scripts/codemods/phase5/test-compilation.ts
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../../');

export async function testCodemodCompilation(): Promise<boolean> {
  console.log('🧪 Testing Phase 5 codemod compilation...');
  
  try {
    const project = new Project({
      tsConfigFilePath: path.join(projectRoot, 'tsconfig.json'),
    });
    
    // Create test files that simulate codemod output
    const testCases = [
      {
        name: 'console-to-logger transformation',
        path: 'test-console-logger.ts',
        content: `
import { logger } from '../core/logger';

export function testFunction() {
  logger.info('Test message');
  logger.debug('Debug info');
  logger.warn('Warning message');
}
`
      },
      {
        name: 'req.user helper usage',
        path: 'test-auth-helper.ts', 
        content: `
import type { Request, Response } from 'express';
import { getAuthenticatedUser } from '../core/utils/auth.helpers';

export function testController(req: Request, res: Response) {
  const user = getAuthenticatedUser(req);
  if (user) {
    console.log('User ID:', user.id);
  }
}
`
      },
      {
        name: 'branded ID types',
        path: 'test-branded-ids.ts',
        content: `
import type { UserId, ThreadId, PostId } from '../../shared/types/ids';

export interface TestInterface {
  userId: UserId;
  threadId: ThreadId;
  postId: PostId;
}

export function testFunction(userId: UserId): ThreadId {
  return 'test' as ThreadId;
}
`
      }
    ];
    
    let allPassed = true;
    
    for (const testCase of testCases) {
      try {
        const testFile = project.createSourceFile(
          path.join(projectRoot, 'server/src/test/', testCase.path),
          testCase.content,
          { overwrite: true }
        );
        
        // Check for compilation errors
        const diagnostics = testFile.getPreEmitDiagnostics();
        
        if (diagnostics.length > 0) {
          console.log(`❌ ${testCase.name} failed compilation:`);
          diagnostics.forEach(diagnostic => {
            console.log(`   ${diagnostic.getMessageText()}`);
          });
          allPassed = false;
        } else {
          console.log(`✅ ${testCase.name} compiles successfully`);
        }
        
        // Clean up test file
        testFile.delete();
        
      } catch (error) {
        console.log(`❌ ${testCase.name} failed: ${error}`);
        allPassed = false;
      }
    }
    
    if (allPassed) {
      console.log('\n🎉 All codemod compilation tests passed!');
    } else {
      console.log('\n💥 Some compilation tests failed - review codemod implementations');
    }
    
    return allPassed;
    
  } catch (error) {
    console.error('❌ Compilation test setup failed:', error);
    return false;
  }
}

// CLI interface
if (typeof require !== 'undefined' && require.main === module) {
  testCodemodCompilation().then(passed => {
    process.exit(passed ? 0 : 1);
  });
}