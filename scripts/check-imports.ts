#!/usr/bin/env tsx
/**
 * Script to validate imports and suggest corrections
 * Run: pnpm tsx scripts/check-imports.ts [file]
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { glob } from 'glob';

const commonMistakes = {
  '@server/core/utils/response-formatter': '@server/core/utils/transformer.helpers',
  '@server/utils/response': '@server/core/utils',
  '@db/types': '@shared/types/ids', // for ID types
};

const validateImports = (filePath: string) => {
  const content = readFileSync(filePath, 'utf-8');
  const importRegex = /import\s+.*\s+from\s+['"](.+)['"]/g;
  const issues: string[] = [];
  
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    
    // Check for common mistakes
    if (commonMistakes[importPath]) {
      issues.push(`${filePath}: Replace "${importPath}" with "${commonMistakes[importPath]}"`);
    }
    
    // Check if importing from a specific file when index exists
    if (importPath.includes('/transformer.helpers') && existsSync(resolve(dirname(importPath), 'index.ts'))) {
      issues.push(`${filePath}: Consider importing from '${dirname(importPath)}' instead`);
    }
  }
  
  return issues;
};

// Main
const files = process.argv[2] 
  ? [process.argv[2]]
  : glob.sync('server/src/**/*.ts', { ignore: '**/node_modules/**' });

const allIssues: string[] = [];

files.forEach(file => {
  const issues = validateImports(file);
  allIssues.push(...issues);
});

if (allIssues.length > 0) {
  console.log('Import issues found:\n');
  allIssues.forEach(issue => console.log(`  - ${issue}`));
  process.exit(1);
} else {
  console.log('✅ All imports look good!');
}