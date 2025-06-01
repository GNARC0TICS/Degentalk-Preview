#!/usr/bin/env tsx
/**
 * Import Checker Utility
 * 
 * Scans the codebase for import statements and validates that they resolve correctly.
 * Helps prevent broken references caused by refactoring or moving files.
 * 
 * Usage:
 *   npx tsx scripts/check-imports.ts [--fix] [--dir=path/to/dir]
 * 
 * Options:
 *   --fix   Attempt to fix broken imports (experimental)
 *   --dir   Specify a subdirectory to check (default: scans client/ and server/)
 */

import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import * as util from 'util';
import { fileURLToPath } from 'url';

const execAsync = util.promisify(exec);

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '..');
const DEFAULT_SCAN_DIRS = ['client/src', 'server/src'];
const ALIAS_MAP = {
  '@/': 'client/src/',
  '@shared/': 'shared/'
};
const EXTENSIONS_TO_CHECK = ['.ts', '.tsx', '.js', '.jsx'];
const EXCLUDE_DIRS = ['node_modules', 'dist', '.git', 'archive'];

// Parse command line arguments
const args = process.argv.slice(2);
const shouldFix = args.includes('--fix');
const dirArg = args.find(arg => arg.startsWith('--dir='));
const scanDirs = dirArg 
  ? [dirArg.replace('--dir=', '')] 
  : DEFAULT_SCAN_DIRS;

// Result tracking
let totalFilesChecked = 0;
let totalImportsChecked = 0;
let brokenImports = 0;
let fixedImports = 0;

// Store broken imports for reporting
interface BrokenImport {
  file: string;
  importPath: string;
  line: number;
  suggestion?: string;
}
const brokenImportsList: BrokenImport[] = [];

