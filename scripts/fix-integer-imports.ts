import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import path from 'path';

async function fixIntegerImports() {
  console.log('Fixing integer imports in schema files...');
  
  // Find all TypeScript files in db/schema
  const files = await glob('db/schema/**/*.ts');
  
  let fixedCount = 0;
  
  for (const file of files) {
    let content = readFileSync(file, 'utf-8');
    let modified = false;
    
    // Check if file uses integer() function
    if (content.includes('integer(')) {
      // Find the drizzle-orm/pg-core import line
      const importRegex = /import\s*{([^}]+)}\s*from\s*['"]drizzle-orm\/pg-core['"]/;
      const match = content.match(importRegex);
      
      if (match) {
        const importsList = match[1];
        
        // Check if there's a commented integer
        if (importsList.includes('/*integer') || importsList.includes('integer*/')) {
          // Remove any commented integer patterns
          let cleanedImports = importsList
            .replace(/\/\*integer,?\*\/\s*,?/g, '')
            .replace(/,\s*\/\*integer\*\//g, '');
          
          // Split imports and clean them
          const importsArray = cleanedImports
            .split(',')
            .map(i => i.trim())
            .filter(i => i && i !== '');
          
          // Remove duplicates
          const uniqueImports = [...new Set(importsArray)];
          
          // Make sure integer is in the list
          if (!uniqueImports.includes('integer')) {
            uniqueImports.push('integer');
          }
          
          // Rebuild the import statement
          const newImportStatement = `import {\n\t${uniqueImports.join(',\n\t')}\n} from 'drizzle-orm/pg-core'`;
          content = content.replace(match[0], newImportStatement);
          modified = true;
        }
      }
    }
    
    if (modified) {
      writeFileSync(file, content);
      console.log(`✅ Fixed: ${path.relative(process.cwd(), file)}`);
      fixedCount++;
    }
  }
  
  console.log(`\nFixed ${fixedCount} files.`);
}

fixIntegerImports().catch(console.error); 