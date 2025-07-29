/**
 * Authentication Utilities for Lucia Auth
 * 
 * This file provides utilities for user authentication, password hashing,
 * and user management compatible with DegenTalk's existing database schema.
 */

import { hash, verify } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { db } from '@degentalk/db';
import { users } from "@schema";
import { eq, and } from "drizzle-orm";
import { lucia } from "./lucia";
import { createSession } from "./session";
import type { UserId } from "@shared/types/ids";
import type { User } from "@shared/types/user.types";

/**
 * Argon2 configuration for password hashing
 * These settings provide good security while maintaining reasonable performance
 */
const ARGON2_CONFIG = {
  memoryCost: 19456, // 19 MiB
  timeCost: 2,       // 2 iterations
  outputLen: 32,     // 32 bytes output
  parallelism: 1,    // 1 thread
};

/**
 * Hash a password using Argon2id
 */
export async function hashPassword(password: string): Promise<string> {
  return await hash(password, ARGON2_CONFIG);
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    return await verify(hashedPassword, password);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Create a new user account
 */
export async function createUser(
  username: string,
  email: string,
  password: string
): Promise<{ userId: UserId; user: User }> {
  const userId = generateIdFromEntropySize(10) as UserId;
  const passwordHash = await hashPassword(password);
  
  // Insert new user into database
  const [newUser] = await db.insert(users).values({
    id: userId,
    username,
    email,
    password: passwordHash,
    // Set defaults that match current schema
    isActive: true,
    isVerified: false,
    isBanned: false,
    level: 1,
    xp: 0,
    reputation: 0,
    dgtBalance: 0,
    role: 'user',
    isAdmin: false,
    isModerator: false,
    isStaff: false,
    createdAt: new Date(),
  }).returning();

  if (!newUser) {
    throw new Error('Failed to create user');
  }

  // Transform to User type for return
  const user: User = {
    id: newUser.id,
    username: newUser.username,
    email: newUser.email,
    role: newUser.role as User['role'],
    avatarUrl: newUser.avatarUrl,
    isVerified: newUser.isVerified,
    bio: newUser.bio,
    reputation: newUser.reputation,
    website: newUser.website,
    github: newUser.githubHandle,
    twitter: newUser.twitterHandle,
    discord: newUser.discordHandle,
    pluginData: newUser.pluginData as User['pluginData'],
    isActive: newUser.isActive,
    signature: newUser.signature,
    lastActiveAt: newUser.lastSeenAt?.toISOString() || new Date().toISOString(),
    bannerUrl: newUser.profileBannerUrl,
    level: newUser.level,
    xp: newUser.xp,
    dgtBalance: Number(newUser.dgtBalance),
    activeFrameId: newUser.activeFrameId,
    avatarFrameId: newUser.avatarFrameId,
    isBanned: newUser.isBanned,
    isVIP: false, // TODO: Add to schema if needed
    isAdmin: newUser.isAdmin,
    isModerator: newUser.isModerator,
    createdAt: newUser.createdAt.toISOString(),
    walletId: '', // TODO: Handle wallet integration
    walletAddress: newUser.walletAddress || '',
  };

  return { userId, user };
}

/**
 * Authenticate user with username/email and password
 */
export async function authenticateUser(
  usernameOrEmail: string,
  password: string
): Promise<{ user: User; session: any } | null> {
  // Find user by username or email
  const [dbUser] = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.username, usernameOrEmail) || eq(users.email, usernameOrEmail),
        eq(users.isActive, true),
        eq(users.isBanned, false)
      )
    )
    .limit(1);

  if (!dbUser) {
    return null;
  }

  // Verify password
  const isValidPassword = await verifyPassword(password, dbUser.password);
  if (!isValidPassword) {
    return null;
  }

  // Create session
  const session = await createSession(dbUser.id);

  // Transform to User type
  const user: User = {
    id: dbUser.id,
    username: dbUser.username,
    email: dbUser.email,
    role: dbUser.role as User['role'],
    avatarUrl: dbUser.avatarUrl,
    isVerified: dbUser.isVerified,
    bio: dbUser.bio,
    reputation: dbUser.reputation,
    website: dbUser.website,
    github: dbUser.githubHandle,
    twitter: dbUser.twitterHandle,
    discord: dbUser.discordHandle,
    pluginData: dbUser.pluginData as User['pluginData'],
    isActive: dbUser.isActive,
    signature: dbUser.signature,
    lastActiveAt: dbUser.lastSeenAt?.toISOString() || new Date().toISOString(),
    bannerUrl: dbUser.profileBannerUrl,
    level: dbUser.level,
    xp: dbUser.xp,
    dgtBalance: Number(dbUser.dgtBalance),
    activeFrameId: dbUser.activeFrameId,
    avatarFrameId: dbUser.avatarFrameId,
    isBanned: dbUser.isBanned,
    isVIP: false, // TODO: Add to schema if needed
    isAdmin: dbUser.isAdmin,
    isModerator: dbUser.isModerator,
    createdAt: dbUser.createdAt.toISOString(),
    walletId: '', // TODO: Handle wallet integration
    walletAddress: dbUser.walletAddress || '',
  };

  return { user, session };
}

