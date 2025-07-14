#!/usr/bin/env tsx

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

async function fixRemainingRouters() {
  console.log('Finding router files that need fixing...');
  
  const routeFiles = await glob('server/src/**/*.routes.ts', {
    cwd: '/Users/gnarcotic/Degentalk',
    absolute: true
  });

  let fixedCount = 0;
  const issues = [];
  
  for (const file of routeFiles) {
    const content = readFileSync(file, 'utf-8');
    let updated = content;
    let needsFix = false;
    
    // Check if file uses RouterType without importing it
    if (content.includes(': RouterType') && !content.includes('type { Router as RouterType }') && !content.includes('type RouterType')) {
      // Add the import after express import
      const expressImportMatch = updated.match(/import\s+.*\s*from\s*['"]express['"]/);
      if (expressImportMatch) {
        const importLine = expressImportMatch[0];
        if (!importLine.includes('RouterType')) {
          updated = updated.replace(
            importLine,
            importLine + "\nimport type { Router as RouterType } from 'express';"
          );
          needsFix = true;
        }
      }
    }
    
    // Check if @server-middleware should be @server/middleware
    if (content.includes('@server-middleware/')) {
      updated = updated.replace(/@server-middleware\//g, '@server/middleware/');
      needsFix = true;
    }
    
    // Check for Router declarations without type annotation
    const routerPatterns = [
      /const\s+(\w+)\s*=\s*Router\(\)(?!\s*;|$)/g,
      /const\s+(\w+)\s*=\s*express\.Router\(\)(?!\s*;|$)/g
    ];
    
    for (const pattern of routerPatterns) {
      const matches = [...updated.matchAll(pattern)];
      for (const match of matches) {
        const varName = match[1];
        // Check if it already has a type annotation
        const declarationRegex = new RegExp(`const\\s+${varName}\\s*:\\s*\\w+\\s*=`);
        if (!declarationRegex.test(updated)) {
          updated = updated.replace(
            match[0],
            `const ${varName}: RouterType = ${match[0].includes('express.') ? 'express.Router()' : 'Router()'}`
          );
          needsFix = true;
        }
      }
    }
    
    if (needsFix) {
      writeFileSync(file, updated);
      console.log(`✅ Fixed ${file}`);
      fixedCount++;
    } else {
      // Check for any issues
      if (content.includes(': RouterType') && !content.includes('RouterType')) {
        issues.push(`⚠️  ${file} - Uses RouterType but doesn't import it`);
      }
    }
  }
  
  console.log(`\nFixed ${fixedCount} files`);
  
  if (issues.length > 0) {
    console.log('\nIssues found:');
    issues.forEach(issue => console.log(issue));
  }
}

fixRemainingRouters().catch(console.error);