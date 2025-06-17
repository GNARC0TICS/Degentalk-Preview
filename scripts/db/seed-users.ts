import { db } from '@db';
import { users } from '@schema/user/users';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';
import { sql } from 'drizzle-orm';

// Define types for clarity and stricter type checking for mockUsers
type UserRole = 'admin' | 'mod' | 'user';
type UserSeedData = {
  username: string;
  email: string;
  password: string; // This holds the password hash
  // displayName: string; // Removed as it's not in the users schema
  role: UserRole;
  xp: number; // Renamed from xpTotal to match schema
  clout: number; // Renamed from cloutScore to match schema
  // postCount: number; // Removed as it's not in the users schema
  // threadCount: number; // Removed as it's not in the users schema
  avatarUrl: string;
  isActive: boolean;
  isBanned: boolean;
  isVerified: boolean;
  // Optional: Add other fields from schema if they need to be seeded
  bio?: string;
  signature?: string;
  // etc.
};

export async function seedUsers() {
  console.log('🌱 Seeding users...');
  const passwordHash = await bcrypt.hash('password123', 10);
  const mockUsers: UserSeedData[] = [
    {
      username: 'cryptoadmin',
      email: 'admin@example.com',
      password: passwordHash,
      // displayName: 'Crypto Admin', // Removed
      role: 'admin',
      xp: 10000, // Renamed
      clout: 500, // Renamed
      // postCount: 0, // Removed
      // threadCount: 0, // Removed
      avatarUrl: '/images/avatars/admin.png',
      isActive: true,
      isBanned: false,
      isVerified: true
    },
    {
      username: 'degenmod',
      email: 'mod@example.com',
      password: passwordHash,
      // displayName: 'Degen Moderator', // Removed
      role: 'mod',
      xp: 5000, // Renamed
      clout: 300, // Renamed
      // postCount: 0, // Removed
      // threadCount: 0, // Removed
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
      // displayName: faker.person.fullName(), // Removed
      role: 'user',
      xp: faker.number.int({ min: 10, max: 999 }), // Renamed
      clout: faker.number.int({ min: 10, max: 99 }), // Renamed
      // postCount: 0, // Removed
      // threadCount: 0, // Removed
      avatarUrl: '/images/avatars/default.png',
      isActive: true,
      isBanned: false,
      isVerified: true
    });
  }
  // await db.insert(users).values(mockUsers);
  // console.log(`✅ Seeded ${mockUsers.length} users.`);
  // Using onConflictDoUpdate to handle potential duplicate usernames (e.g., cryptoadmin)
  // This will insert new users or update existing ones if a username conflict occurs.
  await db.insert(users).values(mockUsers).onConflictDoUpdate({
    target: users.username, // conflict on username
    set: {
      // Keys here are the JS/TS property names from the Drizzle schema (users object)
      // Values use sql`excluded.db_column_name`
      email: sql`excluded.email`,
      password: sql`excluded.password_hash`, // Drizzle schema 'password' maps to DB 'password_hash'
      // displayName: sql`excluded.display_name`, // Removed as displayName is not in schema
      role: sql`excluded.role`,
      xp: sql`excluded.xp`, // Drizzle schema 'xp' maps to DB 'xp'
      clout: sql`excluded.clout`, // Drizzle schema 'clout' maps to DB 'clout'
      // postCount: sql`excluded.post_count`, // Removed as postCount is not in schema
      // threadCount: sql`excluded.thread_count`, // Removed as threadCount is not in schema
      avatarUrl: sql`excluded.avatar_url`, // Drizzle schema 'avatarUrl' maps to DB 'avatar_url'
      isActive: sql`excluded.is_active`, // Drizzle schema 'isActive' maps to DB 'is_active'
      isBanned: sql`excluded.is_banned`, // Drizzle schema 'isBanned' maps to DB 'is_banned'
      isVerified: sql`excluded.is_verified`, // Drizzle schema 'isVerified' maps to DB 'is_verified'
      updatedAt: sql`CURRENT_TIMESTAMP`, // Explicitly update updatedAt
    }
  });
  console.log(`✅ Upserted ${mockUsers.length} users (inserted or updated).`);
}

seedUsers().then(() => process.exit(0));