/**
 * Get user by ID
 */
export async function getUserById(userId: UserId): Promise<User | null> {
  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!dbUser) {
    return null;
  }

  // Transform to User type
  const user: User = {
    id: dbUser.id,
    username: dbUser.username,
    email: dbUser.email,
    role: dbUser.role as User['role'],
    avatarUrl: dbUser.avatarUrl,
    isVerified: dbUser.isVerified,
    bio: dbUser.bio,
    reputation: dbUser.reputation,
    website: dbUser.website,
    github: dbUser.githubHandle,
    twitter: dbUser.twitterHandle,
    discord: dbUser.discordHandle,
    pluginData: dbUser.pluginData as User['pluginData'],
    isActive: dbUser.isActive,
    signature: dbUser.signature,
    lastActiveAt: dbUser.lastSeenAt?.toISOString() || new Date().toISOString(),
    bannerUrl: dbUser.profileBannerUrl,
    level: dbUser.level,
    xp: dbUser.xp,
    dgtBalance: Number(dbUser.dgtBalance),
    activeFrameId: dbUser.activeFrameId,
    avatarFrameId: dbUser.avatarFrameId,
    isBanned: dbUser.isBanned,
    isVIP: false, // TODO: Add to schema if needed
    isAdmin: dbUser.isAdmin,
    isModerator: dbUser.isModerator,
    createdAt: dbUser.createdAt.toISOString(),
    walletId: '', // TODO: Handle wallet integration
    walletAddress: dbUser.walletAddress || '',
  };

  return user;
}

/**
 * Check if username is available
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  return !existingUser;
}

/**
 * Check if email is available
 */
export async function isEmailAvailable(email: string): Promise<boolean> {
  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return !existingUser;
}

/**
 * Update user's last seen timestamp
 */
export async function updateLastSeen(userId: UserId): Promise<void> {
  await db
    .update(users)
    .set({ lastSeenAt: new Date() })
    .where(eq(users.id, userId));
}

/**
 * Development utilities for mock users
 */
export class DevAuthManager {
  private static mockUsers = {
    'user': {
      id: 'dev-user-id' as UserId,
      username: 'DevUser',
      email: 'dev@example.com',
      role: 'user' as const,
    },
    'moderator': {
      id: 'dev-moderator-id' as UserId,
      username: 'DevModerator',
      email: 'devmod@example.com',
      role: 'moderator' as const,
    },
    'admin': {
      id: 'dev-admin-id' as UserId,
      username: 'DevAdmin',
      email: 'devadmin@example.com',
      role: 'admin' as const,
    },
    'super_admin': {
      id: 'dev-super-admin-id' as UserId,
      username: 'DevSuperAdmin',
      email: 'devsuperadmin@example.com',
      role: 'super_admin' as const,
    },
  };

  /**
   * Get mock user for development
   */
  static getMockUser(role: keyof typeof DevAuthManager.mockUsers): User {
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('Mock users only available in development');
    }

    const mockData = this.mockUsers[role];
    if (!mockData) {
      throw new Error(`Invalid mock role: ${role}`);
    }

    return {
      id: mockData.id,
      username: mockData.username,
      email: mockData.email,
      role: mockData.role,
      avatarUrl: null,
      isVerified: true,
      bio: `Mock ${role} for development`,
      reputation: role === 'super_admin' ? 10000 : role === 'admin' ? 5000 : 100,
      website: null,
      github: null,
      twitter: null,
      discord: null,
      pluginData: {},
      isActive: true,
      signature: `Development ${role}`,
      lastActiveAt: new Date().toISOString(),
      bannerUrl: null,
      level: role === 'super_admin' ? 100 : role === 'admin' ? 50 : 10,
      xp: role === 'super_admin' ? 100000 : role === 'admin' ? 50000 : 1000,
      dgtBalance: role === 'super_admin' ? 1000000 : role === 'admin' ? 100000 : 10000,
      activeFrameId: null,
      avatarFrameId: null,
      isBanned: false,
      isVIP: role === 'admin' || role === 'super_admin',
      isAdmin: role === 'admin' || role === 'super_admin',
      isModerator: role === 'moderator' || role === 'admin' || role === 'super_admin',
      createdAt: new Date().toISOString(),
      walletId: `dev-wallet-${role}`,
      walletAddress: `0xDev${role.toUpperCase()}Address`,
    };
  }

  /**
   * Create development session for mock user
   */
  static async createMockSession(role: keyof typeof DevAuthManager.mockUsers) {
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('Mock sessions only available in development');
    }

    const mockUser = this.getMockUser(role);
    return await createSession(mockUser.id, { devMode: true, mockRole: role });
  }
}