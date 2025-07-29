/**
 * Auth Domain Middleware
 * 
 * This file re-exports from the unified auth middleware for backward compatibility.
 * All auth logic is now consolidated in the main middleware layer.
 */

import { sendSuccess, sendError } from '@utils/api-responses';
import { ApiErrorCode } from '@shared/types/api.types';

export {
  requireAuth as isAuthenticated,
  requireAdmin as isAdmin,
  requireModerator as isModerator,
  requireModerator as isAdminOrModerator,
  optionalAuth as isAuthenticatedOptional,
  authenticate as requireAuth
} from '@middleware/auth.unified';

// Additional domain-specific auth utilities can be added here if needed

// Dev mode auth handler
export const devModeAuthHandler = async (req: any, res: any) => {
  if (process.env.NODE_ENV !== 'development') {
    return sendError(res, ApiErrorCode.FORBIDDEN, 'Dev mode only', 403);
  }
  
  const { role } = req.query;
  if (!role || !['user', 'moderator', 'admin'].includes(role)) {
    return sendError(res, ApiErrorCode.VALIDATION_ERROR, 'Invalid role', 400);
  }
  
  // In dev mode, allow role switching
  if (req.session) {
    req.session.devRole = role;
  }
  
  sendSuccess(res, { role }, `Switched to ${role} role`);
};