// Regular expressions for identifying imports
const importRegex = /import\s+(?:(?:{[\s\S]*?}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"]([^'"]+)['"]/g;
const jsxImportRegex = /import\(['"]([\w@\/\.\-\_]+)['"]\)/g;

/**
 * Check if a file exists at the given path
 */
function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

/**
 * Resolve an import path to an actual file path
 */
function resolveImport(importPath: string, fromFile: string): string | null {
  // Handle alias imports (@/components/... or @shared/...)
  for (const [alias, replacement] of Object.entries(ALIAS_MAP)) {
    if (importPath.startsWith(alias)) {
      // Replace the alias with the actual path
      importPath = path.join(PROJECT_ROOT, importPath.replace(alias, replacement));
      
      // Handle directory imports by looking for index files
      if (fileExists(importPath)) {
        return importPath;
      }
      
      // Try adding extensions if the path doesn't have one
      if (!path.extname(importPath)) {
        for (const ext of EXTENSIONS_TO_CHECK) {
          if (fileExists(`${importPath}${ext}`)) {
            return `${importPath}${ext}`;
          }
          // Check for index files in directories
          if (fileExists(path.join(importPath, `index${ext}`))) {
            return path.join(importPath, `index${ext}`);
          }
        }
      }
      
      return null;
    }
  }
  
  // Handle relative imports
  if (importPath.startsWith('.')) {
    const basePath = path.dirname(fromFile);
    const fullPath = path.resolve(basePath, importPath);
    
    // If the path already has an extension
    if (EXTENSIONS_TO_CHECK.includes(path.extname(importPath))) {
      return fileExists(fullPath) ? fullPath : null;
    }
    
    // Try adding extensions
    for (const ext of EXTENSIONS_TO_CHECK) {
      if (fileExists(`${fullPath}${ext}`)) {
        return `${fullPath}${ext}`;
      }
      // Check for index files in directories
      if (fileExists(path.join(fullPath, `index${ext}`))) {
        return path.join(fullPath, `index${ext}`);
      }
    }
  }
  
  // Handle node_modules imports or built-in modules
  if (!importPath.startsWith('@') || (importPath.startsWith('@') && !importPath.startsWith('@/'))) {
    // Check if package exists in node_modules
    try {
      // For scoped packages like @tanstack/react-query
      if (importPath.startsWith('@')) {
        const [scope, pkg] = importPath.split('/');
        const scopedPackageJsonPath = path.join(PROJECT_ROOT, 'node_modules', scope, pkg, 'package.json');
        if (fileExists(scopedPackageJsonPath)) {
          return 'node_modules';
        }
      } else {
        // For regular packages
        const packageName = importPath.split('/')[0];
        const packageJsonPath = path.join(PROJECT_ROOT, 'node_modules', packageName, 'package.json');
        if (fileExists(packageJsonPath)) {
          return 'node_modules';
        }
      }
    } catch (error) {
      // Ignore errors during package resolution
    }
    
    // As a fallback, consider common NPM package patterns valid
    // This avoids having to do dynamic imports which are async and more complex
    if (/^[a-zA-Z0-9@\/-]+$/.test(importPath)) {
      // Check if it's in package.json dependencies
      try {
        const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
        if (fileExists(packageJsonPath)) {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          const allDeps = {
            ...packageJson.dependencies || {},
            ...packageJson.devDependencies || {},
            ...packageJson.peerDependencies || {},
            ...packageJson.optionalDependencies || {}
          };
          
          // For scoped packages
          if (importPath.startsWith('@')) {
            const [scope, pkg] = importPath.split('/');
            const packageName = `${scope}/${pkg}`;
            if (Object.keys(allDeps).includes(packageName)) {
              return 'node_modules';
            }
          } 
          // For regular packages
          else {
            const packageName = importPath.split('/')[0];
            if (Object.keys(allDeps).includes(packageName)) {
              return 'node_modules';
            }
          }
        }
      } catch (error) {
        // Ignore errors during package.json parsing
      }
      
      // If all else fails, most third-party imports are likely valid
      // This reduces false positives but may miss some broken imports
      return 'node_modules';
    }
  }
  
  return null;
}

/**
 * Suggest a fix for a broken import
 */
function suggestFix(importPath: string, fromFile: string): string | undefined {
  // For alias imports that might be broken
  if (importPath.startsWith('@/')) {
    // Check if the file exists in a similar location but with a different structure
    const relativePath = importPath.replace('@/', '');
    
    // Try different common patterns
    const patterns = [
      path.join(PROJECT_ROOT, 'client/src', relativePath),
      path.join(PROJECT_ROOT, 'client/src/components', path.basename(relativePath)),
      path.join(PROJECT_ROOT, 'client/src/features', path.dirname(relativePath).split('/')[0], 'components', path.basename(relativePath)),
      // Try with different extensions
      ...EXTENSIONS_TO_CHECK.map(ext => path.join(PROJECT_ROOT, 'client/src', `${relativePath}${ext}`))
    ];
    
    for (const pattern of patterns) {
      if (fileExists(pattern)) {
        // Convert back to an import path
        if (pattern.startsWith(path.join(PROJECT_ROOT, 'client/src/'))) {
          return `@/${pattern.replace(path.join(PROJECT_ROOT, 'client/src/'), '')}`;
        }
      }
    }
    
    // Try to find the file anywhere in the project
    try {
      const fileName = path.basename(importPath);
      const { stdout } = execAsync(`find ${PROJECT_ROOT}/client/src -name "${fileName}*" -type f | grep -v "node_modules"`);
      if (stdout && stdout.trim()) {
        const foundPath = stdout.trim().split('\n')[0];
        const relativePath = foundPath.replace(path.join(PROJECT_ROOT, 'client/src/'), '');
        return `@/${relativePath}`;
      }
    } catch (error) {
      // Ignore find command errors
    }
  }
  
  // For relative imports, try to find a relative path that works
  if (importPath.startsWith('.')) {
    const fromDir = path.dirname(fromFile);
    const fileName = path.basename(importPath);
    
    // Try to find the file with different relative paths
    try {
      const { stdout } = execAsync(`find ${fromDir} -name "${fileName}*" -type f | grep -v "node_modules"`);
      if (stdout && stdout.trim()) {
        const foundPath = stdout.trim().split('\n')[0];
        // Calculate relative path
        return path.relative(fromDir, foundPath);
      }
    } catch (error) {
      // Ignore find command errors
    }
    
    // If the file has 'index' in its name but doesn't import index
    if (fromFile.includes('index') && !importPath.includes('index')) {
      return importPath.replace('./', '../');
    }
  }
  
  return undefined;
}

/**
 * Check imports in a file
 */
async function checkImportsInFile(filePath: string): Promise<void> {
  try {
    totalFilesChecked++;
    const content = fs.readFileSync(filePath, 'utf8');
    const fileLines = content.split('\n');
    
    // Find all import statements
    let match;
    const importMatches = [];
    
    // Check standard imports
    while ((match = importRegex.exec(content)) !== null) {
      importMatches.push({
        path: match[1],
        fullMatch: match[0],
        index: match.index
      });
    }
    
    // Check dynamic imports
    while ((match = jsxImportRegex.exec(content)) !== null) {
      importMatches.push({
        path: match[1],
        fullMatch: match[0],
        index: match.index
      });
    }
    
    // Process found imports
    for (const importMatch of importMatches) {
      totalImportsChecked++;
      const importPath = importMatch.path;
      
      // Skip package imports (from node_modules)
      if (!importPath.startsWith('@') && !importPath.startsWith('.')) {
        continue;
      }
      
      // Find line number
      let lineNumber = 0;
      let charCount = 0;
      for (let i = 0; i < fileLines.length; i++) {
        charCount += fileLines[i].length + 1; // +1 for newline
        if (charCount > importMatch.index) {
          lineNumber = i + 1;
          break;
        }
      }
      
      // Check if the import resolves
      const resolvedPath = resolveImport(importPath, filePath);
      if (!resolvedPath) {
        brokenImports++;
        
        // Try to suggest a fix
        const suggestion = suggestFix(importPath, filePath);
        
        brokenImportsList.push({
          file: filePath,
          importPath,
          line: lineNumber,
          suggestion
        });
        
        // Apply fix if --fix flag is used and we have a suggestion
        if (shouldFix && suggestion) {
          // Read the file again to avoid issues with multiple fixes
          let fileContent = fs.readFileSync(filePath, 'utf8');
          
          // Replace the import path
          fileContent = fileContent.replace(
            importMatch.fullMatch,
            importMatch.fullMatch.replace(importPath, suggestion)
          );
          
          fs.writeFileSync(filePath, fileContent);
          fixedImports++;
          
          console.log(`🔧 Fixed: ${path.relative(PROJECT_ROOT, filePath)}:${lineNumber} - '${importPath}' → '${suggestion}'`);
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error checking imports in ${filePath}:`, error);
  }
}

/**
 * Recursively check all files in a directory
 */
async function checkDirectory(dir: string): Promise<void> {
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      
      // Skip excluded directories
      if (EXCLUDE_DIRS.some(exclude => itemPath.includes(exclude))) {
        continue;
      }
      
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        await checkDirectory(itemPath);
      } else if (stats.isFile() && EXTENSIONS_TO_CHECK.includes(path.extname(itemPath))) {
        await checkImportsInFile(itemPath);
      }
    }
  } catch (error) {
    console.error(`❌ Error checking directory ${dir}:`, error);
  }
}

/**
 * Print results
 */
function printResults(): void {
  console.log('\n========== Import Check Results ==========');
  console.log(`📊 Files checked: ${totalFilesChecked}`);
  console.log(`📊 Imports checked: ${totalImportsChecked}`);
  console.log(`❌ Broken imports: ${brokenImports}`);
  
  if (shouldFix) {
    console.log(`🔧 Imports fixed: ${fixedImports}`);
  }
  
  if (brokenImportsList.length > 0) {
    console.log('\n🔍 Broken Imports Details:');
    
    for (const brokenImport of brokenImportsList) {
      const relativePath = path.relative(PROJECT_ROOT, brokenImport.file);
      console.log(`  • ${relativePath}:${brokenImport.line} - '${brokenImport.importPath}'`);
      
      if (brokenImport.suggestion) {
        console.log(`    → Suggestion: '${brokenImport.suggestion}'`);
      }
    }
    
    if (!shouldFix) {
      console.log('\n💡 Tip: Run with --fix to automatically fix imports where possible');
    }
  } else {
    console.log('\n✅ All imports are valid!');
  }
}

/**
 * Main function
 */
async function main() {
  console.log('📋 Import Checker Utility');
  console.log(`🔍 Scanning directories: ${scanDirs.join(', ')}`);
  
  // Process each specified directory
  for (const dir of scanDirs) {
    const fullPath = path.join(PROJECT_ROOT, dir);
    if (fs.existsSync(fullPath)) {
      console.log(`📂 Checking ${dir}...`);
      await checkDirectory(fullPath);
    } else {
      console.error(`❌ Directory not found: ${dir}`);
    }
  }
  
  // Print results
  printResults();
  
  // Exit with appropriate code
  process.exit(brokenImports > 0 && !shouldFix ? 1 : 0);
}

// Run the script
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
}); 