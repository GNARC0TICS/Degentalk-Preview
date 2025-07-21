/**
 * Rate Limiting Middleware for Wallet Operations
 * 
 * Provides configurable rate limiting for sensitive wallet endpoints
 * to prevent abuse and protect against DDoS attacks.
 */

import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { logger } from '@core/logger';
import { getAuthenticatedUser } from '@core/auth/helpers';

/**
 * Create a rate limiter with custom key generator based on user ID
 */
const createUserRateLimiter = (options: {
  windowMs: number;
  max: number;
  message: string;
  skipSuccessfulRequests?: boolean;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: options.message,
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
      try {
        const user = getAuthenticatedUser(req);
        return `wallet:${user.id}`;
      } catch {
        // Fall back to IP if user not authenticated
        return req.ip || 'unknown';
      }
    },
    handler: (req: Request, res: Response) => {
      const user = getAuthenticatedUser(req);
      logger.warn('RATE_LIMIT', 'Wallet operation rate limit exceeded', {
        userId: user?.id,
        ip: req.ip,
        path: req.path,
        method: req.method
      });
      
      res.status(429).json({
        error: 'Too many requests',
        message: options.message,
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(options.windowMs / 1000)
      });
    }
  });
};

/**
 * Rate limiter for deposit operations
 * More lenient as deposits are good for the platform
 */
export const depositRateLimit = createUserRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 deposits per minute
  message: 'Too many deposit requests. Please try again in a minute.'
});

/**
 * Rate limiter for withdrawal operations
 * Stricter to prevent rapid fund draining
 */
export const withdrawalRateLimit = createUserRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // 3 withdrawals per 5 minutes
  message: 'Too many withdrawal requests. Please try again in 5 minutes.',
  skipSuccessfulRequests: false // Count all attempts
});

/**
 * Rate limiter for transfer operations
 * Moderate limits to prevent spam while allowing legitimate use
 */
export const transferRateLimit = createUserRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 transfers per minute
  message: 'Too many transfer requests. Please try again in a minute.'
});

/**
 * Rate limiter for balance check operations
 * Very lenient as these are read-only
 */
export const balanceCheckRateLimit = createUserRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 checks per minute
  message: 'Too many balance check requests. Please try again in a minute.',
  skipSuccessfulRequests: true // Only count failed requests
});

/**
 * Global wallet API rate limiter (backup)
 * Applied to all wallet endpoints as a safety net
 */
export const globalWalletRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
  message: 'Too many wallet API requests. Please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    // Skip rate limiting for admin users
    try {
      const user = getAuthenticatedUser(req);
      return user.role === 'admin' || user.role === 'super-admin';
    } catch {
      return false;
    }
  }
});