/**
 * Auth Standardization Script
 * 
 * This script helps analyze route files to identify and fix authentication issues:
 * - Find local isAuthenticated implementations that should use the centralized middleware
 * - Identify user.id references that should be using getUserId helper
 * - Check for other authentication inconsistencies
 */

import fs from 'fs';
import path from 'path';

// Configuration
const SERVER_DIR = path.join(process.cwd(), 'server');
const SKIP_FILES = ['middleware', 'utils', 'services', 'migrations', 'index.ts', 'db.ts', 'vite.ts'];
const AUTH_MIDDLEWARE_PATH = path.join(SERVER_DIR, 'middleware', 'auth.ts');

// Helper to check if a file should be analyzed
function shouldAnalyzeFile(filePath: string): boolean {
  const relativePath = path.relative(SERVER_DIR, filePath);
  
  // Skip directories and specific files
  if (SKIP_FILES.some(skip => relativePath.startsWith(skip))) {
    return false;
  }
  
  // Only analyze TypeScript files
  return filePath.endsWith('.ts');
}

// Find all server TypeScript files
function getServerFiles(): string[] {
  // Get all files in server directory
  const getFiles = (dir: string): string[] => {
    const files: string[] = [];
    
    for (const file of fs.readdirSync(dir)) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Recursively get files from subdirectories
        files.push(...getFiles(filePath));
      } else if (shouldAnalyzeFile(filePath)) {
        files.push(filePath);
      }
    }
    
    return files;
  };
  
  return getFiles(SERVER_DIR);
}

// Check for local isAuthenticated implementations
function findLocalAuthImplementations(files: string[]): { file: string, lineNumber: number, line: string }[] {
  const results: { file: string, lineNumber: number, line: string }[] = [];
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for local isAuthenticated function definition
      if (line.includes('function isAuthenticated') && !file.includes('middleware/auth.ts')) {
        results.push({
          file,
          lineNumber: i + 1,
          line
        });
      }
    }
  }
  
  return results;
}

// Check for userId references that need to be fixed
function findUserIdReferences(files: string[]): { file: string, lineNumber: number, line: string }[] {
  const results: { file: string, lineNumber: number, line: string }[] = [];
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Find direct references to req.user.id that might need to be getUserId(req)
      if (line.includes('req.user') && line.includes('.id') && !line.includes('getUserId')) {
        results.push({
          file,
          lineNumber: i + 1,
          line
        });
      }
    }
  }
  
  return results;
}

// Find imports of auth middleware
function findAuthImports(files: string[]): { file: string, hasImport: boolean }[] {
  const results: { file: string, hasImport: boolean }[] = [];
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    
    // Check if file imports middleware/auth
    const hasImport = content.includes('from "./middleware/auth"') || 
                     content.includes("from './middleware/auth'") ||
                     content.includes('from "./middleware/auth.ts"') || 
                     content.includes("from './middleware/auth.ts'");
    
    // Only include files that use authentication
    if (content.includes('isAuthenticated')) {
      results.push({
        file,
        hasImport
      });
    }
  }
  
  return results;
}

// Main function
async function main() {
  // Get all server files to analyze
  const serverFiles = getServerFiles();
  
  console.log(`Found ${serverFiles.length} server files to analyze`);
  
  // Check for local auth implementations
  const localAuthImplementations = findLocalAuthImplementations(serverFiles);
  
  console.log('\n=== Files with local isAuthenticated implementations ===');
  for (const result of localAuthImplementations) {
    console.log(`${path.relative(process.cwd(), result.file)}:${result.lineNumber}: ${result.line.trim()}`);
  }
  
  // Check for userId references
  const userIdReferences = findUserIdReferences(serverFiles);
  
  console.log('\n=== Files with direct req.user.id references ===');
  for (const result of userIdReferences) {
    console.log(`${path.relative(process.cwd(), result.file)}:${result.lineNumber}: ${result.line}`);
  }
  
  // Check for auth imports
  const authImports = findAuthImports(serverFiles);
  
  console.log('\n=== Files using isAuthenticated without importing from middleware/auth ===');
  for (const result of authImports) {
    if (!result.hasImport) {
      console.log(`${path.relative(process.cwd(), result.file)}`);
    }
  }
}

main().catch(console.error);