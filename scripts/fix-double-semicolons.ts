#!/usr/bin/env tsx

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

async function fixDoubleSemicolons() {
  console.log('Finding all router files with double semicolons...');
  
  // Find all .routes.ts files
  const routeFiles = await glob('server/src/**/*.routes.ts', {
    cwd: '/Users/gnarcotic/Degentalk',
    absolute: true
  });

  let fixedCount = 0;
  
  for (const file of routeFiles) {
    const content = readFileSync(file, 'utf-8');
    
    // Check if file has double semicolons
    if (!content.includes(';;')) {
      continue;
    }
    
    // Fix double semicolons
    const updated = content.replace(/;;/g, ';');
    
    writeFileSync(file, updated);
    console.log(`✅ Fixed double semicolons in ${file}`);
    fixedCount++;
  }
  
  console.log(`\nFixed ${fixedCount} files`);
}

fixDoubleSemicolons().catch(console.error);