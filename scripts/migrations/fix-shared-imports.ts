#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

console.log('🔧 Fixing @shared/types imports...\n');

// Find all TypeScript files in server
const files = glob.sync('server/**/*.ts', { 
  ignore: ['node_modules/**', 'dist/**', 'build/**'] 
});

let fixedCount = 0;

files.forEach(filePath => {
  let content = readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix imports of ID functions from @shared/types to @shared/utils/id
  const idFunctionPattern = /import\s*{([^}]+)}\s*from\s*['"]@shared\/types['"]/g;
  
  content = content.replace(idFunctionPattern, (match, imports) => {
    const importList = imports.split(',').map(i => i.trim());
    const idFunctions = ['toId', 'isValidId', 'toUserId', 'toThreadId', 'toPostId', 'toForumId', 
                        'toStructureId', 'toTransactionId', 'toWalletId', 'toItemId', 'toFrameId',
                        'toBadgeId', 'toTitleId', 'toTagId', 'toMissionId', 'toAchievementId',
                        'toProductId', 'toPathId', 'toAdminId', 'toReportId', 'toConversationId',
                        'toRoomId', 'toLevelId', 'toEntityId', 'parseId', 'generateId', 'idsEqual',
                        'filterValidIds', 'parseIdParam', 'assertValidId', 'isValidNumericId', 
                        'parseEntityIdParam'];
    
    const idImports = importList.filter(imp => idFunctions.includes(imp));
    const otherImports = importList.filter(imp => !idFunctions.includes(imp));
    
    if (idImports.length > 0) {
      modified = true;
      fixedCount++;
      
      let result = '';
      if (idImports.length > 0) {
        result += `import { ${idImports.join(', ')} } from '@shared/utils/id'`;
      }
      if (otherImports.length > 0) {
        if (result) result += ';\n';
        result += `import { ${otherImports.join(', ')} } from '@shared/types'`;
      }
      
      console.log(`  📝 Fixed imports in ${filePath}`);
      console.log(`     ID functions: ${idImports.join(', ')}`);
      if (otherImports.length > 0) {
        console.log(`     Other imports kept: ${otherImports.join(', ')}`);
      }
      
      return result;
    }
    
    return match;
  });
  
  // Fix imports of toDgtAmount from @shared/types to @shared/types/economy
  content = content.replace(
    /import\s*{\s*toDgtAmount\s*}\s*from\s*['"]@shared\/types['"]/g,
    "import { toDgtAmount } from '@shared/types/economy'"
  );
  
  // Also fix incorrect wallet.types imports
  content = content.replace(
    /import\s*{\s*toDgtAmount\s*}\s*from\s*['"]@shared\/types\/wallet\.types['"]/g,
    "import { toDgtAmount } from '@shared/types/economy'"
  );
  
  if (content.includes("from '@shared/types/economy'") && content.includes('toDgtAmount')) {
    modified = true;
    console.log(`  💰 Fixed toDgtAmount import in ${filePath}`);
  }
  
  if (modified) {
    writeFileSync(filePath, content);
  }
});

console.log(`\n✨ Fixed ${fixedCount} files with incorrect imports!\n`);