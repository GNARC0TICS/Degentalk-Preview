import type { AdminId } from '@shared/types';
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import path from 'path';

async function fixTableReferences() {
  console.log('Fixing table references to use correct field names...\n');
  
  const files = await glob('db/schema/**/*.ts');
  let totalFixed = 0;
  
  for (const file of files) {
    let content = readFileSync(file, 'utf-8');
    let originalContent = content;
    let changes: : AdminId[] = [];
    
    // Fix users table references
    // The actual field in code is 'id' but maps to 'user_id' column
    if (content.includes('users.user_id')) {
      content = content.replace(/users\.user_id/g, 'users.id');
      changes.push('Fixed users.user_id back to users.id');
    }
    
    // Fix roles table references  
    // The actual field in code is 'id' but maps to 'role_id' column
    if (content.includes('roles.role_id')) {
      content = content.replace(/roles\.role_id/g, 'roles.id');
      changes.push('Fixed roles.role_id back to roles.id');
    }
    
    // Fix permissions table references
    // The actual field in code is 'id' but maps to 'perm_id' column
    if (content.includes('permissions.perm_id')) {
      content = content.replace(/permissions\.perm_id/g, 'permissions.id');
      changes.push('Fixed permissions.perm_id back to permissions.id');
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

fixTableReferences().catch(console.error); 