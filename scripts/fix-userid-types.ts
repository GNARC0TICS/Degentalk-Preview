import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import path from 'path';

async function fixUserIdTypes() {
  console.log('Fixing userId type mismatches...');
  
  // Find all TypeScript files in db/schema
  const files = await glob('db/schema/**/*.ts');
  
  let fixedCount = 0;
  
  for (const file of files) {
    let content = readFileSync(file, 'utf-8');
    let modified = false;
    
    // Pattern 1: userId: integer('user_id') that references users
    const userIdPattern = /userId:\s*integer\('user_id'\)([^,\n]*references\s*\(\s*\)\s*=>\s*users\.(id|user_id))/g;
    if (userIdPattern.test(content)) {
      content = content.replace(userIdPattern, "userId: uuid('user_id')$1");
      modified = true;
    }
    
    // Pattern 2: Other fields that reference users.id or users.user_id
    const userRefPattern = /(\w+):\s*integer\('([^']+)'\)([^,\n]*references\s*\(\s*\)\s*=>\s*users\.(id|user_id))/g;
    if (userRefPattern.test(content)) {
      content = content.replace(userRefPattern, "$1: uuid('$2')$3");
      modified = true;
    }
    
    // Pattern 3: Fields with _user_id or _by pattern that likely reference users
    const userFieldPattern = /(\w+):\s*integer\('(\w*(?:_user_id|_by|admin_id|moderator_id|reporter_id|sender_id|recipient_id|referrer_id))'\)/g;
    const matches = content.match(userFieldPattern);
    if (matches) {
      for (const match of matches) {
        // Check if this field likely references a user
        if (match.includes('_user_id') || match.includes('_by') || 
            match.includes('admin_id') || match.includes('moderator_id') ||
            match.includes('reporter_id') || match.includes('sender_id') ||
            match.includes('recipient_id') || match.includes('referrer_id')) {
          const newMatch = match.replace('integer(', 'uuid(');
          content = content.replace(match, newMatch);
          modified = true;
        }
      }
    }
    
    if (modified) {
      // Ensure uuid is imported
      if (!content.includes('uuid') || content.includes('/*uuid*/')) {
        // Add uuid to imports
        const importRegex = /import\s*{([^}]+)}\s*from\s*['"]drizzle-orm\/pg-core['"]/;
        const importMatch = content.match(importRegex);
        
        if (importMatch) {
          const imports = importMatch[1];
          const importsArray = imports.split(',').map(i => i.trim()).filter(i => i);
          
          // Remove commented uuid if exists
          const cleanedImports = importsArray.map(i => i.replace(/\/\*uuid\*\//g, '').trim()).filter(i => i);
          
          if (!cleanedImports.includes('uuid')) {
            cleanedImports.push('uuid');
          }
          
          const newImportStatement = `import {\n\t${cleanedImports.join(',\n\t')}\n} from 'drizzle-orm/pg-core'`;
          content = content.replace(importMatch[0], newImportStatement);
        }
      }
      
      writeFileSync(file, content);
      console.log(`✅ Fixed: ${path.relative(process.cwd(), file)}`);
      fixedCount++;
    }
  }
  
  console.log(`\nFixed ${fixedCount} files.`);
}

fixUserIdTypes().catch(console.error); 