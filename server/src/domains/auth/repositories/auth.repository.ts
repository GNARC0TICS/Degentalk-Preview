/**
 * Auth Repository
 * 
 * Handles all database operations for authentication.
 * Follows the repository pattern - no business logic, only data access.
 */

import { db } from '@db';
import { users, sessions } from '@schema';
import { eq, and, gte, or } from 'drizzle-orm';
import type { User } from '@shared/types/user.types';
import type { UserId } from '@shared/types/ids';
import { toUserId } from '@shared/utils/id';
import * as argon2 from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { BaseRepository } from '@core/repository/base-repository';

export class AuthRepository extends BaseRepository {
  // Expose for direct access in dev-auth.ts
  db = db;
  users = users;
  /**
   * Find user by username
   */
  async findUserByUsername(username: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    
    return user ? this.mapToUser(user) : null;
  }

  /**
   * Find user by email
   */
  async findUserByEmail(email: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    return user ? this.mapToUser(user) : null;
  }

  /**
   * Find user by ID
   */
  async findUserById(userId: UserId): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    return user ? this.mapToUser(user) : null;
  }

  /**
   * Find user by username or email
   */
  async findUserByUsernameOrEmail(usernameOrEmail: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.username, usernameOrEmail),
          eq(users.email, usernameOrEmail)
        )
      )
      .limit(1);
    
    return user ? this.mapToUser(user) : null;
  }

  /**
   * Create a new user
   */
  async createUser(data: {
    username: string;
    email: string;
    password: string;
  }): Promise<User> {
    const passwordHash = await this.hashPassword(data.password);
    const userId = toUserId(generateIdFromEntropySize(10));
    
    const [user] = await db
      .insert(users)
      .values({
        id: userId,
        username: data.username,
        email: data.email,
        password: passwordHash,
        // Set required fields with defaults
        xp: 0,
        level: 1,
        reputation: 0,
        dgtBalance: 0,
        totalTipped: 0,
        totalReceived: 0,
        emailVerified: false,
        isActive: process.env.NODE_ENV === 'development', // Auto-active in dev
        isBanned: false,
        isVerified: false,
        joinedAt: new Date(),
        lastSeen: new Date(),
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return this.mapToUser(user);
  }

  /**
   * Update user last seen timestamp
   */
  async updateLastSeen(userId: UserId): Promise<void> {
    await db
      .update(users)
      .set({
        lastSeen: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  /**
   * Update user password
   */
  async updatePassword(userId: UserId, newPassword: string): Promise<void> {
    const passwordHash = await this.hashPassword(newPassword);
    
    await db
      .update(users)
      .set({
        password: passwordHash,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }


  /**
   * Verify user password by username or email
   */
  async verifyPasswordByUsernameOrEmail(
    usernameOrEmail: string, 
    password: string
  ): Promise<{ verified: boolean; user: User | null }> {
    const user = await this.findUserByUsernameOrEmail(usernameOrEmail);
    
    if (!user) {
      return { verified: false, user: null };
    }
    
    // Get the password hash from database
    const [dbUser] = await db
      .select({ password: users.password })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);
    
    if (!dbUser) {
      return { verified: false, user: null };
    }
    
    const verified = await this.verifyPasswordHash(password, dbUser.password);
    
    return { verified, user: verified ? user : null };
  }

  /**
   * Activate user account
   */
  async activateUser(userId: UserId): Promise<void> {
    await db
      .update(users)
      .set({
        isActive: true,
        emailVerified: true,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  /**
   * Check if username exists
   */
  async usernameExists(username: string): Promise<boolean> {
    const [result] = await db
      .select({ count: users.id })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    
    return !!result;
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    const [result] = await db
      .select({ count: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    return !!result;
  }

  /**
   * Hash password using Argon2
   */
  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      memoryCost: 19456, // 19 MiB
      timeCost: 2,
      outputLen: 32,
      parallelism: 1
    });
  }

  /**
   * Verify password hash
   */
  private async verifyPasswordHash(password: string, hash: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password, {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1
      });
    } catch {
      // Handle invalid hash format or other errors
      return false;
    }
  }

  /**
   * Verify password for a specific user ID
   */
  async verifyPassword(userId: string, password: string): Promise<{ verified: boolean }> {
    const [dbUser] = await db
      .select({ password: users.password })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (!dbUser || !dbUser.password) {
      return { verified: false };
    }
    
    return { verified: await this.verifyPasswordHash(password, dbUser.password) };
  }

  /**
   * Soft delete user account
   */
  async softDeleteUser(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        isActive: false,
        deletedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  /**
   * Map database user to User type
   * Adds computed fields like isAdmin, isModerator
   */
  mapToUser(dbUser: any): User {
    return {
      ...dbUser,
      // Ensure dates are properly formatted
      createdAt: dbUser.createdAt instanceof Date ? dbUser.createdAt.toISOString() : dbUser.createdAt,
      updatedAt: dbUser.updatedAt instanceof Date ? dbUser.updatedAt.toISOString() : dbUser.updatedAt,
      lastSeen: dbUser.lastSeen instanceof Date ? dbUser.lastSeen.toISOString() : dbUser.lastSeen,
      joinedAt: dbUser.joinedAt instanceof Date ? dbUser.joinedAt.toISOString() : dbUser.joinedAt,
      // Add computed fields
      isAdmin: dbUser.role === 'admin' || dbUser.role === 'owner',
      isModerator: dbUser.role === 'moderator' || dbUser.role === 'owner',
      isOnline: false, // Will be computed elsewhere based on session
      // Map social fields if they exist
      social: dbUser.website || dbUser.github || dbUser.twitter || dbUser.discord ? {
        website: dbUser.website,
        github: dbUser.github,
        twitter: dbUser.twitter,
        discord: dbUser.discord
      } : undefined
    };
  }
}

// Export singleton instance
export const authRepository = new AuthRepository();