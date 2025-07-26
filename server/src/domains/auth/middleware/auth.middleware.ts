/**
 * Auth Domain Middleware
 * 
 * This file re-exports from the unified auth middleware for backward compatibility.
 * All auth logic is now consolidated in the main middleware layer.
 */

export {
  requireAuth as isAuthenticated,
  requireAdmin as isAdmin,
  requireModerator as isModerator,
  requireModerator as isAdminOrModerator,
  optionalAuth as isAuthenticatedOptional,
  authenticate as requireAuth
} from '@api/middleware/auth.unified';

// Additional domain-specific auth utilities can be added here if needed

// Dev mode auth handler
export const devModeAuthHandler = async (req: any, res: any) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ error: 'Dev mode only' });
  }
  
  const { role } = req.query;
  if (!role || !['user', 'moderator', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  
  // In dev mode, allow role switching
  if (req.session) {
    req.session.devRole = role;
  }
  
  res.json({ success: true, role });
};