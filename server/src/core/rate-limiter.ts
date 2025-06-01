import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { rateLimits } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { logger, LogLevel, LogAction } from './logger';

/**
 * Rate limiter middleware
 * This is a simple rate limiter that uses the database to track request counts
 */
export function rateLimiter(options: { 
  endpoint: string;
  limit?: number;
  windowMs?: number;
}) {
  const { 
    endpoint, 
    limit = 100, // Default: 100 requests per window
    windowMs = 60 * 1000 // Default: 1 minute
  } = options;
  
  return async function(req: Request, res: Response, next: NextFunction) {
    try {
      // Get client IP or user ID
      const key = req.ip || req.user?.id?.toString() || 'anonymous';
      
      // Get current time
      const now = new Date();
      const resetTime = new Date(now.getTime() + windowMs);
      
      // Try to find existing rate limit record
      const existingLimits = await db
        .select()
        .from(rateLimits)
        .where(
          and(
            eq(rateLimits.key, key),
            eq(rateLimits.endpoint, endpoint)
          )
        );
      
      if (existingLimits.length > 0) {
        const limitRecord = existingLimits[0];
        
        // Check if the current period has expired
        if (new Date(limitRecord.resetAt) <= now) {
          // Reset period has expired, reset counter
          await db
            .update(rateLimits)
            .set({
              count: 1,
              resetAt: resetTime,
              updatedAt: now
            })
            .where(eq(rateLimits.id, limitRecord.id));
          
          next();
        } else {
          // Still within rate limit period
          if (limitRecord.count >= limit) {
            // Rate limit exceeded
            return res.status(429).json({
              message: 'Too many requests, please try again later.',
              retryAfter: Math.ceil((new Date(limitRecord.resetAt).getTime() - now.getTime()) / 1000)
            });
          } else {
            // Increment counter
            await db
              .update(rateLimits)
              .set({
                count: sql`${rateLimits.count} + 1`,
                updatedAt: now
              })
              .where(eq(rateLimits.id, limitRecord.id));
            
            next();
          }
        }
      } else {
        // No existing record, create a new one
        await db
          .insert(rateLimits)
          .values({
            key,
            endpoint,
            count: 1,
            resetAt: resetTime,
            createdAt: now,
            updatedAt: now
          });
        
        next();
      }
    } catch (error) {
      // In case of error, allow the request to proceed
      logger.error("RATE_LIMITER", 'Error in rate limiter', error);
      next();
    }
  };
}

/**
 * Create a rate limiter middleware for a specific endpoint
 */
export function createRateLimiter(endpoint: string, limit: number = 100, windowMs: number = 60 * 1000) {
  return rateLimiter({ endpoint, limit, windowMs });
} 