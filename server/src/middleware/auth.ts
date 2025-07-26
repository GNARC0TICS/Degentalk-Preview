/**
 * Auth Middleware Exports
 * 
 * This file re-exports from the unified auth middleware for backward compatibility.
 * All auth logic is now consolidated in auth.unified.ts
 */

export {
  authenticate,
  requireAuth,
  requireAdmin,
  requireModerator,
  optionalAuth,
  requireJWT,
  requireSession,
  // Aliases for backward compatibility
  isAuthenticated,
  isAdmin,
  isModerator,
  isAdminOrModerator,
  isAuthenticatedOptional
} from './auth.unified';