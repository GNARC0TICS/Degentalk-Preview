/**
 * Development Authentication Helpers
 * 
 * Provides mock authentication for development mode.
 * Only available when NODE_ENV=development.
 */

import { lucia } from './index.js';
import { toUserId } from '@shared/utils/id';
import type { User } from '@shared/types/user.types';
import { authRepository } from '@domains/auth/repositories/auth.repository';
import { logger } from '@core/logger';

// Development user IDs - consistent across sessions
const DEV_USER_IDS = {
  user: toUserId('550e8400-e29b-41d4-a716-446655440001'),
  moderator: toUserId('550e8400-e29b-41d4-a716-446655440003'),
  admin: toUserId('550e8400-e29b-41d4-a716-446655440004'),
  owner: toUserId('550e8400-e29b-41d4-a716-446655440006')
} as const;

// Development user data
const DEV_USERS: Record<keyof typeof DEV_USER_IDS, Partial<User>> = {
  user: {
    username: 'DevUser',
    email: 'dev@example.com',
    role: 'user',
    bio: 'Development user account',
    level: 5,
    xp: 2500,
    reputation: 100,
    dgtBalance: 1000
  },
  moderator: {
    username: 'DevMod',
    email: 'devmod@example.com',
    role: 'moderator',
    bio: 'Development moderator account',
    level: 10,
    xp: 10000,
    reputation: 500,
    dgtBalance: 5000
  },
  admin: {
    username: 'DevAdmin',
    email: 'admin@example.com',
    role: 'admin',
    bio: 'Development admin account',
    level: 50,
    xp: 50000,
    reputation: 5000,
    dgtBalance: 50000
  },
  owner: {
    username: 'SuperAdmin',
    email: 'owner@example.com',
    role: 'owner',
    bio: 'Development owner account',
    level: 100,
    xp: 999999,
    reputation: 99999,
    dgtBalance: 1000000
  }
};

/**
 * Create or get a development user
 */
export async function getOrCreateDevUser(role: keyof typeof DEV_USER_IDS): Promise<User | null> {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Dev users only available in development');
  }

  const userId = DEV_USER_IDS[role];
  
  // Check if user already exists
  let user = await authRepository.findUserById(userId);
  
  if (!user) {
    // Create the dev user
    const devUserData = DEV_USERS[role];
    logger.info('AUTH', 'Creating development user', { role, userId });
    
    try {
      // Create user directly in database with known ID
      const [createdUser] = await authRepository.db
        .insert(authRepository.users)
        .values({
          id: userId,
          username: devUserData.username!,
          email: devUserData.email!,
          password: await authRepository.hashPassword('password'), // Default password
          role: devUserData.role!,
          bio: devUserData.bio,
          level: devUserData.level || 1,
          xp: devUserData.xp || 0,
          reputation: devUserData.reputation || 0,
          dgtBalance: devUserData.dgtBalance || 0,
          totalTipped: 0,
          totalReceived: 0,
          emailVerified: true,
          isActive: true,
          isBanned: false,
          isVerified: true,
          joinedAt: new Date(),
          lastSeen: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      user = authRepository.mapToUser(createdUser);
    } catch (error) {
      logger.error('AUTH', 'Failed to create dev user', { error, role });
      return null;
    }
  }
  
  return user;
}

/**
 * Create a development session for a specific role
 */
export async function createDevSession(role: keyof typeof DEV_USER_IDS = 'user') {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Dev auth only available in development');
  }
  
  // Get or create the dev user
  const user = await getOrCreateDevUser(role);
  
  if (!user) {
    throw new Error(`Failed to get dev user for role: ${role}`);
  }
  
  // Create session
  const session = await lucia.createSession(user.id, {
    deviceId: 'dev-mode',
    userAgent: 'Development Browser',
    ipAddress: '127.0.0.1',
    lastActiveAt: new Date()
  });
  
  logger.info('AUTH', 'Created dev session', { 
    role, 
    userId: user.id, 
    sessionId: session.id 
  });
  
  return {
    user,
    session,
    sessionCookie: lucia.createSessionCookie(session.id)
  };
}

/**
 * Quick login helper for development
 * Maps common usernames to roles
 */
export async function devQuickLogin(username: string) {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Dev auth only available in development');
  }
  
  // Map usernames to roles
  const roleMap: Record<string, keyof typeof DEV_USER_IDS> = {
    'admin': 'admin',
    'devadmin': 'admin',
    'mod': 'moderator',
    'devmod': 'moderator',
    'moderator': 'moderator',
    'owner': 'owner',
    'superadmin': 'owner',
    'user': 'user',
    'devuser': 'user'
  };
  
  const normalizedUsername = username.toLowerCase();
  const role = roleMap[normalizedUsername] || 'user';
  
  return createDevSession(role);
}

/**
 * Check if a user ID is a dev user
 */
export function isDevUserId(userId: string): boolean {
  return Object.values(DEV_USER_IDS).includes(userId as any);
}

/**
 * Get dev user role from user ID
 */
export function getDevUserRole(userId: string): keyof typeof DEV_USER_IDS | null {
  for (const [role, id] of Object.entries(DEV_USER_IDS)) {
    if (id === userId) {
      return role as keyof typeof DEV_USER_IDS;
    }
  }
  return null;
}