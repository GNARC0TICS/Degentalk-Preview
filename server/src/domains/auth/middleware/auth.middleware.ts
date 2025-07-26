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