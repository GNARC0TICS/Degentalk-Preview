/**
 * Session Management Utilities for Lucia Auth
 * 
 * This file provides utilities for session creation, validation, and management
 * that work with Express.js and can be adapted for other frameworks.
 */

import { lucia } from "./lucia";
import { generateIdFromEntropySize } from "lucia";
import type { Request, Response } from "express";
import type { User, Session } from "lucia";

/**
 * Validate session from request
 * Checks for session cookie and validates it against database
 */
export async function validateSessionFromRequest(req: Request): Promise<{ user: User | null; session: Session | null }> {
  const sessionId = req.cookies[lucia.sessionCookieName] ?? null;
  
  if (!sessionId) {
    return { user: null, session: null };
  }

  const result = await lucia.validateSession(sessionId);
  return result;
}

/**
 * Create a new session for a user
 */
export async function createSession(userId: string, attributes?: Record<string, any>): Promise<Session> {
  return await lucia.createSession(userId, attributes || {});
}

/**
 * Invalidate a session
 */
export async function invalidateSession(sessionId: string): Promise<void> {
  await lucia.invalidateSession(sessionId);
}

/**
 * Invalidate all sessions for a user
 */
export async function invalidateAllUserSessions(userId: string): Promise<void> {
  await lucia.invalidateUserSessions(userId);
}

/**
 * Set session cookie on response
 */
export function setSessionCookie(res: Response, session: Session): void {
  const sessionCookie = lucia.createSessionCookie(session.id);
  res.setHeader("Set-Cookie", sessionCookie.serialize());
}

/**
 * Clear session cookie on response
 */
export function deleteSessionCookie(res: Response): void {
  const sessionCookie = lucia.createBlankSessionCookie();
  res.setHeader("Set-Cookie", sessionCookie.serialize());
}

/**
 * Generate a secure session token
 * (For custom session implementations if needed)
 */
export function generateSessionToken(): string {
  return generateIdFromEntropySize(25); // 25 * 8 / 5 = 40 characters
}

/**
 * Middleware to validate and attach session to request
 */
export async function sessionMiddleware(req: Request, res: Response, next: Function): Promise<void> {
  try {
    const { user, session } = await validateSessionFromRequest(req);
    
    // Attach to request object
    req.user = user;
    req.session = session;
    
    // Handle session refresh
    if (session && session.fresh) {
      setSessionCookie(res, session);
    }
    
    // Clear invalid session cookie
    if (!session && req.cookies[lucia.sessionCookieName]) {
      deleteSessionCookie(res);
    }
    
    next();
  } catch (error) {
    console.error('Session middleware error:', error);
    req.user = null;
    req.session = null;
    next();
  }
}

/**
 * Development mode utilities
 */
export class DevSessionManager {
  private static mockUsers = {
    'user': 'dev-user-id',
    'moderator': 'dev-moderator-id', 
    'admin': 'dev-admin-id',
    'super_admin': 'dev-super-admin-id'
  };

  /**
   * Create a development session for testing
   */
  static async createDevSession(role: keyof typeof DevSessionManager.mockUsers): Promise<Session | null> {
    if (process.env.NODE_ENV !== 'development') {
      console.warn('Dev sessions only available in development mode');
      return null;
    }

    const userId = this.mockUsers[role];
    if (!userId) {
      throw new Error(`Invalid dev role: ${role}`);
    }

    return await createSession(userId, { devMode: true, role });
  }

  /**
   * Check if session is a development session
   */
  static isDevSession(session: Session): boolean {
    return session.id.startsWith('dev-') || 
           (session as any).devMode === true;
  }
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: User | null;
      session?: Session | null;
    }
  }
}