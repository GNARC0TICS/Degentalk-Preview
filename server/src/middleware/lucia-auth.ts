/**
 * Lucia Auth Middleware for Express.js
 * 
 * This middleware replaces the current Passport.js middleware with Lucia-based
 * session validation. It maintains compatibility with the existing middleware API.
 */

import type { Request, Response, NextFunction } from 'express';
import { lucia } from '../lib/lucia';
import { validateSessionFromRequest, setSessionCookie, deleteSessionCookie } from '../lib/session';
import { DevAuthManager } from '../lib/auth';
import { sendErrorResponse } from '@core/utils/transformer.helpers';
import { logger } from '@core/logger';
import type { User } from '@shared/types/user.types';
import type { Session } from 'lucia';

/**
 * Enhanced Request interface with Lucia session data
 */
interface AuthenticatedRequest extends Request {
  user?: User | null;
  session?: Session | null;
}

/**
 * Middleware configuration
 */
const isDevelopment = process.env.NODE_ENV === 'development';
const devBypassEnabled = process.env.DEV_BYPASS_PASSWORD === 'true';
const allowDevAdmin = process.env.ALLOW_DEV_ADMIN === 'true';

/**
 * Core authentication middleware
 * Validates sessions and attaches user/session to request
 */
export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { user, session } = await validateSessionFromRequest(req);
    
    // Attach to request
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
    
    // Development mode handling
    if (isDevelopment && !user && devBypassEnabled) {
      const devRole = req.headers['x-dev-role'] as string;
      if (devRole && ['user', 'moderator', 'admin', 'super_admin'].includes(devRole)) {
        const mockUser = DevAuthManager.getMockUser(devRole as any);
        req.user = mockUser;
        logger.warn('LuciaAuth', 'Development auth bypass used', { role: devRole });
      }
    }
    
    next();
  } catch (error) {
    logger.error('LuciaAuth', 'Authentication middleware error', error);
    req.user = null;
    req.session = null;
    next();
  }
}

/**
 * Require authentication - blocks request if not authenticated
 */
export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  await authenticate(req, res, () => {
    if (!req.user) {
      sendErrorResponse(res, 'Authentication required. Please login to access this resource', 401);
      return;
    }
    
    if (!req.user.isActive) {
      sendErrorResponse(res, 'Account is inactive', 403);
      return;
    }
    
    if (req.user.isBanned) {
      sendErrorResponse(res, 'Account is banned', 403);
      return;
    }
    
    next();
  });
}

/**
 * Require admin role
 */
export async function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  await requireAuth(req, res, () => {
    if (!req.user) {
      sendErrorResponse(res, 'Authentication required', 401);
      return;
    }
    
    // Development admin bypass
    if (isDevelopment && allowDevAdmin && req.user.username === 'DevUser') {
      logger.warn('LuciaAuth', 'Development admin bypass used');
      req.user = { ...req.user, role: 'admin', isAdmin: true };
      return next();
    }
    
    if (!req.user.isAdmin && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      sendErrorResponse(res, 'Insufficient permissions. Admin access required', 403);
      return;
    }
    
    next();
  });
}

/**
 * Require moderator role (or higher)
 */
export async function requireModerator(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  await requireAuth(req, res, () => {
    if (!req.user) {
      sendErrorResponse(res, 'Authentication required', 401);
      return;
    }
    
    const allowedRoles = ['moderator', 'admin', 'super_admin'];
    const hasModeratorAccess = req.user.isModerator || 
                              req.user.isAdmin || 
                              allowedRoles.includes(req.user.role);
    
    if (!hasModeratorAccess) {
      sendErrorResponse(res, 'Insufficient permissions. Moderator access required', 403);
      return;
    }
    
    next();
  });
}

/**
 * Optional authentication - attaches user if authenticated but doesn't block
 */
export async function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  await authenticate(req, res, next);
}

/**
 * Require valid session (not just user)
 */
export async function requireSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  await authenticate(req, res, () => {
    if (!req.session) {
      sendErrorResponse(res, 'Valid session required', 401);
      return;
    }
    
    next();
  });
}

/**
 * CSRF protection middleware
 * Verifies request origin for state-changing requests
 */
export function verifyRequestOrigin(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin;
  const host = req.headers.host;
  
  // Skip verification for GET and HEAD requests
  if (req.method === 'GET' || req.method === 'HEAD') {
    return next();
  }
  
  // Skip in development if explicitly disabled
  if (isDevelopment && process.env.DISABLE_CSRF_CHECK === 'true') {
    return next();
  }
  
  if (!origin || !host) {
    sendErrorResponse(res, 'Missing origin or host header', 403);
    return;
  }
  
  const expectedOrigin = isDevelopment ? 
    `http://${host}` : 
    `https://${host}`;
  
  if (origin !== expectedOrigin) {
    logger.warn('LuciaAuth', 'CSRF check failed', { 
      origin, 
      expectedOrigin, 
      method: req.method,
      path: req.path 
    });
    sendErrorResponse(res, 'Invalid request origin', 403);
    return;
  }
  
  next();
}

/**
 * Development mode role switching handler
 */
export async function devModeRoleSwitch(req: Request, res: Response) {
  if (!isDevelopment) {
    sendErrorResponse(res, 'Dev mode only', 403);
    return;
  }
  
  const { role } = req.query;
  const validRoles = ['user', 'moderator', 'admin', 'super_admin'];
  
  if (!role || !validRoles.includes(role as string)) {
    sendErrorResponse(res, 'Invalid role', 400);
    return;
  }
  
  try {
    const mockSession = await DevAuthManager.createMockSession(role as any);
    setSessionCookie(res, mockSession);
    
    res.json({ 
      success: true, 
      role,
      message: `Switched to ${role} role`,
      sessionId: mockSession.id
    });
  } catch (error) {
    logger.error('LuciaAuth', 'Dev role switch error', error);
    sendErrorResponse(res, 'Failed to switch role', 500);
  }
}

/**
 * Backward compatibility aliases
 * These maintain compatibility with existing route definitions
 */
export const isAuthenticated = requireAuth;
export const isAdmin = requireAdmin;
export const isModerator = requireModerator;
export const isAdminOrModerator = requireModerator;
export const isAuthenticatedOptional = optionalAuth;

/**
 * Extend Express Request type globally
 */
declare global {
  namespace Express {
    interface Request {
      user?: User | null;
      session?: Session | null;
    }
  }
}