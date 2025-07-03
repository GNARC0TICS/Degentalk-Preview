#!/usr/bin/env tsx
/**
 * Integer ID Pattern Fixer
 * 
 * Scans and fixes problematic integer ID patterns to enforce UUID-first architecture:
 * 1. Number(userId) / parseInt(userId) casts in route handlers
 * 2. z.number() schemas for ID validation
 * 3. Integer literals in seed/fixture data
 * 4. Legacy helper functions
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';

interface IDPattern {
  file: string;
  line: number;
  content: string;
  pattern: string;
  suggestion: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

interface FixResult {
  file: string;
  patterns: IDPattern[];
  fixed: number;
  skipped: number;
}

// Patterns to detect and fix
const ID_PATTERNS = [
  // Critical: Direct ID parsing
  {
    regex: /Number\s*\(\s*([^)]*[Ii]d[^)]*)\s*\)/g,
    replacement: '$1', // Remove Number() wrapper
    message: 'Remove Number() cast from UUID',
    priority: 'critical' as const
  },
  {
    regex: /parseInt\s*\(\s*([^)]*[Ii]d[^)]*)\s*\)/g,
    replacement: '$1', // Remove parseInt() wrapper  
    message: 'Remove parseInt() cast from UUID',
    priority: 'critical' as const
  },
  
  // High: Zod schema issues
  {
    regex: /z\.number\(\)\.?[^.]*\.?[^.]*\s*\/\/.*[Ii]d/g,
    replacement: 'z.string().uuid()',
    message: 'Change z.number() to z.string().uuid() for ID validation',
    priority: 'high' as const
  },
  {
    regex: /(\w*[Ii]d):\s*z\.number\(\)/g,
    replacement: '$1: z.string().uuid()',
    message: 'Change z.number() to z.string().uuid() for ID field',
    priority: 'high' as const
  },
  
  // Medium: Common ID field patterns
  {
    regex: /roomId:\s*z\.number\(\)/g,
    replacement: 'roomId: z.string().uuid()',
    message: 'Change roomId to UUID validation',
    priority: 'medium' as const
  },
  {
    regex: /replyTo:\s*z\.number\(\)/g,
    replacement: 'replyTo: z.string().uuid()',
    message: 'Change replyTo to UUID validation',
    priority: 'medium' as const
  },
  {
    regex: /userId:\s*z\.number\(\)/g,
    replacement: 'userId: z.string().uuid()',
    message: 'Change userId to UUID validation',
    priority: 'medium' as const
  }
];

// Files to skip (external dependencies, build artifacts, etc.)
const SKIP_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  '__tests__',
  '.test.',
  '.spec.',
  'coverage'
];

async function getAllFiles(dir: string, extensions: string[] = ['.ts', '.js']): Promise<string[]> {
  const files: string[] = [];
  
  async function traverse(currentDir: string) {
    const items = await readdir(currentDir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = join(currentDir, item.name);
      
      // Skip unwanted directories
      if (item.isDirectory()) {
        if (!SKIP_PATTERNS.some(pattern => item.name.includes(pattern))) {
          await traverse(fullPath);
        }
      } else if (extensions.some(ext => item.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  await traverse(dir);
  return files;
}

function scanFileForPatterns(content: string, filePath: string): IDPattern[] {
  const patterns: IDPattern[] = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    for (const pattern of ID_PATTERNS) {
      const matches = [...line.matchAll(pattern.regex)];
      
      for (const match of matches) {
        patterns.push({
          file: filePath.replace(process.cwd(), ''),
          line: i + 1,
          content: line.trim(),
          pattern: match[0],
          suggestion: line.replace(pattern.regex, pattern.replacement),
          priority: pattern.priority
        });
      }
    }
  }
  
  return patterns;
}

async function fixFile(filePath: string): Promise<FixResult> {
  const content = await readFile(filePath, 'utf-8');
  const foundPatterns = scanFileForPatterns(content, filePath);
  
  if (foundPatterns.length === 0) {
    return { file: filePath, patterns: [], fixed: 0, skipped: 0 };
  }
  
  let updatedContent = content;
  let fixed = 0;
  let skipped = 0;
  
  // Apply fixes in order of priority
  const sortedPatterns = foundPatterns.sort((a, b) => {
    const priorities = { critical: 4, high: 3, medium: 2, low: 1 };
    return priorities[b.priority] - priorities[a.priority];
  });
  
  for (const patternInfo of ID_PATTERNS) {
    if (updatedContent.match(patternInfo.regex)) {
      updatedContent = updatedContent.replace(patternInfo.regex, patternInfo.replacement);
      fixed++;
    }
  }
  
  // Only write if changes were made
  if (fixed > 0) {
    await writeFile(filePath, updatedContent);
  }
  
  return {
    file: filePath.replace(process.cwd(), ''),
    patterns: foundPatterns,
    fixed,
    skipped
  };
}

async function scanDirectory(dirPath: string): Promise<IDPattern[]> {
  console.log(chalk.blue(`🔍 Scanning ${dirPath} for integer ID patterns...\n`));
  
  const files = await getAllFiles(dirPath);
  const allPatterns: IDPattern[] = [];
  
  for (const file of files) {
    const content = await readFile(file, 'utf-8');
    const patterns = scanFileForPatterns(content, file);
    allPatterns.push(...patterns);
  }
  
  return allPatterns;
}

async function fixDirectory(dirPath: string): Promise<FixResult[]> {
  console.log(chalk.blue(`🔧 Fixing integer ID patterns in ${dirPath}...\n`));
  
  const files = await getAllFiles(dirPath);
  const results: FixResult[] = [];
  
  for (const file of files) {
    try {
      const result = await fixFile(file);
      if (result.patterns.length > 0) {
        results.push(result);
      }
    } catch (error) {
      console.log(chalk.red(`❌ Error processing ${file}: ${error}`));
    }
  }
  
  return results;
}

function displayResults(patterns: IDPattern[], mode: 'scan' | 'fix' = 'scan') {
  if (patterns.length === 0) {
    console.log(chalk.green('✅ No integer ID patterns found!'));
    return;
  }
  
  // Group by priority
  const grouped = new Map<string, IDPattern[]>();
  for (const pattern of patterns) {
    if (!grouped.has(pattern.priority)) {
      grouped.set(pattern.priority, []);
    }
    grouped.get(pattern.priority)!.push(pattern);
  }
  
  console.log(chalk.red(`🚨 Found ${patterns.length} integer ID patterns:`));
  console.log();
  
  const priorityOrder: Array<'critical' | 'high' | 'medium' | 'low'> = ['critical', 'high', 'medium', 'low'];
  const priorityColors = {
    critical: chalk.red,
    high: chalk.yellow,
    medium: chalk.blue,
    low: chalk.gray
  };
  
  for (const priority of priorityOrder) {
    const priorityPatterns = grouped.get(priority) || [];
    if (priorityPatterns.length === 0) continue;
    
    console.log(priorityColors[priority](`\n${priority.toUpperCase()} (${priorityPatterns.length} issues):`));
    
    for (const pattern of priorityPatterns.slice(0, 10)) { // Limit display
      console.log(`  📁 ${pattern.file}:${pattern.line}`);
      console.log(`     ${chalk.red('❌')} ${pattern.content}`);
      if (mode === 'scan') {
        console.log(`     ${chalk.green('✅')} ${pattern.suggestion}`);
      }
      console.log();
    }
    
    if (priorityPatterns.length > 10) {
      console.log(`     ... and ${priorityPatterns.length - 10} more`);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const mode = args.includes('--fix') ? 'fix' : 'scan';
  const serverDir = join(process.cwd(), 'server/src');
  
  if (mode === 'scan') {
    console.log(chalk.cyan('🎯 INTEGER ID PATTERN SCANNER\n'));
    const patterns = await scanDirectory(serverDir);
    displayResults(patterns, 'scan');
    
    if (patterns.length > 0) {
      console.log(chalk.yellow(`\n💡 Run with --fix flag to automatically fix these patterns`));
    }
  } else {
    console.log(chalk.cyan('🎯 INTEGER ID PATTERN FIXER\n'));
    const results = await fixDirectory(serverDir);
    
    let totalFixed = 0;
    let totalFiles = 0;
    
    for (const result of results) {
      if (result.fixed > 0) {
        totalFiles++;
        totalFixed += result.fixed;
        console.log(chalk.green(`✓ Fixed ${result.fixed} patterns in ${result.file}`));
      }
    }
    
    console.log(chalk.green(`\n🎉 Summary: Fixed ${totalFixed} patterns across ${totalFiles} files`));
    
    if (totalFixed > 0) {
      console.log(chalk.yellow(`\n⚠️  Next steps:`));
      console.log(`   1. Review changes and run tests`);
      console.log(`   2. Update any related type definitions`);
      console.log(`   3. Check for runtime errors in affected routes`);
    }
  }
}

main().catch(console.error);