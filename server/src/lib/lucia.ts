/**
 * Lucia Auth Configuration for DegenTalk
 * 
 * This file sets up Lucia authentication with Drizzle PostgreSQL adapter.
 * Lucia provides secure session management with built-in CSRF protection.
 */

import { Lucia } from "lucia";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { db } from '@degentalk/db';
import { users, sessions } from "@schema";
import type { User } from "@shared/types/user.types";

// Create Drizzle adapter for PostgreSQL
const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

// Initialize Lucia with configuration
export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      // Set secure flag in production
      secure: process.env.NODE_ENV === "production",
      // Lax SameSite for CSRF protection while allowing top-level navigation
      sameSite: "lax",
      // HttpOnly to prevent XSS attacks
      httpOnly: true,
      // Cookie path
      path: "/",
      // Session expires in 30 days
      maxAge: 60 * 60 * 24 * 30
    }
  },
  // Session expires in 30 days
  sessionExpiresIn: 1000 * 60 * 60 * 24 * 30,
  // Map database user attributes to Lucia user
  getUserAttributes: (attributes) => {
    return {
      id: attributes.id,
      username: attributes.username,
      email: attributes.email,
      role: attributes.role || 'user',
      isActive: attributes.isActive,
      isVerified: attributes.isVerified,
      isBanned: attributes.isBanned,
      avatarUrl: attributes.avatarUrl,
      level: attributes.level,
      xp: attributes.xp,
      reputation: attributes.reputation,
      dgtBalance: attributes.dgtBalance,
      createdAt: attributes.createdAt,
      lastSeenAt: attributes.lastSeenAt,
      // Add other frequently accessed user attributes
      isAdmin: attributes.isAdmin,
      isModerator: attributes.isModerator,
      isStaff: attributes.isStaff
    };
  }
});

// Declare module augmentation for TypeScript
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUser;
  }
}

// Define database user attributes type
// This matches the user table schema minus the id field
interface DatabaseUser {
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  isBanned: boolean;
  avatarUrl: string | null;
  level: number;
  xp: number;
  reputation: number;
  dgtBalance: number;
  createdAt: Date;
  lastSeenAt: Date | null;
  isAdmin: boolean;
  isModerator: boolean;
  isStaff: boolean;
  // Add other attributes as needed
}

// Export types for use in other modules
export type { DatabaseUser };