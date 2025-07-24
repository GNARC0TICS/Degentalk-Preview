/**
 * Session Tracking Middleware
 * 
 * Automatically tracks user sessions and page views
 * for analytics and retention analysis
 */

import { Request, Response, NextFunction } from 'express';
import { nanoid } from 'nanoid';
import { logger } from '@core/logger';
import { sessionTrackingService } from '../services/session-tracking.service';
import { getUser } from '@utils/request-user';

declare module 'express-session' {
  interface SessionData {
    trackingId?: string;
    startTime?: number;
  }
}

export interface TrackingRequest extends Request {
  trackingId?: string;
}

/**
 * Session tracking middleware
 * Automatically tracks sessions and page views
 */
export const sessionTrackingMiddleware = async (
  req: TrackingRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Generate or get tracking ID
    let trackingId = req.session?.trackingId;
    
    if (!trackingId) {
      trackingId = nanoid(21);
      if (req.session) {
        req.session.trackingId = trackingId;
        req.session.startTime = Date.now();
      }
    }
    
    req.trackingId = trackingId;
    
    // Get user info if authenticated
    const user = getUser(req);
    
    // Extract session data
    const sessionData = {
      userId: user?.id,
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      currentPage: req.path,
      referrer: req.headers.referer,
      country: req.headers['cf-ipcountry'] as string, // Cloudflare header
      city: req.headers['cf-ipcity'] as string // Cloudflare header
    };
    
    // Start/update session
    await sessionTrackingService.startSession(trackingId, sessionData);
    
    // Track page view for GET requests
    if (req.method === 'GET') {
      await sessionTrackingService.trackPageView(trackingId, req.path, user?.id);
    }
    
    // Add session end handler on response finish
    res.on('finish', async () => {
      // Don't end session on every request, just update activity
      // Sessions will be ended by timeout or explicit logout
    });
    
  } catch (error) {
    logger.error('SessionTracking', 'Error in session tracking middleware', { error });
    // Don't block the request if tracking fails
  }
  
  next();
};

/**
 * Session metrics endpoint middleware
 * Provides session statistics for admin/analytics
 */
export const sessionMetricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Add session stats to response locals for admin pages
  res.locals.sessionStats = sessionTrackingService.getSessionStats();
  next();
};

/**
 * Explicit session end middleware
 * Call this on logout or when user explicitly ends session
 */
export const endSessionMiddleware = async (
  req: TrackingRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.trackingId) {
      await sessionTrackingService.endSession(req.trackingId);
    }
    
    // Clear session tracking data
    if (req.session) {
      delete req.session.trackingId;
      delete req.session.startTime;
    }
  } catch (error) {
    logger.error('SessionTracking', 'Error ending session', { error });
  }
  
  next();
};