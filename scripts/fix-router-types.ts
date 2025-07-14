#!/usr/bin/env tsx

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { join } from 'path';

async function fixRouterTypes() {
  console.log('Finding all router files...');
  
  // Find all .routes.ts files
  const routeFiles = await glob('server/src/**/*.routes.ts', {
    cwd: '/Users/gnarcotic/Degentalk',
    absolute: true
  });

  console.log(`Found ${routeFiles.length} router files`);

  let fixedCount = 0;
  
  for (const file of routeFiles) {
    const content = readFileSync(file, 'utf-8');
    
    // Skip if already has explicit Router type import
    if (content.includes('type { Router }') || content.includes('type Router')) {
      console.log(`✓ ${file} - already has Router type`);
      continue;
    }
    
    // Check if file has Router() calls
    if (!content.includes('Router()')) {
      console.log(`- ${file} - no Router() calls`);
      continue;
    }
    
    let updated = content;
    
    // Fix imports that have Router but not as type
    if (content.includes('import { Router') && !content.includes('type { Router }')) {
      // Case 1: import { Router } from 'express'
      updated = updated.replace(
        /import\s*{\s*Router\s*}\s*from\s*['"]express['"]/g,
        "import { Router } from 'express'"
      );
      
      // Case 2: import { Router, ... } from 'express'
      updated = updated.replace(
        /import\s*{\s*Router\s*,([^}]+)}\s*from\s*['"]express['"]/g,
        "import { Router,$1} from 'express'"
      );
      
      // Add type import separately
      const expressImportMatch = updated.match(/import\s*{[^}]+}\s*from\s*['"]express['"]/);
      if (expressImportMatch) {
        const importLine = expressImportMatch[0];
        const newImportLine = importLine + '\nimport type { Router as RouterType } from \'express\';';
        updated = updated.replace(importLine, newImportLine);
      }
    } else if (!content.includes('Router')) {
      // No Router import at all, add it
      const expressImportMatch = updated.match(/import\s*.*\s*from\s*['"]express['"]/);
      if (expressImportMatch) {
        // Add Router to existing express import
        const importLine = expressImportMatch[0];
        if (importLine.includes('{')) {
          // Has named imports
          updated = updated.replace(
            /import\s*{([^}]+)}\s*from\s*['"]express['"]/,
            "import { Router,$1} from 'express'\nimport type { Router as RouterType } from 'express';"
          );
        } else {
          // Default import only
          updated = updated.replace(
            importLine,
            importLine + "\nimport { Router } from 'express';\nimport type { Router as RouterType } from 'express';"
          );
        }
      } else {
        // No express import at all, add at the top after initial comments
        const lines = updated.split('\n');
        let insertIndex = 0;
        
        // Skip initial comments and empty lines
        for (let i = 0; i < lines.length; i++) {
          if (!lines[i].trim().startsWith('*') && !lines[i].trim().startsWith('//') && lines[i].trim() !== '') {
            insertIndex = i;
            break;
          }
        }
        
        lines.splice(insertIndex, 0, "import { Router } from 'express';", "import type { Router as RouterType } from 'express';");
        updated = lines.join('\n');
      }
    }
    
    // Now fix all router declarations to use explicit type
    const routerDeclarations = updated.match(/const\s+(\w+)\s*=\s*Router\(\)/g);
    if (routerDeclarations) {
      for (const declaration of routerDeclarations) {
        const varNameMatch = declaration.match(/const\s+(\w+)\s*=/);
        if (varNameMatch) {
          const varName = varNameMatch[1];
          updated = updated.replace(
            declaration,
            `const ${varName}: RouterType = Router()`
          );
        }
      }
    }
    
    // Handle Router.Router() pattern
    const expressRouterDeclarations = updated.match(/const\s+(\w+)\s*=\s*express\.Router\(\)/g);
    if (expressRouterDeclarations) {
      for (const declaration of expressRouterDeclarations) {
        const varNameMatch = declaration.match(/const\s+(\w+)\s*=/);
        if (varNameMatch) {
          const varName = varNameMatch[1];
          updated = updated.replace(
            declaration,
            `const ${varName}: RouterType = express.Router()`
          );
        }
      }
    }
    
    if (updated !== content) {
      writeFileSync(file, updated);
      console.log(`✅ Fixed ${file}`);
      fixedCount++;
    } else {
      console.log(`✓ ${file} - no changes needed`);
    }
  }
  
  console.log(`\nFixed ${fixedCount} files`);
}

fixRouterTypes().catch(console.error);