/**
 * Admin Middleware
 * 
 * Centralized middleware functions for admin routes
 */

import { Request, Response, NextFunction } from 'express';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { WalletError, ErrorCodes as WalletErrorCodes } from '../../core/errors';
import { pool } from '../../core/db';

/**
 * Extract userId from request consistently
 * This standardizes user ID access across the platform
 */
export function getUserId(req: Request): number {
  // Handle both auth patterns (id and user_id)
  return (req.user as any)?.id || 0;
}

/**
 * Middleware to ensure user is an admin
 * In development mode, it auto-authenticates as DevUser
 */
export async function isAdmin(req: Request, res: Response, next: NextFunction) {
  // Skip auth check in development mode and auto-login as DevUser
  if (process.env.NODE_ENV === "development" && !req.isAuthenticated()) {
    try {
      // Use direct SQL to avoid schema discrepancies
      const devUserResult = await pool.query(`
        SELECT * FROM users WHERE username = 'DevUser' LIMIT 1
      `);
      
      if (devUserResult.rows.length > 0) {
        const devUser = devUserResult.rows[0];
        
        // For admin routes, ensure the DevUser has admin privileges
        if (devUser.role !== 'admin') {
          console.warn('⚠️ [DEV MODE] DevUser exists but does not have admin role. Updating to admin role...');
          await pool.query(`
            UPDATE users SET role = 'admin' WHERE username = 'DevUser'
          `);
          devUser.role = 'admin';
        }
        
        // Mock an authenticated session with the DevUser
        req.login(devUser, (err) => {
          if (err) {
            console.error("Error auto-authenticating as DevUser for admin route:", err);
            return res.status(401).json({ message: "Unauthorized" });
          }
          
          console.log(`🔑 [DEV MODE] Auto-authenticated as DevUser admin (ID: ${devUser.user_id || devUser.id})`);
          return next();
        });
      } else {
        console.warn("⚠️ [DEV MODE] DevUser not found in database, admin auth failed");
        return res.status(401).json({ message: "Unauthorized" });
      }
    } catch (error) {
      console.error("Error in dev mode admin authentication:", error);
      return res.status(401).json({ message: "Unauthorized" });
    }
  } else if (req.isAuthenticated()) {
    // Normal authentication check - user is already logged in
    const user = req.user as any;
    
    if (user && user.role === 'admin') {
      return next();
    } else {
      return res.status(403).json({ message: "Forbidden - Admin access required" });
    }
  } else {
    // Not authenticated and not in dev mode
    return res.status(401).json({ message: "Unauthorized" });
  }
}

/**
 * Check if user is authenticated and has moderator or admin rights
 */
export async function isAdminOrModerator(req: Request, res: Response, next: NextFunction) {
  // Skip auth check in development mode and auto-login as DevUser
  if (process.env.NODE_ENV === "development" && !req.isAuthenticated()) {
    try {
      // Use direct SQL to avoid schema discrepancies
      const devUserResult = await pool.query(`
        SELECT * FROM users WHERE username = 'DevUser' LIMIT 1
      `);
      
      if (devUserResult.rows.length > 0) {
        const devUser = devUserResult.rows[0];
        
        // For admin routes, ensure the DevUser has admin or mod privileges
        if (devUser.role !== 'admin' && devUser.role !== 'mod') {
          console.warn('⚠️ [DEV MODE] DevUser exists but does not have admin/mod role. Updating to admin role...');
          await pool.query(`
            UPDATE users SET role = 'admin' WHERE username = 'DevUser'
          `);
          devUser.role = 'admin';
        }
        
        // Mock an authenticated session with the DevUser
        req.login(devUser, (err) => {
          if (err) {
            console.error("Error auto-authenticating as DevUser for admin/mod route:", err);
            return res.status(401).json({ message: "Unauthorized" });
          }
          
          console.log(`🔑 [DEV MODE] Auto-authenticated as DevUser admin/mod (ID: ${devUser.user_id || devUser.id})`);
          return next();
        });
      } else {
        console.warn("⚠️ [DEV MODE] DevUser not found in database, admin/mod auth failed");
        return res.status(401).json({ message: "Unauthorized" });
      }
    } catch (error) {
      console.error("Error in dev mode admin/mod authentication:", error);
      return res.status(401).json({ message: "Unauthorized" });
    }
  } else if (req.isAuthenticated()) {
    // Normal authentication check - user is already logged in
    const user = req.user as any;
    
    if (user && (user.role === 'admin' || user.role === 'mod')) {
      return next();
    } else {
      return res.status(403).json({ message: "Forbidden - Admin or moderator access required" });
    }
  } else {
    // Not authenticated and not in dev mode
    return res.status(401).json({ message: "Unauthorized" });
  }
}

/**
 * Async handler for error handling in admin routes
 * Wraps async route handlers to properly catch errors
 */
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    console.error('Admin route error:', error);
    
    if (error instanceof WalletError) {
      return res.status(error.httpStatus).json({
        error: error.message,
        code: error.code
      });
    }
    
    return res.status(500).json({
      error: 'An unexpected error occurred',
      message: error.message || 'Internal server error'
    });
  });
};
