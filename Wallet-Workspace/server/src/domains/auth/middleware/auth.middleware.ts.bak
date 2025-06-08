import { Request, Response, NextFunction } from "express";
import { shouldBypassAuth, isDevMode } from "../../../utils/environment";
import { createMockUser } from "../services/auth.service";

/**
 * Determines if a user has a specific role
 */
export function hasRole(req: Request, role: string): boolean {
  if (!req.user) return false;
  return (req.user as any).role === role;
}

/**
 * Authentication middleware that enforces login requirement
 * In development mode, it can be bypassed based on environment settings
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }

  // Check if we should bypass auth in development mode
  if (shouldBypassAuth()) {
    console.log('🛠️ Bypassing authentication in development mode');
    // Get the dev mode role from headers or default to 'user'
    const devRole = req.headers['x-dev-role'] as string || 'user';
    const roleId = req.headers['x-dev-role-id'] ? 
      parseInt(req.headers['x-dev-role-id'] as string, 10) : 
      (devRole === 'admin' ? 1 : (devRole === 'moderator' ? 2 : 3));
    
    // Create a mock user with the specified role
    (req as any).user = createMockUser(roleId, devRole as any);
    return next();
  }

  res.status(401).json({ message: "Unauthorized" });
}

/**
 * Similar to isAuthenticated, but allows non-authenticated requests to pass through
 * In development mode, it will create a mock user if auth bypassing is enabled
 */
export function isAuthenticatedOptional(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }

  // Check if we should bypass auth in development mode
  if (shouldBypassAuth()) {
    console.log('🛠️ Bypassing optional authentication in development mode');
    // Get the dev mode role from headers or default to 'user'
    const devRole = req.headers['x-dev-role'] as string || 'user';
    const roleId = req.headers['x-dev-role-id'] ? 
      parseInt(req.headers['x-dev-role-id'] as string, 10) : 
      (devRole === 'admin' ? 1 : (devRole === 'moderator' ? 2 : 3));
    
    // Create a mock user with the specified role
    (req as any).user = createMockUser(roleId, devRole as any);
  }

  // Allow request to proceed even if not authenticated
  return next();
}

/**
 * Admin role middleware - requires admin privileges
 */
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (hasRole(req, "admin")) {
    return next();
  }

  // Check if we should bypass auth in development mode with admin role
  if (shouldBypassAuth() && req.headers['x-dev-role'] === 'admin') {
    console.log('🛠️ Bypassing admin authentication in development mode');
    const roleId = req.headers['x-dev-role-id'] ? 
      parseInt(req.headers['x-dev-role-id'] as string, 10) : 1;
    
    (req as any).user = createMockUser(roleId, 'admin');
    return next();
  }

  res.status(403).json({ message: "Forbidden" });
}

/**
 * Moderator role middleware - requires moderator or admin privileges
 */
export function isModerator(req: Request, res: Response, next: NextFunction) {
  if (hasRole(req, "moderator") || hasRole(req, "admin")) {
    return next();
  }

  // Check if we should bypass auth in development mode with moderator role
  if (shouldBypassAuth() && 
      (req.headers['x-dev-role'] === 'moderator' || req.headers['x-dev-role'] === 'admin')) {
    console.log('🛠️ Bypassing moderator authentication in development mode');
    const devRole = req.headers['x-dev-role'] as 'moderator' | 'admin';
    const roleId = req.headers['x-dev-role-id'] ? 
      parseInt(req.headers['x-dev-role-id'] as string, 10) : 
      (devRole === 'admin' ? 1 : 2);
    
    (req as any).user = createMockUser(roleId, devRole);
    return next();
  }

  res.status(403).json({ message: "Forbidden" });
}

/**
 * Middleware for routes that should be accessible by either admins or moderators
 */
export function isAdminOrModerator(req: Request, res: Response, next: NextFunction) {
  // For compatibility with existing code, this is a combination function
  return isModerator(req, res, next);
}

/**
 * Middleware for handling developer mode authentication switching
 */
export function devModeAuthHandler(req: Request, res: Response, next: NextFunction) {
  // Only available in development mode
  if (!isDevMode()) {
    return res.status(404).json({ message: "Not found" });
  }

  // Get the requested role from the query parameters
  const role = req.query.role as string || 'user';
  const validRoles = ['user', 'moderator', 'admin'];
  
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  // Set a session cookie with the selected role
  (req.session as any).devRole = role;
  
  res.json({ 
    message: `Development mode authentication set to: ${role}`,
    role: role
  });
} 