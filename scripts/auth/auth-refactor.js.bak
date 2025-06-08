import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths
const rootDir = path.resolve(__dirname, '..');
const serverDir = path.join(rootDir, 'server');

// Get all TypeScript files recursively
function getAllFiles(dir, fileList = []) {
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
function replaceImports(filePath) {
  console.log(`Processing ${filePath}...`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    
    const canonicalImportPath = '@server/src/domains/auth/middleware/auth.middleware';
    let modified = false;
    
    // Check for deprecated imports
    if (content.includes('middleware/auth')) {
      // Handle all variations with string replacement
      if (content.includes("from './middleware/auth'") || content.includes('from "./middleware/auth"')) {
        content = content.replace(/from\s+[\'\"]\.\/(middleware\/auth)[\'\"]/g, 
                               `from '${canonicalImportPath}'`);
        modified = true;
      }
      
      if (content.includes("from '../middleware/auth'") || content.includes('from "../middleware/auth"')) {
        content = content.replace(/from\s+[\'\"]\.\.\/middleware\/auth[\'\"]/g, 
                               `from '${canonicalImportPath}'`);
        modified = true;
      }
      
      if (content.includes("from '../../middleware/auth'") || content.includes('from "../../middleware/auth"')) {
        content = content.replace(/from\s+[\'\"]\.\.\/\.\.\/middleware\/auth[\'\"]/g, 
                               `from '${canonicalImportPath}'`);
        modified = true;
      }
      
      if (content.includes("from '../../../middleware/auth'") || content.includes('from "../../../middleware/auth"')) {
        content = content.replace(/from\s+[\'\"]\.\.\/\.\.\/\.\.\/middleware\/auth[\'\"]/g, 
                               `from '${canonicalImportPath}'`);
        modified = true;
      }
      
      if (content.includes("from '../../../../middleware/auth'") || content.includes('from "../../../../middleware/auth"')) {
        content = content.replace(/from\s+[\'\"]\.\.\/\.\.\/\.\.\/\.\.\/middleware\/auth[\'\"]/g, 
                               `from '${canonicalImportPath}'`);
        modified = true;
      }
      
      if (content.includes("from '../../../../../middleware/auth'") || content.includes('from "../../../../../middleware/auth"')) {
        content = content.replace(/from\s+[\'\"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/middleware\/auth[\'\"]/g, 
                               `from '${canonicalImportPath}'`);
        modified = true;
      }
      
      if (content.includes("from '../../../../../../middleware/auth'") || content.includes('from "../../../../../../middleware/auth"')) {
        content = content.replace(/from\s+[\'\"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/middleware\/auth[\'\"]/g, 
                               `from '${canonicalImportPath}'`);
        modified = true;
      }
      
      if (modified) {
        // Add a comment at the top of the file
        const lines = content.split('\n');
        lines.unshift('// REFACTORED: Updated auth middleware imports to use canonical path');
        content = lines.join('\n');
        
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