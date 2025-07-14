import type { AdminId } from '../shared/types/ids';
import { db } from '../db';
import { users } from '../db/schema/user/users';
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { sql } from 'drizzle-orm';
import { logger } from '@server/core/logger';

// Define types for clarity and stricter type checking for mockUsers
type UserRole = 'admin' | 'mod' | 'user';
type UserSeedData = {
  username: string;
  email: string;
  password: string; // This holds the password hash
  role: UserRole;
  xp: number;
  clout: number;
  avatarUrl: string;
  isActive: boolean;
  isBanned: boolean;
  isVerified: boolean;
  bio?: string;
  signature?: string;
  website?: string;
  github?: string;
  twitter?: string;
  discord?: string;
  profileBannerUrl?: string;
  activeAvatarUrl?: string;
  level?: number;
  reputation?: number;
};

export async function seedUsers() {
  logger.info('Seeding users...');
  const passwordHash = await bcrypt.hash('password123', 10);
  const mockUsers: UserSeedData[] = [
    {
      username: 'cryptoadmin',
      email: 'admin@degentalk.dev',
      password: passwordHash,
      role: 'admin',
      xp: 99999,
      clout: 10000,
      level: 99,
      reputation: 10000,
      avatarUrl: '/images/avatars/admin.png',
      activeAvatarUrl: '/images/avatars/admin.png',
      profileBannerUrl: '/images/banners/admin-banner.jpg',
      isActive: true,
      isBanned: false,
      isVerified: true,
      bio: '🔥 Degentalk Platform Administrator | Crypto Veteran | Building the future of degen communities',
      signature: 'WAGMI 🚀 | Not financial advice | Degentalk Admin',
      website: 'https://degentalk.com',
      github: 'degentalk-admin',
      twitter: 'degentalk_official',
      discord: 'CryptoAdmin#0001'
    },
    {
      username: 'degenmod',
      email: 'mod@degentalk.dev',
      password: passwordHash,
      role: 'mod',
      xp: 25000,
      clout: 2500,
      level: 50,
      reputation: 2500,
      avatarUrl: '/images/avatars/mod.png',
      activeAvatarUrl: '/images/avatars/mod.png',
      profileBannerUrl: '/images/banners/mod-banner.jpg',
      isActive: true,
      isBanned: false,
      isVerified: true,
      bio: '🛡️ Degentalk Moderator | Keeping the chaos organized | Diamond hands since 2017',
      signature: 'Moderation is an art | DM for help | 💎🙌',
      website: 'https://degentalk.com/mods',
      github: 'degentalk-mod',
      twitter: 'degentalk_mod',
      discord: 'DegenMod#1337'
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
  // Deduplicate by username to avoid multiple rows targeting same conflict key in one statement (Postgres ERROR 21000)
  const uniqueUsers = Array.from(new Map(mockUsers.map((u) => [u.username, u])).values());

  // await db.insert(users).values(mockUsers);
  // console.log(`✅ Seeded ${mockUsers.length} users.`);
  // Using onConflictDoUpdate to handle potential duplicate usernames (e.g., cryptoadmin)
  // This will insert new users or update existing ones if a username conflict occurs.
  await db.insert(users).values(uniqueUsers).onConflictDoUpdate({
    target: users.username, // conflict on username
    set: {
      email: sql`excluded.email`,
      password: sql`excluded.password_hash`,
      role: sql`excluded.role`,
      xp: sql`excluded.xp`,
      clout: sql`excluded.clout`,
      level: sql`excluded.level`,
      reputation: sql`excluded.reputation`,
      avatarUrl: sql`excluded.avatar_url`,
      activeAvatarUrl: sql`excluded.active_avatar_url`,
      profileBannerUrl: sql`excluded.profile_banner_url`,
      isActive: sql`excluded.is_active`,
      isBanned: sql`excluded.is_banned`,
      isVerified: sql`excluded.is_verified`,
      bio: sql`excluded.bio`,
      signature: sql`excluded.signature`,
      website: sql`excluded.website`,
      github: sql`excluded.github`,
      twitter: sql`excluded.twitter`,
      discord: sql`excluded.discord`,
      updatedAt: sql`CURRENT_TIMESTAMP`
    }
  });
  logger.info(`Upserted ${uniqueUsers.length} users (inserted or updated).`);
}

seedUsers().then(() => process.exit(0));
