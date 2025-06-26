/**
 * Auth Fix Script
 * 
 * This script makes the necessary changes to standardize authentication across the app:
 * 1. Remove local isAuthenticated implementations and import from middleware/auth
 * 2. Replace direct req.user.id references with getUserId(req)
 * 3. Add getUserId helper function where needed
 */

import fs from 'fs';
import path from 'path';

// Configuration
const SERVER_DIR = path.join(process.cwd(), 'server');
const SKIP_FILES = ['middleware', 'utils', 'services', 'migrations', 'index.ts', 'db.ts', 'vite.ts'];
const DEBUG_MODE = false;  // Set to true to see what changes would be made without actually making them

// Helper to check if a file should be processed
function shouldProcessFile(filePath: string): boolean {
  const relativePath = path.relative(SERVER_DIR, filePath);
  
  // Skip directories and specific files
  if (SKIP_FILES.some(skip => relativePath.startsWith(skip))) {
    return false;
  }
  
  // Only process TypeScript files
  return filePath.endsWith('.ts');
}

// Helper to add getUserId function if needed
function addGetUserIdHelper(content: string): string {
  // Check if the file already has getUserId function
  if (content.includes('function getUserId') || !content.includes('req.user')) {
    return content;
  }
  
  // Add getUserId function after imports
  const lastImportIndex = content.lastIndexOf('import');
  if (lastImportIndex === -1) {
    return content;
  }
  
  let lastImportEndIndex = content.indexOf('\n', lastImportIndex);
  lastImportEndIndex = content.indexOf('\n', lastImportEndIndex + 1);
  
  const helperFunction = `
// Helper function to get user ID from req.user, handling both id and user_id formats
function getUserId(req: Request): number {
  return (req.user as any)?.id || (req.user as any)?.user_id || 0;
}
`;
  
  return content.slice(0, lastImportEndIndex + 1) + helperFunction + content.slice(lastImportEndIndex + 1);
}

// Helper to remove local isAuthenticated implementation
function removeLocalIsAuthenticated(content: string): string {
  const regex = /function isAuthenticated\([^)]*\)\s*{\s*[^}]*}/gms;
  return content.replace(regex, '// Using shared isAuthenticated middleware from middleware/auth.ts');
}

// Helper to add auth middleware import if needed
function addAuthMiddlewareImport(content: string, filePath: string): string {
  // Skip if already imported or file doesn't use isAuthenticated
  if (content.includes('from "./middleware/auth"') || 
      content.includes("from './middleware/auth'") ||
      !content.includes('isAuthenticated')) {
    return content;
  }
  
  // Find all imports and add auth middleware import after them
  const lastImportIndex = content.lastIndexOf('import');
  if (lastImportIndex === -1) {
    return content;
  }
  
  let lastImportEndIndex = content.indexOf('\n', lastImportIndex);
  
  const importStatement = `\nimport { isAuthenticated, isAdminOrModerator, isAdmin } from "./middleware/auth";`;
  
  return content.slice(0, lastImportEndIndex + 1) + importStatement + content.slice(lastImportEndIndex + 1);
}

// Helper to replace direct req.user.id references with getUserId(req)
function replaceUserIdReferences(content: string): string {
  // Replace various forms of req.user.id with getUserId(req)
  const replacements = [
    { pattern: /req\.user!\.id/g, replacement: 'getUserId(req)' },
    { pattern: /req\.user\.id/g, replacement: 'getUserId(req)' },
    { pattern: /\(req\.user as any\)\.id/g, replacement: 'getUserId(req)' },
    { pattern: /req\.user\?\.id/g, replacement: 'getUserId(req)' }
  ];
  
  let newContent = content;
  for (const { pattern, replacement } of replacements) {
    newContent = newContent.replace(pattern, replacement);
  }
  
  return newContent;
}

// Process a single file
function processFile(filePath: string): boolean {
  console.log(`Processing ${path.relative(process.cwd(), filePath)}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let originalContent = content;
    
    // Add getUserId helper function if needed
    content = addGetUserIdHelper(content);
    
    // Remove local isAuthenticated implementation
    content = removeLocalIsAuthenticated(content);
    
    // Add auth middleware import if needed
    content = addAuthMiddlewareImport(content, filePath);
    
    // Replace direct req.user.id references with getUserId(req)
    content = replaceUserIdReferences(content);
    
    // Write changes if content was modified
    if (content !== originalContent) {
      if (!DEBUG_MODE) {
        fs.writeFileSync(filePath, content, 'utf-8');
      }
      console.log(`✅ Updated ${path.relative(process.cwd(), filePath)}`);
      return true;
    } else {
      console.log(`No changes needed for ${path.relative(process.cwd(), filePath)}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
    return false;
  }
}

// Process all files
async function main() {
  // Get all server files to process
  const serverFiles = fs.readdirSync(SERVER_DIR)
    .filter(file => file.endsWith('.ts'))
    .map(file => path.join(SERVER_DIR, file))
    .filter(shouldProcessFile);
  
  console.log(`Found ${serverFiles.length} server files to process`);
  
  if (DEBUG_MODE) {
    console.log('Running in DEBUG mode - no changes will be written');
  }
  
  let changedFiles = 0;
  
  // Process each file
  for (const file of serverFiles) {
    if (processFile(file)) {
      changedFiles++;
    }
  }
  
  console.log(`Finished processing ${serverFiles.length} files. Changed ${changedFiles} files.`);
}

main().catch(console.error);