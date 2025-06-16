import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import path from 'path';

async function fixAllSchemaIssues() {
  console.log('Fixing all schema issues comprehensively...\n');
  
  const files = await glob('db/schema/**/*.ts');
  let totalFixed = 0;
  
  for (const file of files) {
    let content = readFileSync(file, 'utf-8');
    let originalContent = content;
    let changes: string[] = [];
    
    // Step 1: Fix uuid imports if uuid() is used
    if (content.includes('uuid(') && !content.includes('uuid()')) {
      const importRegex = /import\s*\{([^}]+)\}\s*from\s*['"]drizzle-orm\/pg-core['"]/s;
      const match = content.match(importRegex);
      
      if (match) {
        const imports = match[1];
        if (!imports.includes('uuid')) {
          const importsArray = imports
            .split(/[,\n]/)
            .map(i => i.trim())
            .filter(i => i && i !== '');
          
          if (!importsArray.includes('uuid')) {
            importsArray.push('uuid');
            importsArray.sort();
            
            const newImport = `import {\n\t${importsArray.join(',\n\t')}\n} from 'drizzle-orm/pg-core'`;
            content = content.replace(match[0], newImport);
            changes.push('Added uuid to imports');
          }
        }
      } else {
        // No pg-core import at all, add one
        const firstImport = content.match(/^import\s+.*$/m);
        if (firstImport) {
          content = content.replace(
            firstImport[0],
            `import { uuid } from 'drizzle-orm/pg-core';\n${firstImport[0]}`
          );
          changes.push('Added new uuid import');
        }
      }
    }
    
    // Step 2: Fix references to users.id (should be users.user_id now)
    if (content.includes('users.id')) {
      content = content.replace(/users\.id/g, 'users.user_id');
      changes.push('Fixed users.id references to users.user_id');
    }
    
    // Step 3: Fix roles.id references (should be roles.role_id)
    if (content.includes('roles.id')) {
      content = content.replace(/roles\.id/g, 'roles.role_id');
      changes.push('Fixed roles.id references to roles.role_id');
    }
    
    // Step 4: Fix permissions.id references (should be permissions.perm_id)
    if (content.includes('permissions.id')) {
      content = content.replace(/permissions\.id/g, 'permissions.perm_id');
      changes.push('Fixed permissions.id references to permissions.perm_id');
    }
    
    // Write file if changed
    if (content !== originalContent) {
      writeFileSync(file, content);
      console.log(`✅ Fixed: ${path.relative(process.cwd(), file)}`);
      changes.forEach(change => console.log(`   - ${change}`));
      totalFixed++;
    }
  }
  
  console.log(`\n✨ Fixed ${totalFixed} files total.`);
}

fixAllSchemaIssues().catch(console.error); 