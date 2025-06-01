import { authenticate } from './authenticate';

// Re-export authenticate as the default authentication middleware
export { authenticate };

// Also export as named export for explicit imports
export const requireAuth = authenticate;

/**
 * Middleware to require admin role
 */
export const requireAdmin = (req: any, res: any, next: any) => {
  // First authenticate the user
  authenticate(req, res, (err: any) => {
    if (err) return next(err);
    
    // Check if user is an admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    next();
  });
};

/**
 * Check if a user has admin privileges
 */
export const isAdmin = (req: any) => {
  return req.user?.role === 'admin';
};

/**
 * Middleware to require moderator role
 */
export const requireModerator = (req: any, res: any, next: any) => {
  // First authenticate the user
  authenticate(req, res, (err: any) => {
    if (err) return next(err);
    
    // Check if user is a moderator or admin
    if (req.user?.role !== 'moderator' && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Moderator access required' });
    }
    
    next();
  });
}; 