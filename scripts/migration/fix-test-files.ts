#!/usr/bin/env tsx
/**
 * Test File UUID Fixer
 * 
 * Updates test files to use UUID patterns instead of integer IDs
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';

interface TestIssue {
  file: string;
  line: number;
  issue: string;
  suggestion: string;
}

// Patterns to fix in test files
const TEST_FIXES = [
  {
    regex: /id:\s*(\d+)/g,
    replacement: 'id: mockUuid()',
    description: 'Replace integer ID with UUID mock'
  },
  {
    regex: /userId:\s*(\d+)/g,
    replacement: 'userId: mockUserId()',
    description: 'Replace integer userId with UUID mock'
  },
  {
    regex: /threadId:\s*(\d+)/g,
    replacement: 'threadId: mockThreadId()',
    description: 'Replace integer threadId with UUID mock'
  },
  {
    regex: /postId:\s*(\d+)/g,
    replacement: 'postId: mockPostId()',
    description: 'Replace integer postId with UUID mock'
  },
  {
    regex: /missionId:\s*(\d+)/g,
    replacement: 'missionId: mockMissionId()',
    description: 'Replace integer missionId with UUID mock'
  },
  {
    regex: /achievementId:\s*(\d+)/g,
    replacement: 'achievementId: mockAchievementId()',
    description: 'Replace integer achievementId with UUID mock'
  }
];

// Test directories to process
const TEST_DIRECTORIES = [
  'server/test',
  'server/src',
  'client/src/__tests__'
];

async function getAllTestFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  
  async function traverse(currentDir: string) {
    try {
      const items = await readdir(currentDir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = join(currentDir, item.name);
        
        if (item.isDirectory() && !item.name.includes('node_modules')) {
          await traverse(fullPath);
        } else if ((item.name.endsWith('.test.ts') || item.name.endsWith('.spec.ts')) && !item.name.includes('.d.ts')) {
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

function scanTestFile(content: string, filePath: string): TestIssue[] {
  const issues: TestIssue[] = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for integer ID patterns in mock data
    for (const fix of TEST_FIXES) {
      const matches = line.match(fix.regex);
      if (matches) {
        issues.push({
          file: filePath,
          line: i + 1,
          issue: fix.description,
          suggestion: line.replace(fix.regex, fix.replacement)
        });
      }
    }
  }
  
  return issues;
}

async function fixTestFile(filePath: string): Promise<{ fixed: number; issues: TestIssue[] }> {
  const content = await readFile(filePath, 'utf-8');
  const issues = scanTestFile(content, filePath);
  
  if (issues.length === 0) {
    return { fixed: 0, issues: [] };
  }
  
  let updatedContent = content;
  let fixed = 0;
  
  // Apply fixes
  for (const fix of TEST_FIXES) {
    if (updatedContent.match(fix.regex)) {
      updatedContent = updatedContent.replace(fix.regex, fix.replacement);
      fixed++;
    }
  }
  
  // Add import for mock UUID utilities if we made changes
  if (fixed > 0 && !updatedContent.includes('mock-uuid')) {
    const importIndex = updatedContent.indexOf('import');
    if (importIndex !== -1) {
      const insertPoint = updatedContent.indexOf('\n', importIndex) + 1;
      updatedContent = updatedContent.slice(0, insertPoint) + 
        'import { mockUuid, mockUserId, mockThreadId, mockPostId, mockMissionId, mockAchievementId, TEST_UUIDS } from "@shared/test-utils/mock-uuid";\n' + 
        updatedContent.slice(insertPoint);
    }
  }
  
  // Update type imports to use branded types
  if (fixed > 0) {
    // Add UserId, ThreadId etc. imports if they're being used
    if (updatedContent.includes('mockUserId') && !updatedContent.includes('UserId')) {
      updatedContent = updatedContent.replace(
        'import { mockUuid',
        'import type { UserId, ThreadId, PostId } from "@shared/types";\nimport { mockUuid'
      );
    }
  }
  
  if (fixed > 0) {
    await writeFile(filePath, updatedContent);
  }
  
  return { fixed, issues };
}

async function main() {
  console.log(chalk.cyan('🧪 TEST FILE UUID FIXER\n'));
  
  let totalFixed = 0;
  let totalFiles = 0;
  let totalIssues = 0;
  
  for (const testDir of TEST_DIRECTORIES) {
    const fullDir = join(process.cwd(), testDir);
    const files = await getAllTestFiles(fullDir);
    
    if (files.length === 0) {
      console.log(chalk.gray(`No test files found in ${testDir}`));
      continue;
    }
    
    console.log(chalk.blue(`Processing ${files.length} test files in ${testDir}...`));
    
    for (const file of files) {
      try {
        const result = await fixTestFile(file);
        
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
    console.log(chalk.green('✅ No test files with integer ID issues found!'));
  } else {
    console.log(chalk.green(`\n🎉 Summary: Fixed ${totalFixed} patterns across ${totalFiles} files`));
    console.log(chalk.yellow(`   Found ${totalIssues} total issues`));
    
    console.log(chalk.yellow('\n📝 Next steps:'));
    console.log('   1. Review the changes to ensure test logic is still valid');
    console.log('   2. Update any hardcoded assertions that expect specific integer IDs');
    console.log('   3. Run test suites to ensure they pass with UUID mocks');
    console.log('   4. Consider using TEST_UUIDS constants for predictable test scenarios');
  }
}

main().catch(console.error);