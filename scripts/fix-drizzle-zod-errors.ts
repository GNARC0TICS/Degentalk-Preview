#!/usr/bin/env tsx
/**
 * Script to add @ts-ignore comments to drizzle-zod .omit() calls
 * This is a workaround for TypeScript type inference issues with cross-workspace builds
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const files = glob.sync('db/schema/**/*.ts', {
  cwd: path.join(__dirname, '..'),
  absolute: true
});

let totalFixed = 0;

for (const file of files) {
  const content = readFileSync(file, 'utf-8');
  
  // Look for lines containing .omit( and add @ts-ignore before the statement
  const lines = content.split('\n');
  let modified = false;
  const newLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this line contains .omit( and the previous line doesn't have @ts-ignore
    if (line.includes('.omit(') && 
        !line.includes('@ts-ignore') &&
        (i === 0 || !lines[i-1].includes('@ts-ignore'))) {
      
      // Find the start of the export statement
      let startLine = i;
      while (startLine > 0 && !lines[startLine].startsWith('export const')) {
        startLine--;
      }
      
      // If we found an export statement and haven't already added @ts-ignore
      if (lines[startLine].startsWith('export const') && 
          (startLine === 0 || !lines[startLine-1].includes('@ts-ignore'))) {
        // Insert @ts-ignore before the export
        if (startLine === i) {
          newLines.push('// @ts-ignore - drizzle-zod type inference issue with cross-workspace builds');
          modified = true;
        }
      }
    }
    
    newLines.push(line);
  }
  
  if (modified) {
    writeFileSync(file, newLines.join('\n'));
    console.log(`Fixed: ${path.relative(process.cwd(), file)}`);
    totalFixed++;
  }
}

console.log(`\nTotal files fixed: ${totalFixed}`);