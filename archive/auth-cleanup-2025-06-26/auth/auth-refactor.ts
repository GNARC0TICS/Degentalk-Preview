import * as fs from 'fs';
import * as path from 'path';

// Define paths
const rootDir = process.cwd();
const serverDir = path.join(rootDir, 'server');

// Get all TypeScript files recursively
function getAllFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and certain directories
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        getAllFiles(filePath, fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Replace import statements in file
function replaceImports(filePath: string): void {
  console.log(`Processing ${filePath}...`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    
    // Replace imports from deprecated path
    const deprecatedImportRegex = /import\s*{\s*([^}]*)\s*}\s*from\s+[\'\"](\.\.[\/\\])*middleware\/auth[\'\"]/g;
    const canonicalImportPath = '@server/src/domains/auth/middleware/auth.middleware';
    
    // Check for deprecated imports
    if (content.includes('middleware/auth')) {
      // Replace with canonical import path
      content = content.replace(deprecatedImportRegex, (match, importNames) => {
        return `import { ${importNames} } from '${canonicalImportPath}'`;
      });
      
      // Replace any aliased imports (e.g., isAuthenticated as authMiddleware)
      const aliasedAuthRegex = /import\s*{\s*isAuthenticated\s+as\s+(\w+)\s*}\s*from\s+[\'\"](\.\.[\/\\])*middleware\/auth[\'\"]/g;
      content = content.replace(
        aliasedAuthRegex,
        `import { isAuthenticated as $1 } from '${canonicalImportPath}'`
      );
      
      const aliasedAdminRegex = /import\s*{\s*isAdmin\s+as\s+(\w+)\s*}\s*from\s+[\'\"](\.\.[\/\\])*middleware\/auth[\'\"]/g;
      content = content.replace(
        aliasedAdminRegex,
        `import { isAdmin as $1 } from '${canonicalImportPath}'`
      );
      
      // Add notice of refactoring at the top of the file
      if (content !== originalContent) {
        content = content.replace(
          /^(import|//|\/*)/,
          `// REFACTORED: Updated auth middleware imports to use canonical path
$1`
        );
        
        // Write changes back to file
        fs.writeFileSync(filePath, content);
        console.log(`✅ Updated imports in ${filePath}`);
        return;
      }
    }
    
    console.log(`ℹ️ No changes needed in ${filePath}`);
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
  }
}

// Main function
function main() {
  console.log('🔍 Searching for files with deprecated auth middleware imports...');
  
  // Get all TypeScript files
  const files = getAllFiles(serverDir);
  console.log(`Found ${files.length} TypeScript files to check.`);
  
  // Filter to only files with deprecated imports
  const filesToProcess = files.filter(file => {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      return content.includes('from') && content.includes('middleware/auth');
    } catch (error) {
      console.error(`Error reading ${file}:`, error);
      return false;
    }
  });
  
  console.log(`Found ${filesToProcess.length} files with potential auth imports to refactor.`);
  
  // Process each file
  filesToProcess.forEach(replaceImports);
  
  console.log('✨ Auth middleware refactoring complete!');
}

// Run the script
main(); 