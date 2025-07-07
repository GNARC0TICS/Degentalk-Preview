#!/usr/bin/env ts-node
/**
 * Codemod to fix ID validation patterns
 * 
 * Automatically fixes common patterns:
 * 1. Number(userId) validation → isValidId(userId)
 * 2. parseInt(req.params.userId) → req.params.userId as UserId
 * 3. Local type declarations → proper imports
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

interface Fix {
  file: string;
  line: number;
  oldPattern: string;
  newPattern: string;
  type: 'validation' | 'parsing' | 'import';
}

interface FixResult {
  totalFiles: number;
  filesChanged: number;
  totalFixes: number;
  fixes: Fix[];
}

async function getAllTsFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    if (entry.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
      files.push(...await getAllTsFiles(fullPath));
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function generateValidationFix(content: string, filePath: string): Fix[] {
  const fixes: Fix[] = [];
  const lines = content.split('\n');
  
  // Fix 1: Number(userId) validation patterns
  const numberValidationRegex = /(!userId\s*\|\|\s*)?isNaN\(Number\(([^)]+)\)\)(\s*\|\|\s*Number\([^)]+\)\s*<=\s*0)?/g;
  
  lines.forEach((line, index) => {
    const match = line.match(numberValidationRegex);
    if (match) {
      const variableName = match[2] || 'userId';
      const newPattern = line.replace(numberValidationRegex, `!isValidId(${variableName})`);
      
      fixes.push({
        file: filePath,
        line: index + 1,
        oldPattern: line.trim(),
        newPattern: newPattern.trim(),
        type: 'validation'
      });
    }
  });
  
  // Fix 2: parseInt patterns for ID parameters
  const parseIntRegex = /parseInt\((req\.params\.\w+|req\.query\.\w+)\)/g;
  
  lines.forEach((line, index) => {
    const match = line.match(parseIntRegex);
    if (match) {
      const newPattern = line.replace(parseIntRegex, (match, paramPath) => {
        const varName = paramPath.split('.').pop();
        return `${paramPath} as UserId`;
      });
      
      fixes.push({
        file: filePath,
        line: index + 1,
        oldPattern: line.trim(),
        newPattern: newPattern.trim(),
        type: 'parsing'
      });
    }
  });
  
  return fixes;
}

function generateImportFix(content: string, filePath: string): Fix[] {
  const fixes: Fix[] = [];
  const needsIsValidId = content.includes('isValidId') && !content.includes("import { isValidId }") && !content.includes("from '@shared/utils/id'");
  const needsUserId = content.includes('as UserId') && !content.includes("import type { UserId }") && !content.includes("from '@shared/types/ids'");
  
  if (needsIsValidId || needsUserId) {
    let importLine = '';
    const imports = [];
    
    if (needsIsValidId) imports.push('isValidId');
    if (needsUserId) imports.push('UserId');
    
    if (needsIsValidId) {
      importLine += `import { isValidId } from '@shared/utils/id';\n`;
    }
    if (needsUserId) {
      importLine += `import type { UserId } from '@shared/types/ids';\n`;
    }
    
    fixes.push({
      file: filePath,
      line: 1,
      oldPattern: '// Missing imports',
      newPattern: importLine.trim(),
      type: 'import'
    });
  }
  
  return fixes;
}

async function fixFile(filePath: string): Promise<Fix[]> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const allFixes: Fix[] = [];
    
    // Generate fixes
    allFixes.push(...generateValidationFix(content, filePath));
    allFixes.push(...generateImportFix(content, filePath));
    
    if (allFixes.length === 0) {
      return [];
    }
    
    // Apply fixes to content
    let fixedContent = content;
    const lines = fixedContent.split('\n');
    
    // Sort fixes by line number (reverse order to avoid line number shifts)
    const sortedFixes = allFixes.sort((a, b) => b.line - a.line);
    
    for (const fix of sortedFixes) {
      if (fix.type === 'import') {
        // Add imports at the top after existing imports
        const importLines = lines.slice(0, 10).findIndex(line => 
          line.startsWith('import') && !lines[lines.findIndex(l => l === line) + 1]?.startsWith('import')
        );
        const insertIndex = importLines >= 0 ? importLines + 1 : 0;
        lines.splice(insertIndex, 0, fix.newPattern);
      } else {
        // Replace line content
        lines[fix.line - 1] = lines[fix.line - 1].replace(fix.oldPattern, fix.newPattern);
      }
    }
    
    // Write fixed content back
    await fs.writeFile(filePath, lines.join('\n'));
    
    return allFixes;
  } catch (error) {
    console.error(chalk.red(`Error fixing file ${filePath}:`), error);
    return [];
  }
}

async function fixIdPatterns(): Promise<FixResult> {
  console.log(chalk.blue('🔧 Fixing ID validation and parsing patterns...\n'));
  
  const serverDir = join(process.cwd(), 'server/src');
  const clientDir = join(process.cwd(), 'client/src');
  const sharedDir = join(process.cwd(), 'shared');
  
  let allFiles: string[] = [];
  
  try {
    allFiles.push(...await getAllTsFiles(serverDir));
  } catch (error) {
    console.log(chalk.yellow('Server directory not found, skipping...'));
  }
  
  try {
    allFiles.push(...await getAllTsFiles(clientDir));
  } catch (error) {
    console.log(chalk.yellow('Client directory not found, skipping...'));
  }
  
  try {
    allFiles.push(...await getAllTsFiles(sharedDir));
  } catch (error) {
    console.log(chalk.yellow('Shared directory not found, skipping...'));
  }
  
  const result: FixResult = {
    totalFiles: allFiles.length,
    filesChanged: 0,
    totalFixes: 0,
    fixes: []
  };
  
  for (const file of allFiles) {
    const fixes = await fixFile(file);
    if (fixes.length > 0) {
      result.filesChanged++;
      result.totalFixes += fixes.length;
      result.fixes.push(...fixes);
      
      const relativeFile = file.replace(process.cwd(), '');
      console.log(chalk.green(`✅ Fixed ${fixes.length} issues in ${relativeFile}`));
    }
  }
  
  return result;
}

function displayResults(result: FixResult): void {
  console.log(chalk.green('\n🎯 ID Pattern Fix Results\n'));
  
  console.log(chalk.cyan('📊 Summary:'));
  console.log(`  Total files scanned: ${result.totalFiles}`);
  console.log(`  Files changed: ${result.filesChanged}`);
  console.log(`  Total fixes applied: ${result.totalFixes}\n`);
  
  if (result.totalFixes === 0) {
    console.log(chalk.green('✅ No ID pattern issues found to fix!'));
    return;
  }
  
  // Group by fix type
  const groupedFixes = {
    validation: result.fixes.filter(f => f.type === 'validation'),
    parsing: result.fixes.filter(f => f.type === 'parsing'),
    import: result.fixes.filter(f => f.type === 'import')
  };
  
  for (const [type, fixes] of Object.entries(groupedFixes)) {
    if (fixes.length === 0) continue;
    
    console.log(chalk.blue(`🔧 ${type.toUpperCase()} Fixes (${fixes.length}):`));
    
    // Show first 5 examples
    const examples = fixes.slice(0, 5);
    for (const fix of examples) {
      const relativeFile = fix.file.replace(process.cwd(), '');
      console.log(`  ${chalk.gray('●')} ${relativeFile}:${fix.line}`);
      console.log(`    ${chalk.red('- ' + fix.oldPattern)}`);
      console.log(`    ${chalk.green('+ ' + fix.newPattern)}\n`);
    }
    
    if (fixes.length > 5) {
      console.log(`  ${chalk.gray(`... and ${fixes.length - 5} more`)}\n`);
    }
  }
}

async function main() {
  try {
    const result = await fixIdPatterns();
    displayResults(result);
    
    if (result.totalFixes > 0) {
      console.log(chalk.yellow('⚠️  Please review the changes and run your linter/formatter.'));
      console.log(chalk.yellow('⚠️  Some manual fixes may still be required for complex patterns.'));
    }
    
  } catch (error) {
    console.error(chalk.red('Error during fix:'), error);
    process.exit(1);
  }
}

// Add command line argument parsing
const args = process.argv.slice(2);
const shouldRun = args.includes('--apply') || args.includes('--dry-run');

if (!shouldRun) {
  console.log(chalk.yellow('Usage:'));
  console.log('  --apply    Apply fixes to files');
  console.log('  --dry-run  Show what would be fixed (coming soon)');
  console.log('\nExample: ts-node fix-id-validation-patterns.ts --apply');
  process.exit(0);
}

if (args.includes('--apply')) {
  main();
}