#!/usr/bin/env tsx
/**
 * Frontend ID Type Fixer
 * 
 * Fixes TypeScript type errors in frontend files caused by UUID migration
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';

interface TypeFix {
  regex: RegExp;
  replacement: string;
  description: string;
  needsImport?: string;
}

// Common ID type fixes
const TYPE_FIXES: TypeFix[] = [
  // Fix string | number ID types
  {
    regex: /id:\s*string\s*\|\s*number/g,
    replacement: 'id: UserId',
    description: 'Fix id: string | number to UserId',
    needsImport: 'UserId'
  },
  {
    regex: /userId:\s*string\s*\|\s*number/g,
    replacement: 'userId: UserId',
    description: 'Fix userId: string | number to UserId',
    needsImport: 'UserId'
  },
  {
    regex: /threadId:\s*string\s*\|\s*number/g,
    replacement: 'threadId: ThreadId',
    description: 'Fix threadId: string | number to ThreadId',
    needsImport: 'ThreadId'
  },
  {
    regex: /postId:\s*string\s*\|\s*number/g,
    replacement: 'postId: PostId',
    description: 'Fix postId: string | number to PostId',
    needsImport: 'PostId'
  },
  {
    regex: /badgeId:\s*string\s*\|\s*number/g,
    replacement: 'badgeId: BadgeId',
    description: 'Fix badgeId: string | number to BadgeId',
    needsImport: 'BadgeId'
  },
  {
    regex: /titleId:\s*string\s*\|\s*number/g,
    replacement: 'titleId: TitleId',
    description: 'Fix titleId: string | number to TitleId',
    needsImport: 'TitleId'
  },
  {
    regex: /achievementId:\s*string\s*\|\s*number/g,
    replacement: 'achievementId: AchievementId',
    description: 'Fix achievementId: string | number to AchievementId',
    needsImport: 'AchievementId'
  },
  {
    regex: /missionId:\s*string\s*\|\s*number/g,
    replacement: 'missionId: MissionId',
    description: 'Fix missionId: string | number to MissionId',
    needsImport: 'MissionId'
  },
  {
    regex: /productId:\s*string\s*\|\s*number/g,
    replacement: 'productId: ProductId',
    description: 'Fix productId: string | number to ProductId',
    needsImport: 'ProductId'
  },
  {
    regex: /inventoryId:\s*string\s*\|\s*number/g,
    replacement: 'inventoryId: InventoryId',
    description: 'Fix inventoryId: string | number to InventoryId',
    needsImport: 'InventoryId'
  },
  {
    regex: /frameId:\s*string\s*\|\s*number/g,
    replacement: 'frameId: FrameId',
    description: 'Fix frameId: string | number to FrameId',
    needsImport: 'FrameId'
  },
  {
    regex: /structureId:\s*string\s*\|\s*number/g,
    replacement: 'structureId: StructureId',
    description: 'Fix structureId: string | number to StructureId',
    needsImport: 'StructureId'
  },

  // Fix function parameter types
  {
    regex: /\(([^)]*Id):\s*string\s*\|\s*number\)/g,
    replacement: '($1: UserId)',
    description: 'Fix function parameter ID types',
    needsImport: 'UserId'
  },

  // Fix number-only ID types (need context checking)
  {
    regex: /([a-zA-Z]*[Ii]d):\s*number(?!\s*\|)/g,
    replacement: '$1: string',
    description: 'Convert number ID to string (will need manual review for branded types)'
  },

  // Fix array types
  {
    regex: /Array<number>/g,
    replacement: 'Array<string>',
    description: 'Fix Array<number> to Array<string> for IDs'
  },
  {
    regex: /number\[\]/g,
    replacement: 'string[]',
    description: 'Fix number[] to string[] for IDs (context-dependent)'
  }
];

// Specific fixes for common patterns
const PATTERN_FIXES: TypeFix[] = [
  // API call patterns
  {
    regex: /apiRequest\(\{\s*url:\s*[`'"]([^`'"]*)\$\{([^}]*)\}([^`'"]*)[`'"]/g,
    replacement: 'apiRequest({ url: `$1${$2}$3`',
    description: 'Ensure API URLs use string interpolation correctly'
  },

  // parseInt and Number usage
  {
    regex: /parseInt\(([^)]*[Ii]d[^)]*)\)/g,
    replacement: '$1',
    description: 'Remove parseInt from ID values'
  },
  {
    regex: /Number\(([^)]*[Ii]d[^)]*)\)/g,
    replacement: '$1',
    description: 'Remove Number() casting from ID values'
  }
];

async function getAllFiles(dir: string, extensions: string[] = ['.tsx', '.ts']): Promise<string[]> {
  const files: string[] = [];
  
  async function traverse(currentDir: string) {
    try {
      const items = await readdir(currentDir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = join(currentDir, item.name);
        
        if (item.isDirectory() && !['node_modules', 'dist', 'build', '.next'].includes(item.name)) {
          await traverse(fullPath);
        } else if (extensions.some(ext => item.name.endsWith(ext)) && !item.name.includes('.test.') && !item.name.includes('.spec.')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories that don't exist
    }
  }
  
  await traverse(dir);
  return files;
}

function extractNeededImports(content: string, appliedFixes: TypeFix[]): string[] {
  const neededImports = new Set<string>();
  
  for (const fix of appliedFixes) {
    if (fix.needsImport && content.includes(fix.needsImport)) {
      neededImports.add(fix.needsImport);
    }
  }
  
  return Array.from(neededImports);
}

function addMissingImports(content: string, neededImports: string[]): string {
  if (neededImports.length === 0) return content;
  
  // Check if there's already an import from @db/types
  const existingImportMatch = content.match(/import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+['"]@db\/types['"];?/);
  
  if (existingImportMatch) {
    // Add to existing import
    const existingTypes = existingImportMatch[1].split(',').map(t => t.trim());
    const allTypes = [...new Set([...existingTypes, ...neededImports])];
    const newImport = `import type { ${allTypes.join(', ')} } from '@db/types';`;
    return content.replace(existingImportMatch[0], newImport);
  } else {
    // Add new import
    const newImport = `import type { ${neededImports.join(', ')} } from '@db/types';\n`;
    
    // Find the first import or the start of the file
    const firstImportMatch = content.match(/^import\s/m);
    if (firstImportMatch) {
      const insertIndex = content.indexOf(firstImportMatch[0]);
      return content.slice(0, insertIndex) + newImport + content.slice(insertIndex);
    } else {
      return newImport + content;
    }
  }
}

async function fixFile(filePath: string): Promise<{ fixed: number; appliedFixes: TypeFix[] }> {
  const content = await readFile(filePath, 'utf-8');
  let updatedContent = content;
  let fixedCount = 0;
  const appliedFixes: TypeFix[] = [];
  
  // Apply type fixes
  const allFixes = [...TYPE_FIXES, ...PATTERN_FIXES];
  
  for (const fix of allFixes) {
    const matches = updatedContent.match(fix.regex);
    if (matches) {
      updatedContent = updatedContent.replace(fix.regex, fix.replacement);
      fixedCount += matches.length;
      appliedFixes.push(fix);
    }
  }
  
  // Add missing imports
  const neededImports = extractNeededImports(updatedContent, appliedFixes);
  if (neededImports.length > 0) {
    updatedContent = addMissingImports(updatedContent, neededImports);
  }
  
  if (fixedCount > 0) {
    await writeFile(filePath, updatedContent);
  }
  
  return { fixed: fixedCount, appliedFixes };
}

async function main() {
  console.log(chalk.cyan('🔧 FRONTEND ID TYPE FIXER\n'));
  
  const clientDir = join(process.cwd(), 'client/src');
  const files = await getAllFiles(clientDir);
  
  console.log(chalk.blue(`Processing ${files.length} frontend files...\n`));
  
  let totalFixed = 0;
  let totalFiles = 0;
  
  for (const file of files) {
    try {
      const result = await fixFile(file);
      
      if (result.fixed > 0) {
        totalFiles++;
        totalFixed += result.fixed;
        
        const relativePath = file.replace(process.cwd(), '');
        console.log(chalk.green(`✓ Fixed ${result.fixed} patterns in ${relativePath}`));
        
        // Show applied fixes
        for (const fix of result.appliedFixes.slice(0, 3)) {
          console.log(chalk.gray(`  - ${fix.description}`));
        }
        if (result.appliedFixes.length > 3) {
          console.log(chalk.gray(`  - ... and ${result.appliedFixes.length - 3} more fixes`));
        }
      }
    } catch (error) {
      console.log(chalk.red(`❌ Error processing ${file}: ${error}`));
    }
  }
  
  if (totalFiles === 0) {
    console.log(chalk.green('✅ No ID type issues found in frontend files!'));
  } else {
    console.log(chalk.green(`\n🎉 Summary: Fixed ${totalFixed} patterns across ${totalFiles} files`));
    
    console.log(chalk.yellow('\n📝 Next steps:'));
    console.log('   1. Run TypeScript compiler to check for remaining errors');
    console.log('   2. Review changes to ensure branded types are used appropriately');
    console.log('   3. Test affected pages and components');
    console.log('   4. Consider adding proper type exports for complex interfaces');
  }
}

main().catch(console.error);