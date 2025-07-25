import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env.local file
config({ path: resolve(__dirname, 'env.local') });

import { db } from './server/src/core/db';
import { users } from './db/schema';
import { eq, or } from 'drizzle-orm';

async function checkUsers() {
  try {
    const testUsers = await db.select({
      id: users.id,
      username: users.username,
      password: users.password,
      isActive: users.isActive,
      createdAt: users.createdAt
    }).from(users)
    .where(or(
      eq(users.username, 'testuser1'),
      eq(users.username, 'testuser2'),
      eq(users.username, 'testuser3')
    ))
    .orderBy(users.createdAt);
    
    console.log('Test users in database:');
    testUsers.forEach(user => {
      console.log(`- ${user.username}: password hash = ${user.password.substring(0, 20)}..., active = ${user.isActive}`);
    });
    
    if (testUsers.length === 0) {
      console.log('No test users found in database!');
    }
  } catch (error) {
    console.error('Error querying database:', error);
  }
}

checkUsers().then(() => process.exit(0)).catch(console.error);