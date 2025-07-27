import { db } from '@db';
import { users } from '../db/schema/user/users';
import { sql } from 'drizzle-orm';

async function createTestUsers() {
  console.log('🔧 Creating test users...');

  try {
    // Use a pre-hashed password for password123
    // This is bcrypt hash of 'password123' with 10 rounds
    const passwordHash = '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW';
    
    // Create users
    const testUsers = [
      {
        username: 'cryptoadmin',
        email: 'admin@degentalk.com',
        password: passwordHash,
        role: 'admin' as const,
        xp: 99999,
        level: 42,
        isActive: true,
        isVerified: true,
        bio: 'Test admin account'
      },
      {
        username: 'testuser',
        email: 'test@degentalk.com',
        password: passwordHash,
        role: 'user' as const,
        xp: 100,
        level: 1,
        isActive: true,
        isVerified: true,
        bio: 'Test user account'
      },
      {
        username: 'testmod',
        email: 'mod@degentalk.com',
        password: passwordHash,
        role: 'moderator' as const,
        xp: 5000,
        level: 10,
        isActive: true,
        isVerified: true,
        bio: 'Test moderator account'
      }
    ];

    console.log('Creating users...');
    const createdUsers = await db.insert(users)
      .values(testUsers)
      .onConflictDoUpdate({
        target: users.username,
        set: {
          email: sql`excluded.email`,
          password: sql`excluded.password_hash`,
          role: sql`excluded.role`,
          xp: sql`excluded.xp`,
          level: sql`excluded.level`,
          updatedAt: sql`CURRENT_TIMESTAMP`
        }
      })
      .returning();

    console.log(`✅ Created/updated ${createdUsers.length} users`);

    // Get first mission and assign to admin
    const firstMission = await db.select().from(missions).limit(1);
    if (firstMission.length > 0 && createdUsers.length > 0) {
      const adminUser = createdUsers.find(u => u.username === 'cryptoadmin');
      if (adminUser) {
        await db.insert(userMissionProgress)
          .values({
            userId: adminUser.id,
            missionId: firstMission[0].id,
            progress: 0,
            isCompleted: false,
            startedAt: new Date()
          })
          .onConflictDoNothing();
        console.log('✅ Assigned first mission to admin user');
      }
    }

    console.log('✨ Test users created successfully!');
    console.log('Username: cryptoadmin, Password: password123');
    
  } catch (error) {
    console.error('❌ Error creating test users:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

createTestUsers();