/**
 * Lucia Auth Configuration
 * 
 * Central configuration for Lucia authentication system.
 * Handles session management, user attributes, and cookie settings.
 */

import { Lucia, TimeSpan } from "lucia";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { db } from "@db";
import { sessions, users } from "@schema";
import type { User } from "@shared/types/user.types";
import { isDevMode } from "@utils/environment";
import type * as Express from 'express';

// Create the adapter for PostgreSQL with Drizzle
const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

// Initialize Lucia with our configuration
export const lucia = new Lucia(adapter, {
  sessionExpiresIn: new TimeSpan(30, "d"), // Sessions expire after 30 days
  sessionCookie: {
    name: "degentalk_session",
    expires: false, // Session cookies (expire when browser closes)
    attributes: {
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      httpOnly: true, // Prevent JavaScript access
      sameSite: "lax", // CSRF protection
      path: "/" // Available on all routes
    }
  },
  getUserAttributes: (attributes) => {
    // Map database user attributes to Lucia user object
    // This is called whenever a user is fetched
    return {
      // Core identity
      id: attributes.id,
      username: attributes.username,
      email: attributes.email,
      role: attributes.role,
      
      // Profile
      displayName: attributes.displayName,
      avatarUrl: attributes.avatarUrl,
      activeAvatarUrl: attributes.activeAvatarUrl,
      bannerUrl: attributes.profileBannerUrl,
      bio: attributes.bio,
      signature: attributes.signature,
      
      // Gamification
      xp: attributes.xp,
      level: attributes.level,
      reputation: attributes.reputation,
      
      // Wallet
      walletId: attributes.walletId,
      dgtBalance: attributes.dgtBalance,
      totalTipped: attributes.totalTipped,
      totalReceived: attributes.totalReceived,
      
      // Status
      emailVerified: attributes.emailVerified,
      isActive: attributes.isActive,
      isBanned: attributes.isBanned,
      isVerified: attributes.isVerified,
      
      // Timestamps
      createdAt: attributes.createdAt,
      updatedAt: attributes.updatedAt,
      lastSeen: attributes.lastSeen,
      joinedAt: attributes.joinedAt,
      
      // Cosmetics
      activeFrameId: attributes.activeFrameId,
      activeBadgeId: attributes.activeBadgeId,
      activeTitleId: attributes.activeTitleId,
      
      // Social (if loaded)
      social: attributes.website || attributes.github || attributes.twitter || attributes.discord ? {
        website: attributes.website,
        github: attributes.github,
        twitter: attributes.twitter,
        discord: attributes.discord
      } : undefined,
      
      // Computed flags
      isAdmin: attributes.role === 'admin' || attributes.role === 'owner',
      isModerator: attributes.role === 'moderator' || attributes.role === 'owner',
      
      // Additional properties
      permissions: attributes.permissions,
      pluginData: attributes.pluginData,
      settings: attributes.settings,
      preferences: attributes.preferences
    } as LuciaUser;
  }
});

/**
 * Type declarations for Lucia
 * This tells TypeScript about our custom user and session attributes
 */
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
    DatabaseSessionAttributes: DatabaseSessionAttributes;
  }
}

/**
 * Database user attributes
 * These are the fields from the users table that Lucia needs to know about
 */
interface DatabaseUserAttributes {
  // Core identity
  id: string;
  username: string;
  email: string;
  role: 'user' | 'moderator' | 'admin' | 'owner';
  
  // Profile
  displayName?: string;
  avatarUrl?: string;
  activeAvatarUrl?: string;
  profileBannerUrl?: string;
  bio?: string;
  signature?: string;
  
  // Gamification
  xp: number;
  level: number;
  reputation: number;
  
  // Wallet
  walletId?: string;
  dgtBalance: number;
  totalTipped: number;
  totalReceived: number;
  
  // Status
  emailVerified: boolean;
  isActive: boolean;
  isBanned: boolean;
  isVerified: boolean;
  
  // Timestamps
  createdAt: Date | string;
  updatedAt?: Date | string;
  lastSeen: Date | string;
  joinedAt: Date | string;
  
  // Cosmetics
  activeFrameId?: string;
  activeBadgeId?: string;
  activeTitleId?: string;
  
  // Social
  website?: string;
  github?: string;
  twitter?: string;
  discord?: string;
  
  // Additional
  permissions?: string[];
  pluginData?: Record<string, any>;
  settings?: any;
  preferences?: any;
}

/**
 * Database session attributes
 * Additional fields we store in the session table
 */
interface DatabaseSessionAttributes {
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  lastActiveAt: Date;
}

/**
 * Lucia user type
 * This is what gets returned from getUserAttributes
 */
interface LuciaUser extends Omit<User, 'id'> {
  id: string;
  isAdmin: boolean;
  isModerator: boolean;
}

/**
 * Helper to generate a device ID from request info
 */
export function generateDeviceId(req: Express.Request): string {
  const ua = req.headers['user-agent'] || 'unknown';
  const ip = req.ip || 'unknown';
  const acceptLang = req.headers['accept-language'] || 'unknown';
  
  // Create a simple hash of the device characteristics
  const deviceString = `${ua}-${ip}-${acceptLang}`;
  return Buffer.from(deviceString).toString('base64').slice(0, 32);
}

/**
 * Helper to get client IP address (handles proxies)
 */
export function getClientIp(req: Express.Request): string {
  // Check for forwarded IP (when behind proxy/load balancer)
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, get the first one
    return (forwarded as string).split(',')[0].trim();
  }
  
  // Fallback to direct connection IP
  return req.ip || req.socket.remoteAddress || 'unknown';
}

// Log Lucia initialization in dev mode
if (isDevMode()) {
  console.log('[Lucia] Authentication system initialized');
  console.log('[Lucia] Session cookie name:', lucia.sessionCookieName);
  console.log('[Lucia] Session expiry:', '30 days');
}