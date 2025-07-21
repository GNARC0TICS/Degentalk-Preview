#!/usr/bin/env npx tsx
/**
 * Codemod to replace deprecated as*Id functions with create*Id constructors
 * 
 * Replaces:
 * - asStructureId → createStructureId
 * - asTagId → createTagId
 * - asPrefixId → createPrefixId
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

const replacements = [
  { from: 'asStructureId', to: 'createStructureId' },
  { from: 'asTagId', to: 'createTagId' },
  { from: 'asPrefixId', to: 'createPrefixId' }
];

async function processFile(filePath: string): Promise<boolean> {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Replace function calls
  for (const { from, to } of replacements) {
    const regex = new RegExp(`\\b${from}\\b`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, to);
      modified = true;
      console.log(`  ✓ Replaced ${from} → ${to} in ${filePath}`);
    }
  }
  
  // Update imports from @shared/types/ids
  const importRegex = /import\s*{([^}]+)}\s*from\s*['"]@shared\/types\/ids['"]/;
  const importMatch = content.match(importRegex);
  
  if (importMatch) {
    const imports = importMatch[1];
    let newImports = imports;
    let importModified = false;
    
    for (const { from, to } of replacements) {
      if (imports.includes(from)) {
        newImports = newImports.replace(from, to);
        importModified = true;
      }
    }
    
    if (importModified) {
      // Check if we need to update the import path
      // If we're importing create* functions, they should come from @shared/utils/ids
      const hasCreateFunctions = replacements.some(r => newImports.includes(r.to));
      
      if (hasCreateFunctions) {
        // Split imports between types and utils
        const importItems = newImports.split(',').map(s => s.trim());
        const createFunctions = importItems.filter(item => 
          replacements.some(r => item.includes(r.to))
        );
        const otherImports = importItems.filter(item => 
          !replacements.some(r => item.includes(r.to))
        );
        
        // Build new import statements
        let newImportStatements = '';
        
        if (otherImports.length > 0) {
          newImportStatements += `import { ${otherImports.join(', ')} } from '@shared/types/ids';`;
        }
        
        if (createFunctions.length > 0) {
          if (newImportStatements) newImportStatements += '\n';
          newImportStatements += `import { ${createFunctions.join(', ')} } from '@shared/utils/ids';`;
        }
        
        content = content.replace(importMatch[0], newImportStatements);
        modified = true;
        console.log(`  ✓ Updated imports in ${filePath}`);
      } else {
        content = content.replace(importMatch[0], `import {${newImports}} from '@shared/types/ids'`);
        modified = true;
      }
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
  }
  
  return modified;
}

async function main() {
  console.log('🔧 Replacing deprecated as*Id functions with create*Id constructors...\n');
  
  const patterns = [
    'client/src/**/*.{ts,tsx}',
    'server/src/**/*.{ts,tsx}',
    'shared/src/**/*.{ts,tsx}'
  ];
  
  let totalFiles = 0;
  let modifiedFiles = 0;
  
  for (const pattern of patterns) {
    const files = await glob(pattern, { ignore: ['**/node_modules/**', '**/*.test.ts', '**/*.spec.ts'] });
    
    for (const file of files) {
      totalFiles++;
      if (await processFile(file)) {
        modifiedFiles++;
      }
    }
  }
  
  console.log(`\n✅ Complete! Modified ${modifiedFiles} out of ${totalFiles} files.`);
  
  // Now remove the deprecated functions from shared/types/ids.ts
  console.log('\n🔧 Removing deprecated as*Id functions from shared/types/ids.ts...');
  
  const idsFile = path.join('shared', 'types', 'ids.ts');
  if (fs.existsSync(idsFile)) {
    let idsContent = fs.readFileSync(idsFile, 'utf8');
    
    // Remove the deprecated functions
    const deprecatedPatterns = [
      /\/\*\*[\s\S]*?\*\/\s*export\s+const\s+asStructureId\s*=[\s\S]*?};?\s*/g,
      /\/\*\*[\s\S]*?\*\/\s*export\s+const\s+asTagId\s*=[\s\S]*?};?\s*/g,
      /\/\*\*[\s\S]*?\*\/\s*export\s+const\s+asPrefixId\s*=[\s\S]*?};?\s*/g
    ];
    
    for (const pattern of deprecatedPatterns) {
      if (pattern.test(idsContent)) {
        idsContent = idsContent.replace(pattern, '');
        console.log('  ✓ Removed deprecated function');
      }
    }
    
    fs.writeFileSync(idsFile, idsContent);
    console.log('  ✓ Updated shared/types/ids.ts');
  }
  
  console.log('\n🎉 Codemod complete! Remember to:');
  console.log('  1. Run pnpm typecheck to verify types');
  console.log('  2. Run tests to ensure nothing broke');
  console.log('  3. Commit the changes');
}

main().catch(console.error);