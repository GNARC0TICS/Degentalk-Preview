#!/usr/bin/env tsx
/**
 * Seed File UUID Fixer
 * 
 * Fixes seed files to use proper UUID generation and removes integer ID patterns
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';

interface SeedIssue {
  file: string;
  line: number;
  issue: string;
  suggestion: string;
}

// Patterns to fix in seed files
const SEED_FIXES = [
  {
    // Fix malformed type declarations
    regex: /: AdminId\): : AdminId => {/g,
    replacement: ': string): string => {',
    description: 'Fix malformed function signature'
  },
  {
    // Fix impossibly long union types in values
    regex: /stockLimit: : AdminId \| : ReporterId[\s\S]*?\| : HeatEventId \| null,/g,
    replacement: 'stockLimit: null,',
    description: 'Fix broken stockLimit type annotation'
  },
  {
    // Add crypto import for UUID generation
    regex: /(import.*?from.*?['"];?\s*)/,
    replacement: '$1import { randomUUID } from "crypto";\n',
    description: 'Add crypto import for UUID generation'
  },
  {
    // Fix integer ID literals
    regex: /id:\s*(\d+)/g,
    replacement: 'id: randomUUID()',
    description: 'Replace integer ID with UUID generation'
  },
  {
    // Fix userId patterns
    regex: /userId:\s*(\d+)/g,
    replacement: 'userId: randomUUID()',
    description: 'Replace integer userId with UUID'
  }
];

// Files to process
const SEED_DIRECTORIES = [
  'scripts/seed',
  'server/utils'
];

async function getAllFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  
  async function traverse(currentDir: string) {
    try {
      const items = await readdir(currentDir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = join(currentDir, item.name);
        
        if (item.isDirectory()) {
          await traverse(fullPath);
        } else if (item.name.endsWith('.ts') && !item.name.includes('.test.')) {
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

function scanSeedFile(content: string, filePath: string): SeedIssue[] {
  const issues: SeedIssue[] = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for integer ID patterns
    if (/\bid:\s*\d+/.test(line)) {
      issues.push({
        file: filePath,
        line: i + 1,
        issue: 'Integer ID literal',
        suggestion: line.replace(/\bid:\s*\d+/g, 'id: randomUUID()')
      });
    }
    
    // Check for userId integer patterns
    if (/userId:\s*\d+/.test(line)) {
      issues.push({
        file: filePath,
        line: i + 1,
        issue: 'Integer userId literal',
        suggestion: line.replace(/userId:\s*\d+/g, 'userId: randomUUID()')
      });
    }
    
    // Check for malformed type annotations
    if (/: AdminId\): : AdminId/.test(line)) {
      issues.push({
        file: filePath,
        line: i + 1,
        issue: 'Malformed function signature',
        suggestion: line.replace(/: AdminId\): : AdminId/, ': string): string')
      });
    }
    
    // Check for massive union types
    if (/: AdminId \| : ReporterId/.test(line)) {
      issues.push({
        file: filePath,
        line: i + 1,
        issue: 'Broken union type annotation',
        suggestion: 'stockLimit: null,'
      });
    }
  }
  
  return issues;
}

async function fixSeedFile(filePath: string): Promise<{ fixed: number; issues: SeedIssue[] }> {
  const content = await readFile(filePath, 'utf-8');
  const issues = scanSeedFile(content, filePath);
  
  if (issues.length === 0) {
    return { fixed: 0, issues: [] };
  }
  
  let updatedContent = content;
  let fixed = 0;
  
  // Apply fixes
  for (const fix of SEED_FIXES) {
    if (updatedContent.match(fix.regex)) {
      updatedContent = updatedContent.replace(fix.regex, fix.replacement);
      fixed++;
    }
  }
  
  // Special handling for the shop cosmetics file
  if (filePath.includes('seed-default-cosmetics.ts')) {
    // Remove excessive imports
    const cleanImports = `import type { UserId, ProductId } from '@shared/types/ids';
import { randomUUID } from 'crypto';`;
    
    updatedContent = updatedContent.replace(
      /import type \{[^}]*\} from '@db\/types';.*?import type \{[^}]*\} from '@db\/types';/s,
      cleanImports
    );
  }
  
  // Ensure crypto import exists if we have UUID generation
  if (updatedContent.includes('randomUUID()') && !updatedContent.includes('import { randomUUID }')) {
    const importIndex = updatedContent.indexOf('import');
    const insertPoint = updatedContent.indexOf('\n', importIndex) + 1;
    updatedContent = updatedContent.slice(0, insertPoint) + 
      'import { randomUUID } from "crypto";\n' + 
      updatedContent.slice(insertPoint);
  }
  
  if (fixed > 0) {
    await writeFile(filePath, updatedContent);
  }
  
  return { fixed, issues };
}

async function main() {
  console.log(chalk.cyan('🌱 SEED FILE UUID FIXER\n'));
  
  let totalFixed = 0;
  let totalFiles = 0;
  let totalIssues = 0;
  
  for (const seedDir of SEED_DIRECTORIES) {
    const fullDir = join(process.cwd(), seedDir);
    const files = await getAllFiles(fullDir);
    
    if (files.length === 0) {
      console.log(chalk.gray(`No files found in ${seedDir}`));
      continue;
    }
    
    console.log(chalk.blue(`Processing ${files.length} files in ${seedDir}...`));
    
    for (const file of files) {
      try {
        const result = await fixSeedFile(file);
        
        if (result.issues.length > 0) {
          totalFiles++;
          totalFixed += result.fixed;
          totalIssues += result.issues.length;
          
          const relativePath = file.replace(process.cwd(), '');
          console.log(chalk.yellow(`\n📁 ${relativePath}`));
          console.log(chalk.green(`  ✓ Fixed ${result.fixed} patterns`));
          
          // Show first few issues
          for (const issue of result.issues.slice(0, 3)) {
            console.log(chalk.gray(`    Line ${issue.line}: ${issue.issue}`));
          }
          
          if (result.issues.length > 3) {
            console.log(chalk.gray(`    ... and ${result.issues.length - 3} more issues`));
          }
        }
      } catch (error) {
        console.log(chalk.red(`  ❌ Error processing ${file}: ${error}`));
      }
    }
  }
  
  if (totalFiles === 0) {
    console.log(chalk.green('✅ No seed files with UUID issues found!'));
  } else {
    console.log(chalk.green(`\n🎉 Summary: Fixed ${totalFixed} patterns across ${totalFiles} files`));
    console.log(chalk.yellow(`   Found ${totalIssues} total issues`));
    
    console.log(chalk.yellow('\n📝 Next steps:'));
    console.log('   1. Review the changes to ensure UUID generation is appropriate');
    console.log('   2. Update any hardcoded IDs to use proper UUID references');
    console.log('   3. Test the seed scripts to ensure they work correctly');
    console.log('   4. Consider adding a seed data helper for consistent UUID handling');
  }
}

main().catch(console.error);