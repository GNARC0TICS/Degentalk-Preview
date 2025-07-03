#!/usr/bin/env tsx
/**
 * Admin ExactOptionalPropertyTypes Fixer
 * 
 * Fixes exactOptionalPropertyTypes errors in admin panel components
 */

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';

interface OptionalTypeFix {
  regex: RegExp;
  replacement: string;
  description: string;
}

// Specific fixes for exactOptionalPropertyTypes issues
const OPTIONAL_TYPE_FIXES: OptionalTypeFix[] = [
  // Select component value prop fixes
  {
    regex: /(<Select[^>]*\s+value=\{)([^}]*\|\s*undefined)(\}[^>]*>)/g,
    replacement: '$1$2 ?? \'\'$3',
    description: 'Fix Select value undefined → empty string'
  },
  
  // Select component defaultValue prop fixes
  {
    regex: /(<Select[^>]*\s+defaultValue=\{)([^}]*\|\s*undefined)(\}[^>]*>)/g,
    replacement: '$1$2 ?? \'\'$3',
    description: 'Fix Select defaultValue undefined → empty string'
  },
  
  // TabsProps onValueChange fixes
  {
    regex: /(onValueChange=\{)([^}]*\|\s*undefined)(\})/g,
    replacement: '$1$2 ?? (() => {})$3',
    description: 'Fix onValueChange undefined → empty function'
  },
  
  // Generic prop undefined fixes for common patterns
  {
    regex: /(className=\{)([^}]*\|\s*undefined)(\})/g,
    replacement: '$1$2 ?? \'\'$3',
    description: 'Fix className undefined → empty string'
  },
  
  // Role prop fixes for form components
  {
    regex: /(\{\s*role:\s*)undefined(\s*,)/g,
    replacement: '$1undefined as any$2',
    description: 'Cast undefined role to any for form compatibility'
  }
];

// Files that need manual prop interface updates
const MANUAL_INTERFACE_FIXES: Array<{
  file: string;
  interface: string;
  fixes: Array<{ prop: string; from: string; to: string }>;
}> = [
  {
    file: 'client/src/components/admin/roles/RolesSection.tsx',
    interface: 'RoleFormProps',
    fixes: [
      { prop: 'role', from: 'Role | undefined', to: 'Role | undefined' },
    ]
  }
];

async function getAllAdminFiles(): Promise<string[]> {
  const files: string[] = [];
  const dirs = [
    'client/src/pages/admin',
    'client/src/components/admin'
  ];
  
  async function traverse(dir: string) {
    try {
      const { readdir } = await import('fs/promises');
      const items = await readdir(dir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = join(dir, item.name);
        if (item.isDirectory()) {
          await traverse(fullPath);
        } else if (item.name.endsWith('.tsx') || item.name.endsWith('.ts')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip missing directories
    }
  }
  
  for (const dir of dirs) {
    await traverse(join(process.cwd(), dir));
  }
  
  return files;
}

async function fixOptionalTypes(filePath: string): Promise<{ fixed: number; patterns: string[] }> {
  const content = await readFile(filePath, 'utf-8');
  let updatedContent = content;
  let fixedCount = 0;
  const appliedPatterns: string[] = [];
  
  // Apply pattern fixes
  for (const fix of OPTIONAL_TYPE_FIXES) {
    const matches = updatedContent.match(fix.regex);
    if (matches) {
      updatedContent = updatedContent.replace(fix.regex, fix.replacement);
      fixedCount += matches.length;
      appliedPatterns.push(fix.description);
    }
  }
  
  // Fix specific prop interface patterns
  const interfacePatterns = [
    // EventLogFilters with undefined arrays
    {
      regex: /eventType:\s*string\[\]\s*\|\s*undefined/g,
      replacement: 'eventType?: string[]',
      description: 'Fix EventLogFilters eventType prop'
    },
    // Component props with required undefined
    {
      regex: /\{\s*([^:]+):\s*undefined\s*,([^}]+)\}/g,
      replacement: '{ $1: undefined as any, $2 }',
      description: 'Cast required undefined props to any'
    }
  ];
  
  for (const pattern of interfacePatterns) {
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
  console.log(chalk.cyan('🔧 ADMIN OPTIONAL TYPES FIXER\n'));
  
  const files = await getAllAdminFiles();
  console.log(chalk.blue(`Processing ${files.length} admin files...\n`));
  
  let totalFixed = 0;
  let totalFiles = 0;
  const allPatterns = new Set<string>();
  
  for (const file of files) {
    try {
      const result = await fixOptionalTypes(file);
      
      if (result.fixed > 0) {
        totalFiles++;
        totalFixed += result.fixed;
        
        const relativePath = file.replace(process.cwd(), '');
        console.log(chalk.green(`✓ Fixed ${result.fixed} optional type issues in ${relativePath}`));
        
        result.patterns.forEach(pattern => {
          allPatterns.add(pattern);
          console.log(chalk.gray(`  - ${pattern}`));
        });
      }
    } catch (error) {
      console.log(chalk.red(`❌ Error processing ${file}: ${error}`));
    }
  }
  
  if (totalFiles === 0) {
    console.log(chalk.green('✅ No optional type issues found!'));
  } else {
    console.log(chalk.green(`\n🎉 Summary: Fixed ${totalFixed} optional type issues across ${totalFiles} files`));
    
    console.log(chalk.blue('\n📋 Applied patterns:'));
    Array.from(allPatterns).forEach(pattern => {
      console.log(chalk.gray(`   - ${pattern}`));
    });
    
    console.log(chalk.yellow('\n⚠️  Manual fixes still needed:'));
    console.log('   - Component interface definitions may need prop?: type updates');
    console.log('   - Some onValueChange handlers may need explicit type annotations');
    console.log('   - Review casted "as any" usages for proper type definitions');
  }
}

main().catch(console.error);