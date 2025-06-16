import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import path from 'path';

async function fixMissingUuidImports() {
  console.log('Fixing missing uuid imports...');
  
  const files = await glob('db/schema/**/*.ts');
  let fixedCount = 0;
  
  for (const file of files) {
    let content = readFileSync(file, 'utf-8');
    
    // Check if file uses uuid() function
    if (content.includes('uuid(')) {
      // Find the drizzle-orm/pg-core import (handle multiline)
      const importRegex = /import\s*\{([^}]+)\}\s*from\s*['"]drizzle-orm\/pg-core['"]/s;
      const importMatch = content.match(importRegex);
      
      if (importMatch) {
        const imports = importMatch[1];
        
        // Check if uuid is NOT in the imports
        if (!imports.includes('uuid')) {
          // Split imports and clean them
          const importsArray = imports
            .split(/[,\n]/)
            .map(i => i.trim())
            .filter(i => i && i !== '');
          
          // Add uuid
          importsArray.push('uuid');
          
          // Remove duplicates and sort
          const uniqueImports = [...new Set(importsArray)].sort();
          
          // Rebuild import statement
          const newImportStatement = `import {\n\t${uniqueImports.join(',\n\t')}\n} from 'drizzle-orm/pg-core'`;
          content = content.replace(importMatch[0], newImportStatement);
          
          writeFileSync(file, content);
          console.log(`✅ Fixed: ${path.relative(process.cwd(), file)}`);
          fixedCount++;
        }
      } else {
        // No drizzle import found at all, add one
        const firstImportMatch = content.match(/^import\s+/m);
        if (firstImportMatch) {
          const insertPosition = firstImportMatch.index || 0;
          const newImport = `import { uuid } from 'drizzle-orm/pg-core';\n`;
          content = content.slice(0, insertPosition) + newImport + content.slice(insertPosition);
          
          writeFileSync(file, content);
          console.log(`✅ Added import to: ${path.relative(process.cwd(), file)}`);
          fixedCount++;
        }
      }
    }
  }
  
  console.log(`\nFixed ${fixedCount} files.`);
}

fixMissingUuidImports().catch(console.error); 