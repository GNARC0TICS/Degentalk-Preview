/**
 * Lucia Auth Service
 * 
 * Business logic for authentication using Lucia.
 * Handles login, logout, registration, and session management.
 */

import { lucia, generateDeviceId, getClientIp } from '../../../lib/lucia/index.js';
import { authRepository } from '../repositories/auth.repository';
import type { User } from '@shared/types/user.types';
import type { Session } from 'lucia';
import { isDevMode } from '@utils/environment';
import { logger } from '@core/logger';
import type { Request } from 'express';
import { sendSuccess, sendError, errorResponses } from '@utils/api-responses';
import { ApiErrorCode } from '@shared/types/api.types';

export class LuciaAuthService {
  /**
   * Login user with username/email and password
   */
  async login(
    usernameOrEmail: string, 
    password: string, 
    request: Request
  ): Promise<{
    success: boolean;
    user?: User;
    session?: Session;
    sessionCookie?: any;
    error?: string;
  }> {
    try {
      // Verify user credentials
      const { verified, user } = await authRepository.verifyPasswordByUsernameOrEmail(
        usernameOrEmail, 
        password
      );

      if (!verified || !user) {
        return { 
          success: false, 
          error: 'Invalid username or password' 
        };
      }

      // Check if user is active
      if (!user.isActive) {
        return { 
          success: false, 
          error: 'Your account is not active. Please verify your email.' 
        };
      }

      // Check if user is banned
      if (user.isBanned) {
        return { 
          success: false, 
          error: 'Your account has been suspended.' 
        };
      }

      // Create session with metadata
      const session = await lucia.createSession(user.id, {
        ipAddress: getClientIp(request),
        userAgent: request.headers['user-agent'] || 'unknown',
        deviceId: generateDeviceId(request),
        lastActiveAt: new Date()
      });

      // Create session cookie
      const sessionCookie = lucia.createSessionCookie(session.id);

      // Update last seen
      await authRepository.updateLastSeen(user.id);

      logger.info('AUTH', 'User logged in successfully', { 
        userId: user.id, 
        username: user.username,
        sessionId: session.id 
      });

      return {
        success: true,
        user,
        session,
        sessionCookie
      };
    } catch (error) {
      logger.error('AUTH', 'Login error', { error });
      return { 
        success: false, 
        error: 'An error occurred during login' 
      };
    }
  }

  /**
   * Logout user by invalidating session
   */
  async logout(sessionId: string | null): Promise<void> {
    if (!sessionId) return;
    
    try {
      await lucia.invalidateSession(sessionId);
      logger.info('AUTH', 'User logged out', { sessionId });
    } catch (error) {
      logger.error('AUTH', 'Logout error', { error, sessionId });
      // Continue even if invalidation fails
    }
  }

  /**
   * Register new user
   */
  async register(data: {
    username: string;
    email: string;
    password: string;
  }, request?: Request): Promise<{
    success: boolean;
    user?: User;
    session?: Session;
    sessionCookie?: any;
    error?: string;
    message?: string;
  }> {
    try {
      // Validate username
      if (!data.username || data.username.length < 3) {
        return { 
          success: false, 
          error: 'Username must be at least 3 characters' 
        };
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        return { 
          success: false, 
          error: 'Please provide a valid email address' 
        };
      }

      // Validate password
      if (!data.password || data.password.length < 6) {
        return { 
          success: false, 
          error: 'Password must be at least 6 characters' 
        };
      }

      // Check if username exists
      if (await authRepository.usernameExists(data.username)) {
        return { 
          success: false, 
          error: 'Username is already taken' 
        };
      }

      // Check if email exists
      if (await authRepository.emailExists(data.email)) {
        return { 
          success: false, 
          error: 'Email is already registered' 
        };
      }

      // Create user
      const user = await authRepository.createUser(data);

      logger.info('AUTH', 'New user registered', { 
        userId: user.id, 
        username: user.username,
        email: user.email 
      });

      // In dev mode, auto-activate and create session
      if (isDevMode() && request) {
        const session = await lucia.createSession(user.id, {
          ipAddress: getClientIp(request),
          userAgent: request.headers['user-agent'] || 'unknown',
          deviceId: generateDeviceId(request),
          lastActiveAt: new Date()
        });

        const sessionCookie = lucia.createSessionCookie(session.id);
        
        return {
          success: true,
          user,
          session,
          sessionCookie,
          message: 'Registration successful! You are now logged in.'
        };
      }

      // In production, require email verification
      // TODO: Implement email verification
      
      return {
        success: true,
        user,
        message: 'Registration successful! Please check your email to verify your account.'
      };
    } catch (error) {
      logger.error('AUTH', 'Registration error', { error });
      return { 
        success: false, 
        error: 'An error occurred during registration' 
      };
    }
  }

  /**
   * Validate session and get user
   */
  async validateSession(sessionId: string): Promise<{
    user: User | null;
    session: Session | null;
  }> {
    try {
      const result = await lucia.validateSession(sessionId);
      
      if (!result.user || !result.session) {
        return { user: null, session: null };
      }

      // Get full user data from repository
      const user = await authRepository.findUserById(result.user.id);
      
      if (!user) {
        return { user: null, session: null };
      }

      return { user, session: result.session };
    } catch (error) {
      logger.error('AUTH', 'Session validation error', { error });
      return { user: null, session: null };
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    return authRepository.findUserById(userId);
  }

  /**
   * Refresh session expiry
   */
  async refreshSession(sessionId: string): Promise<Session | null> {
    try {
      const { session } = await lucia.validateSession(sessionId);
      
      if (!session) return null;

      // If session needs refresh, Lucia will handle it automatically
      // We just need to update last active time in our metadata
      // This would require extending Lucia's session update capabilities
      
      return session;
    } catch (error) {
      logger.error('AUTH', 'Session refresh error', { error });
      return null;
    }
  }

  /**
   * Invalidate all sessions for a user
   */
  async invalidateAllUserSessions(userId: string): Promise<void> {
    try {
      await lucia.invalidateUserSessions(userId);
      logger.info('AUTH', 'All user sessions invalidated', { userId });
    } catch (error) {
      logger.error('AUTH', 'Error invalidating user sessions', { error, userId });
      throw error;
    }
  }

  /**
   * Create blank session cookie (for logout)
   */
  createBlankSessionCookie() {
    return lucia.createBlankSessionCookie();
  }

  /**
   * Read session cookie from request
   */
  readSessionCookie(cookieHeader: string | undefined): string | null {
    if (!cookieHeader) return null;
    return lucia.readSessionCookie(cookieHeader);
  }
}

// Export singleton instance
export const luciaAuthService = new LuciaAuthService();