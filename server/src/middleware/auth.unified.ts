/**
 * Unified Authentication Middleware
 * 
 * Consolidates all authentication logic into a single, consistent implementation.
 * Supports both JWT and session-based authentication with proper fallbacks.
 */

import type { Request, Response, NextFunction } from 'express';
import type { User } from '@core/utils/auth.helpers';
import { getUser } from '@core/utils/auth.helpers';
import { verifyToken, extractTokenFromHeader } from '../domains/auth/utils/jwt.utils';
import { userService } from '@core/services/user.service';
import { sendErrorResponse } from '@core/utils/transformer.helpers';
import { logger } from '@core/logger';
import type { UserId } from '@shared/types/ids';

// Extend Express Request type
// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * Development mode configuration
 */
const isDevelopment = process.env.NODE_ENV === 'development';
const devBypassEnabled = process.env.DEV_BYPASS_PASSWORD === 'true';
const allowDevAdmin = process.env.ALLOW_DEV_ADMIN === 'true';

/**
 * Create a mock user for development
 */
function createMockUser(overrides?: Partial<User>): User {
  return {
    id: '1' as UserId,
    username: 'DevUser',
    email: 'dev@example.com',
    role: 'user',
    emailVerified: true,
    createdAt: new Date(),
    ...overrides
  };
}

/**
 * Core authentication function
 * Checks JWT token first, then falls back to session
 */
async function authenticateRequest(req: Request): Promise<User | null> {
  try {
    // 1. Check if user already attached by session middleware
    if (req.user) {
      return req.user as User;
    }

    // 2. Check for JWT token
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        const userProfile = await userService.getUserById(decoded.userId);
        if (userProfile && userProfile.isActive) {
          // Get full user data from database if needed
          const dbUser = await userService.getUserFromRequest(req);
          return {
            id: userProfile.id,
            username: userProfile.username,
            email: userProfile.email,
            role: userProfile.role as User['role'],
            emailVerified: true, // UserProfile doesn't have this field
            createdAt: userProfile.createdAt,
            lastSeen: userProfile.updatedAt
          };
        }
      }
    }

    // 3. Check session (passport)
    const sessionUser = getUser(req);
    if (sessionUser) {
      return sessionUser;
    }

    // 4. Development mode bypass
    if (isDevelopment && devBypassEnabled) {
      const devRole = req.headers['x-dev-role'] as string;
      const validRoles = ['user', 'moderator', 'admin', 'owner'];
      const role = validRoles.includes(devRole) ? devRole : 'user';
      
      logger.warn('Development auth bypass used', { role });
      return createMockUser({ role: role as User['role'] });
    }

    return null;
  } catch (error) {
    logger.error('Authentication error', error);
    return null;
  }
}

/**
 * Authentication middleware - allows request to continue even if not authenticated
 * Attaches user to request if authenticated
 */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const user = await authenticateRequest(req);
  if (user) {
    req.user = user;
  }
  next();
}

/**
 * Require authentication - blocks request if not authenticated
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = await authenticateRequest(req);
  
  if (!user) {
    sendErrorResponse(res, 'Authentication required. Please login to access this resource', 401);
    return;
  }
  
  req.user = user;
  next();
}

/**
 * Require admin role
 */
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = await authenticateRequest(req);
  
  if (!user) {
    sendErrorResponse(res, 'Authentication required', 401);
    return;
  }
  
  // Development mode admin bypass
  if (isDevelopment && allowDevAdmin && user.username === 'DevUser') {
    logger.warn('AUTH', 'Development admin bypass used');
    req.user = { ...user, role: 'admin' };
    return next();
  }
  
  if (user.role !== 'admin' && user.role !== 'owner') {
    sendErrorResponse(res, 'Insufficient permissions. Admin access required', 403);
    return;
  }
  
  req.user = user;
  next();
}

/**
 * Require moderator role (or higher)
 */
export async function requireModerator(req: Request, res: Response, next: NextFunction) {
  const user = await authenticateRequest(req);
  
  if (!user) {
    sendErrorResponse(res, 'Authentication required', 401);
    return;
  }
  
  const allowedRoles: User['role'][] = ['moderator', 'admin', 'owner'];
  if (!allowedRoles.includes(user.role)) {
    sendErrorResponse(res, 'Insufficient permissions. Moderator access required', 403);
    return;
  }
  
  req.user = user;
  next();
}

/**
 * Optional authentication - attaches user if authenticated but doesn't block
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const user = await authenticateRequest(req);
  if (user) {
    req.user = user;
  }
  next();
}

/**
 * Aliases for backward compatibility
 */
export const isAuthenticated = requireAuth;
export const isAdmin = requireAdmin;
export const isModerator = requireModerator;
export const isAdminOrModerator = requireModerator;
export const isAuthenticatedOptional = optionalAuth;

/**
 * JWT-specific authentication (for routes that ONLY accept JWT)
 */
export async function requireJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = extractTokenFromHeader(authHeader);
  
  if (!token) {
    sendErrorResponse(res, 'No token provided. Bearer token required', 401);
    return;
  }
  
  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      sendErrorResponse(res, 'Invalid token', 401);
      return;
    }
    
    const userProfile = await userService.getUserById(decoded.userId);
    if (!userProfile || !userProfile.isActive) {
      sendErrorResponse(res, 'User not found or inactive', 401);
      return;
    }
    
    req.user = {
      id: userProfile.id,
      username: userProfile.username,
      email: userProfile.email,
      role: userProfile.role as User['role'],
      emailVerified: true, // UserProfile doesn't have this field
      createdAt: userProfile.createdAt,
      lastSeen: userProfile.updatedAt
    };
    
    next();
  } catch (error) {
    logger.error('JWT verification error', error);
    sendErrorResponse(res, 'Token verification failed', 401);
    return;
  }
}

/**
 * Session-specific authentication (for routes that ONLY accept sessions)
 */
export function requireSession(req: Request, res: Response, next: NextFunction) {
  const user = getUser(req);
  
  if (!user) {
    sendErrorResponse(res, 'Session required. Please login to access this resource', 401);
    return;
  }
  
  req.user = user;
  next();
}