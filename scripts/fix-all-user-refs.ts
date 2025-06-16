import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import path from 'path';

async function fixAllUserRefs() {
  console.log('Fixing all user reference fields to uuid...');
  
  const files = await glob('db/schema/**/*.ts');
  let fixedCount = 0;
  
  // List of field names that should be uuid when they reference users
  const userFields = [
    'userId', 'user_id',
    'adminId', 'admin_id',
    'moderatorId', 'moderator_id',
    'createdBy', 'created_by',
    'updatedBy', 'updated_by',
    'deletedBy', 'deleted_by',
    'bannedBy', 'banned_by',
    'liftedBy', 'lifted_by',
    'grantedBy', 'granted_by',
    'reporterId', 'reporter_id',
    'resolvedBy', 'resolved_by',
    'senderId', 'sender_id',
    'recipientId', 'recipient_id',
    'referrerId', 'referrer_id',
    'processedBy', 'processed_by',
    'featuredBy', 'featured_by',
    'editedBy', 'edited_by',
    'likedByUserId', 'liked_by_user_id',
    'fromUserId', 'from_user_id',
    'toUserId', 'to_user_id',
    'followerId', 'follower_id',
    'followingId', 'following_id',
    'mentioningUserId', 'mentioning_user_id',
    'mentionedUserId', 'mentioned_user_id',
    'referredByUserId', 'referred_by_user_id'
  ];
  
  for (const file of files) {
    let content = readFileSync(file, 'utf-8');
    let modified = false;
    
    // Fix each user field
    for (const field of userFields) {
      const camelCase = field.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      const snakeCase = field.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
      
      // Pattern for field definitions
      const patterns = [
        new RegExp(`${camelCase}:\\s*integer\\('${snakeCase}'\\)`, 'g'),
        new RegExp(`${camelCase}:\\s*integer\\("${snakeCase}"\\)`, 'g'),
      ];
      
      for (const pattern of patterns) {
        if (pattern.test(content)) {
          content = content.replace(pattern, `${camelCase}: uuid('${snakeCase}')`);
          modified = true;
        }
      }
    }
    
    if (modified) {
      // Ensure uuid is imported
      const importRegex = /import\s*{([^}]+)}\s*from\s*['"]drizzle-orm\/pg-core['"]/;
      const importMatch = content.match(importRegex);
      
      if (importMatch && !importMatch[1].includes('uuid')) {
        const imports = importMatch[1].split(',').map(i => i.trim()).filter(i => i);
        imports.push('uuid');
        const newImportStatement = `import {\n\t${imports.join(',\n\t')}\n} from 'drizzle-orm/pg-core'`;
        content = content.replace(importMatch[0], newImportStatement);
      }
      
      writeFileSync(file, content);
      console.log(`✅ Fixed: ${path.relative(process.cwd(), file)}`);
      fixedCount++;
    }
  }
  
  console.log(`\nFixed ${fixedCount} files.`);
}

fixAllUserRefs().catch(console.error); 