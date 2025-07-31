/**
 * Lucia Auth Middleware
 * 
 * Middleware functions for handling authentication with Lucia.
 * Replaces the previous Passport.js and JWT-based middleware.
 */

import type { Request, Response, NextFunction } from 'express';
import type { User, Session } from 'lucia';
import { lucia } from '../lib/lucia/index.js';
import { luciaAuthService } from '@domains/auth/services/lucia-auth.service';
import { errorResponses } from '@utils/api-responses';
import { logger } from '@core/logger';
import { isDevMode } from '@utils/environment';
import { devQuickLogin } from '../lib/lucia/dev-auth.js';

// Extend Express Request type to include Lucia user and session
declare global {
  namespace Express {
    interface Request {
      user?: User | null;
      session?: Session | null;
      sessionId?: string | null;
    }
  }
}

/**
 * Validate request - populates req.user and req.session if valid
 * This is the base middleware that all other auth middleware builds on
 */
export async function validateRequest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Read session cookie
    const sessionId = lucia.readSessionCookie(req.headers.cookie ?? '');
    req.sessionId = sessionId;
    
    if (!sessionId) {
      req.user = null;
      req.session = null;
      return next();
    }

    // Validate session
    const { user, session } = await luciaAuthService.validateSession(sessionId);
    
    if (session && session.fresh) {
      // Session was extended, send new cookie
      const sessionCookie = lucia.createSessionCookie(session.id);
      res.setHeader('Set-Cookie', sessionCookie.serialize());
    }
    
    if (!session) {
      // Invalid session, clear cookie
      const sessionCookie = lucia.createBlankSessionCookie();
      res.setHeader('Set-Cookie', sessionCookie.serialize());
      req.user = null;
      req.session = null;
      return next();
    }

    // Populate request with user and session
    req.user = user;
    req.session = session;
    next();
  } catch (error) {
    logger.error('AUTH', 'Error validating request', { error });
    req.user = null;
    req.session = null;
    next();
  }
}

/**
 * Require authenticated user
 * Returns 401 if not authenticated
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  await validateRequest(req, res, () => {
    if (!req.user || !req.session) {
      return errorResponses.unauthorized(res, 'Authentication required');
    }
    next();
  });
}

/**
 * Optional authentication
 * Continues even if not authenticated, but populates user if available
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  await validateRequest(req, res, next);
}

/**
 * Require admin role
 * Returns 403 if not admin
 */
export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  await requireAuth(req, res, () => {
    if (!req.user?.isAdmin) {
      return errorResponses.forbidden(res, 'Admin access required');
    }
    next();
  });
}

/**
 * Require moderator role (or higher)
 * Returns 403 if not moderator or admin
 */
export async function requireModerator(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  await requireAuth(req, res, () => {
    if (!req.user?.isModerator && !req.user?.isAdmin) {
      return errorResponses.forbidden(res, 'Moderator access required');
    }
    next();
  });
}

/**
 * Require admin or moderator role
 * Returns 403 if neither admin nor moderator
 */
export async function requireAdminOrModerator(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  await requireAuth(req, res, () => {
    if (!req.user?.isAdmin && !req.user?.isModerator) {
      return errorResponses.forbidden(res, 'Admin or moderator access required');
    }
    next();
  });
}

/**
 * Development mode authentication handler
 * Allows quick login with special headers in dev mode
 */
export async function devModeAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Only active in development mode
  if (!isDevMode() || process.env.DEV_BYPASS_PASSWORD !== 'true') {
    return next();
  }

  // Check for dev auth header
  const devUsername = req.headers['x-dev-auth'] as string;
  if (!devUsername) {
    return next();
  }

  try {
    // Quick login with dev user
    const { user, session, sessionCookie } = await devQuickLogin(devUsername);
    
    // Set session cookie
    res.setHeader('Set-Cookie', sessionCookie.serialize());
    
    // Populate request
    req.user = user;
    req.session = session;
    req.sessionId = session.id;
    
    logger.info('AUTH', 'Dev mode auth activated', { 
      username: devUsername, 
      userId: user.id,
      role: user.role 
    });
    
    next();
  } catch (error) {
    logger.error('AUTH', 'Dev mode auth failed', { error, devUsername });
    next();
  }
}

/**
 * Rate limiting for auth endpoints
 * Prevents brute force attacks
 */
export function authRateLimit() {
  // TODO: Implement rate limiting with Redis
  // For now, just pass through
  return (req: Request, res: Response, next: NextFunction) => {
    next();
  };
}

/**
 * CSRF protection for auth endpoints
 * Validates request origin
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Skip CSRF in development
  if (isDevMode()) {
    return next();
  }

  // Check origin header
  const origin = req.headers.origin || req.headers.referer;
  const host = req.headers.host;
  
  if (!origin || !host) {
    return errorResponses.forbidden(res, 'Invalid request origin');
  }
  
  // Validate origin matches host
  const validOrigins = [
    `https://${host}`,
    `http://${host}`, // Allow HTTP in case of local development
  ];
  
  const originUrl = new URL(origin);
  const isValidOrigin = validOrigins.some(valid => 
    originUrl.origin === valid || originUrl.origin.startsWith(valid)
  );
  
  if (!isValidOrigin) {
    logger.warn('AUTH', 'CSRF validation failed', { origin, host });
    return errorResponses.forbidden(res, 'Invalid request origin');
  }
  
  next();
}

/**
 * Log authentication events
 */
export function logAuthEvent(eventType: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Log after response is sent
    res.on('finish', () => {
      if (res.statusCode < 400) {
        logger.info('AUTH', `Auth event: ${eventType}`, {
          userId: req.user?.id,
          username: req.user?.username,
          ip: req.ip,
          userAgent: req.headers['user-agent']
        });
      }
    });
    next();
  };
}

// Export all middleware functions
export const luciaAuth = {
  validate: validateRequest,
  require: requireAuth,
  optional: optionalAuth,
  requireAdmin,
  requireModerator,
  requireAdminOrModerator,
  devMode: devModeAuth,
  rateLimit: authRateLimit,
  csrf: csrfProtection,
  logEvent: logAuthEvent
};