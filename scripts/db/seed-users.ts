import { db } from '../../server/src/core/db';
import { users } from '../../db/schema/user/users';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';

export async function seedUsers() {
  console.log('🌱 Seeding users...');
  const passwordHash = await bcrypt.hash('password123', 10);
  const mockUsers = [
    {
      username: 'cryptoadmin',
      email: 'admin@example.com',
      password: passwordHash,
      displayName: 'Crypto Admin',
      role: 'admin',
      xpTotal: 10000,
      cloutScore: 500,
      postCount: 0,
      threadCount: 0,
      avatarUrl: '/images/avatars/admin.png',
      isActive: true,
      isBanned: false,
      isVerified: true
    },
    {
      username: 'degenmod',
      email: 'mod@example.com',
      password: passwordHash,
      displayName: 'Degen Moderator',
      role: 'mod',
      xpTotal: 5000,
      cloutScore: 300,
      postCount: 0,
      threadCount: 0,
      avatarUrl: '/images/avatars/mod.png',
      isActive: true,
      isBanned: false,
      isVerified: true
    }
  ];
  for (let i = 0; i < 20; i++) {
    mockUsers.push({
      username: faker.internet.username().toLowerCase(),
      email: faker.internet.email(),
      password: passwordHash,
      displayName: faker.person.fullName(),
      role: 'user',
      xpTotal: faker.number.int({ min: 10, max: 999 }),
      cloutScore: faker.number.int({ min: 10, max: 99 }),
      postCount: 0,
      threadCount: 0,
      avatarUrl: '/images/avatars/default.png',
      isActive: true,
      isBanned: false,
      isVerified: true
    });
  }
  await db.insert(users).values(mockUsers);
  console.log(`✅ Seeded ${mockUsers.length} users.`);
}

seedUsers().then(() => process.exit(0)); 