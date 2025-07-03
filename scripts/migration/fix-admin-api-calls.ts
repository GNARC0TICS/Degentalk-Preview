#!/usr/bin/env tsx
/**
 * Admin API Call Fixer
 * 
 * Fixes apiRequest calls in admin panel to use correct ApiRequestConfig format
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';

interface ApiCallFix {
  regex: RegExp;
  replacement: string;
  description: string;
}

// Common API call patterns to fix
const API_CALL_FIXES: ApiCallFix[] = [
  // Fix simple GET calls with just URL
  {
    regex: /apiRequest\(\{\s*url:\s*(['"`])([^'"`]+)\1\s*\}\)/g,
    replacement: 'apiRequest({ url: $1$2$1, method: \'GET\' })',
    description: 'Add missing method to GET requests'
  },
  
  // Fix calls that already have method but wrong structure
  {
    regex: /apiRequest\(\{\s*url:\s*(['"`])([^'"`]+)\1,\s*method:\s*(['"`])([^'"`]+)\3\s*\}\)/g,
    replacement: 'apiRequest({ url: $1$2$1, method: $3$4$3 })',
    description: 'Normalize method structure'
  },
  
  // Fix calls with data but wrong structure
  {
    regex: /apiRequest\(\{\s*url:\s*(['"`])([^'"`]+)\1,\s*method:\s*(['"`])([^'"`]+)\3,\s*data:\s*([^}]+)\s*\}\)/g,
    replacement: 'apiRequest({ url: $1$2$1, method: $3$4$3, data: $5 })',
    description: 'Normalize data structure'
  }
];

async function getAllAdminFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  
  async function traverse(currentDir: string) {
    try {
      const items = await readdir(currentDir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = join(currentDir, item.name);
        
        if (item.isDirectory() && !['node_modules', 'dist', 'build'].includes(item.name)) {
          await traverse(fullPath);
        } else if ((item.name.endsWith('.tsx') || item.name.endsWith('.ts')) && 
                   !item.name.includes('.test.') && 
                   !item.name.includes('.spec.')) {
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

async function fixApiCalls(filePath: string): Promise<{ fixed: number; issues: string[] }> {
  const content = await readFile(filePath, 'utf-8');
  let updatedContent = content;
  let fixedCount = 0;
  const issues: string[] = [];
  
  // Apply API call fixes
  for (const fix of API_CALL_FIXES) {
    const matches = updatedContent.match(fix.regex);
    if (matches) {
      updatedContent = updatedContent.replace(fix.regex, fix.replacement);
      fixedCount += matches.length;
    }
  }
  
  // Check for remaining problematic patterns
  const problematicPatterns = [
    /apiRequest\(\s*\{\s*url:.*method:.*\}\s*\)/g,
    /apiRequest\(\s*['"`]/g // String-only calls
  ];
  
  for (const pattern of problematicPatterns) {
    const matches = updatedContent.match(pattern);
    if (matches) {
      issues.push(`Found ${matches.length} potentially problematic apiRequest calls`);
    }
  }
  
  if (fixedCount > 0) {
    await writeFile(filePath, updatedContent);
  }
  
  return { fixed: fixedCount, issues };
}

async function main() {
  console.log(chalk.cyan('🔧 ADMIN API CALL FIXER\n'));
  
  const adminPagesDir = join(process.cwd(), 'client/src/pages/admin');
  const adminComponentsDir = join(process.cwd(), 'client/src/components/admin');
  
  const pageFiles = await getAllAdminFiles(adminPagesDir);
  const componentFiles = await getAllAdminFiles(adminComponentsDir);
  const allFiles = [...pageFiles, ...componentFiles];
  
  console.log(chalk.blue(`Processing ${allFiles.length} admin files...\n`));
  
  let totalFixed = 0;
  let totalFiles = 0;
  const allIssues: string[] = [];
  
  for (const file of allFiles) {
    try {
      const result = await fixApiCalls(file);
      
      if (result.fixed > 0 || result.issues.length > 0) {
        totalFiles++;
        totalFixed += result.fixed;
        
        const relativePath = file.replace(process.cwd(), '');
        
        if (result.fixed > 0) {
          console.log(chalk.green(`✓ Fixed ${result.fixed} API calls in ${relativePath}`));
        }
        
        if (result.issues.length > 0) {
          console.log(chalk.yellow(`⚠ Issues in ${relativePath}:`));
          result.issues.forEach(issue => console.log(chalk.gray(`  - ${issue}`)));
          allIssues.push(...result.issues);
        }
      }
    } catch (error) {
      console.log(chalk.red(`❌ Error processing ${file}: ${error}`));
    }
  }
  
  if (totalFiles === 0) {
    console.log(chalk.green('✅ No API call issues found!'));
  } else {
    console.log(chalk.green(`\n🎉 Summary: Fixed ${totalFixed} API calls across ${totalFiles} files`));
    
    if (allIssues.length > 0) {
      console.log(chalk.yellow('\n📝 Manual review needed for:'));
      [...new Set(allIssues)].forEach(issue => console.log(chalk.gray(`   - ${issue}`)));
    }
    
    console.log(chalk.blue('\n📋 Next steps:'));
    console.log('   1. Run TypeScript compiler to verify fixes');
    console.log('   2. Review any remaining manual issues');
    console.log('   3. Test affected admin functionality');
  }
}

main().catch(console.error);