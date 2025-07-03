#!/usr/bin/env tsx
/**
 * Fix Broken Validation Patterns
 * 
 * Fixes the logical issues created by the previous automated fixes,
 * particularly z.string().uuid().int() patterns that don't make sense.
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';

interface FixPattern {
  regex: RegExp;
  replacement: string;
  description: string;
}

// Patterns to fix
const FIX_PATTERNS: FixPattern[] = [
  // Fix z.string().uuid().int() patterns
  {
    regex: /z\.string\(\)\.uuid\(\)\.int\(\)\.positive\(\)/g,
    replacement: 'z.string().uuid()',
    description: 'Fix z.string().uuid().int().positive() to z.string().uuid()'
  },
  {
    regex: /z\.string\(\)\.uuid\(\)\.int\(\)\.min\(1\)/g,
    replacement: 'z.string().uuid()',
    description: 'Fix z.string().uuid().int().min(1) to z.string().uuid()'
  },
  {
    regex: /z\.string\(\)\.uuid\(\)\.int\(\)/g,
    replacement: 'z.string().uuid()',
    description: 'Fix z.string().uuid().int() to z.string().uuid()'
  },
  
  // Fix malformed patterns from previous replacement
  {
    regex: /userId:\s*z\.string\(\)\.uuid\(\)\.int\(\)\.positive\('User ID must be a positive integer'\)/g,
    replacement: 'userId: z.string().uuid()',
    description: 'Fix broken userId validation with message'
  },
  {
    regex: /userId:\s*z\.string\(\)\.uuid\(\)\.int\(\(\s*\{\s*message:\s*'User ID must be an integer\.'\s*\}\s*\)/g,
    replacement: 'userId: z.string().uuid()',
    description: 'Fix broken userId validation with object message'
  },
  
  // Fix sourceBackupId pattern
  {
    regex: /sourceBackupId:\s*z\.string\(\)\.uuid\(\)\.positive\(\)/g,
    replacement: 'sourceBackupId: z.string().uuid()',
    description: 'Fix sourceBackupId validation'
  },
  
  // Fix parentId, categoryId, prefixId patterns
  {
    regex: /(\w+Id):\s*z\.string\(\)\.uuid\(\)\.int\(\)(?:\.\w+\(\))*(?:\.nullable\(\))?(?:\.optional\(\))?/g,
    replacement: '$1: z.string().uuid().optional().nullable()',
    description: 'Fix entity ID patterns with int() modifiers'
  }
];

// Files to process
const TARGET_DIRS = [
  'server/src/domains',
  'shared'
];

async function getAllFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  
  async function traverse(currentDir: string) {
    try {
      const items = await readdir(currentDir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = join(currentDir, item.name);
        
        if (item.isDirectory() && !item.name.includes('node_modules')) {
          await traverse(fullPath);
        } else if (item.name.endsWith('.ts') && !item.name.includes('.test.')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories that don't exist or can't be read
    }
  }
  
  await traverse(dir);
  return files;
}

async function fixFile(filePath: string): Promise<{ fixed: number; patterns: string[] }> {
  const content = await readFile(filePath, 'utf-8');
  let updatedContent = content;
  let fixedCount = 0;
  const appliedPatterns: string[] = [];
  
  for (const pattern of FIX_PATTERNS) {
    const matches = updatedContent.match(pattern.regex);
    if (matches) {
      updatedContent = updatedContent.replace(pattern.regex, pattern.replacement);
      fixedCount += matches.length;
      appliedPatterns.push(pattern.description);
    }
  }
  
  if (fixedCount > 0) {
    await writeFile(filePath, updatedContent);
  }
  
  return { fixed: fixedCount, patterns: appliedPatterns };
}

async function main() {
  console.log(chalk.cyan('🔧 FIXING BROKEN VALIDATION PATTERNS\n'));
  
  let totalFixed = 0;
  let totalFiles = 0;
  
  for (const targetDir of TARGET_DIRS) {
    const fullDir = join(process.cwd(), targetDir);
    const files = await getAllFiles(fullDir);
    
    console.log(chalk.blue(`Processing ${files.length} files in ${targetDir}...`));
    
    for (const file of files) {
      try {
        const result = await fixFile(file);
        
        if (result.fixed > 0) {
          totalFiles++;
          totalFixed += result.fixed;
          
          const relativePath = file.replace(process.cwd(), '');
          console.log(chalk.green(`  ✓ Fixed ${result.fixed} patterns in ${relativePath}`));
          
          // Show what was fixed
          for (const pattern of result.patterns) {
            console.log(chalk.gray(`    - ${pattern}`));
          }
        }
      } catch (error) {
        console.log(chalk.red(`  ❌ Error processing ${file}: ${error}`));
      }
    }
  }
  
  console.log(chalk.green(`\n🎉 Summary: Fixed ${totalFixed} patterns across ${totalFiles} files`));
  
  if (totalFixed > 0) {
    console.log(chalk.yellow('\n📝 Next steps:'));
    console.log('   1. Review the changes to ensure they make sense');
    console.log('   2. Update any route handlers to use the new validation utilities');
    console.log('   3. Import validation helpers from shared/utils/id-validation.ts');
    console.log('   4. Test the affected endpoints');
  }
}

main().catch(console.error);