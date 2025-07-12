import { userService } from '@core/services/user.service';
import type { Request, Response, NextFunction } from 'express';
import { env, isDevelopment, isProduction } from '@core/config/environment';
import { createMockUser } from '../services/auth.service';
import { logger } from '@core/logger';
import { shouldBypassAuth } from '@server-utils/environment';
import { sendSuccessResponse, sendErrorResponse } from "@core/utils/transformer.helpers";

/**
 * Determines if a user has a specific role
 */
export function hasRole(req: Request, role: string): boolean {
	if (!userService.getUserFromRequest(req)) return false;
	return (userService.getUserFromRequest(req) as any).role === role;
}

/**
 * Authentication middleware that enforces login requirement
 * Secure development bypass with strict production protection
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
	if (req.isAuthenticated()) {
		return next();
	}

	// SECURITY: Strict production check - no bypass allowed
	if (isProduction()) {
		return sendErrorResponse(res, 'Unauthorized', 401, { error: 'PRODUCTION_AUTH_REQUIRED' });
	}

	// Development mode bypass with strict validation
	if (isDevelopment() && env.DEV_BYPASS_PASSWORD && !env.DEV_FORCE_AUTH) {
		logger.warn('AuthMiddleware', 'DEVELOPMENT: Bypassing authentication', {
			path: req.path,
			ip: req.ip,
			userAgent: req.get('User-Agent')
		});

		// Validate development role
		const devRole = (req.headers['x-dev-role'] as string) || 'user';
		const validRoles = ['user', 'moderator', 'admin'];

		if (!validRoles.includes(devRole)) {
			return sendErrorResponse(res, 'Invalid development role', 400, { validRoles });
		}

		const roleId = req.headers['x-dev-role-id']
			? parseInt(req.headers['x-dev-role-id'] as string, 10)
			: devRole === 'admin'
				? 1
				: devRole === 'moderator'
					? 2
					: 3;

		// Create mock user with audit trail
		(req as any).user = createMockUser(roleId, devRole as any);

		// Add development flag to request for audit purposes
		(req as any).isDevelopmentBypass = true;

		return next();
	}

	sendErrorResponse(res, 'Unauthorized', 401, {
		hint: isDevelopment() ? 'Set DEV_BYPASS_PASSWORD=true for development bypass' : undefined
	});
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
		logger.info('AuthMiddleware', 'Bypassing optional authentication in development mode', {
			path: req.path
		});
		// Get the dev mode role from headers or default to 'user'
		const devRole = (req.headers['x-dev-role'] as string) || 'user';
		const roleId = req.headers['x-dev-role-id']
			? parseInt(req.headers['x-dev-role-id'] as string, 10)
			: devRole === 'admin'
				? 1
				: devRole === 'moderator'
					? 2
					: 3;

		// Create a mock user with the specified role
		(req as any).user = createMockUser(roleId, devRole as any);
	}

	// Allow request to proceed even if not authenticated
	return next();
}

/**
 * Admin role middleware - requires admin privileges
 * Secure development bypass with strict production protection
 */
export function isAdmin(req: Request, res: Response, next: NextFunction) {
	// Check if user has admin role
	if (hasRole(req, 'admin')) {
		return next();
	}

	// SECURITY: Strict production check - no bypass allowed
	if (isProduction()) {
		logger.warn('AuthMiddleware', 'PRODUCTION: Admin access denied', {
			path: req.path,
			userId: (userService.getUserFromRequest(req) as any)?.id,
			userRole: (userService.getUserFromRequest(req) as any)?.role,
			ip: req.ip
		});
		return sendErrorResponse(res, 'Forbidden - Admin access required', 403, { error: 'PRODUCTION_ADMIN_REQUIRED' });
	}

	// Development mode bypass with strict validation
	if (isDevelopment() && env.DEV_BYPASS_PASSWORD && req.headers['x-dev-role'] === 'admin') {
		logger.warn('AuthMiddleware', 'DEVELOPMENT: Bypassing admin authentication', {
			path: req.path,
			ip: req.ip,
			userAgent: req.get('User-Agent')
		});

		const roleId = req.headers['x-dev-role-id']
			? parseInt(req.headers['x-dev-role-id'] as string, 10)
			: 1;

		(req as any).user = createMockUser(roleId, 'admin');
		(req as any).isDevelopmentBypass = true;

		return next();
	}

	sendErrorResponse(res, 'Forbidden - Admin access required', 403, {
		hint: isDevelopment() ? 'Set x-dev-role header to "admin" for development bypass' : undefined
	});
}

/**
 * Moderator role middleware - requires moderator or admin privileges
 */
export function isModerator(req: Request, res: Response, next: NextFunction) {
	if (hasRole(req, 'moderator') || hasRole(req, 'admin')) {
		return next();
	}

	// Check if we should bypass auth in development mode with moderator role
	if (
		shouldBypassAuth() &&
		(req.headers['x-dev-role'] === 'moderator' || req.headers['x-dev-role'] === 'admin')
	) {
		logger.info('AuthMiddleware', 'Bypassing moderator authentication in development mode', {
			path: req.path,
			devRoleHeader: req.headers['x-dev-role']
		});
		const devRole = req.headers['x-dev-role'] as 'moderator' | 'admin';
		const roleId = req.headers['x-dev-role-id']
			? parseInt(req.headers['x-dev-role-id'] as string, 10)
			: devRole === 'admin'
				? 1
				: 2;

		(req as any).user = createMockUser(roleId, devRole);
		return next();
	}

	sendErrorResponse(res, 'Forbidden', 403);
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
 * SECURITY: Only available in development with bypass enabled
 */
export function devModeAuthHandler(req: Request, res: Response, next: NextFunction) {
	// SECURITY: Strict production check
	if (isProduction()) {
		return sendErrorResponse(res, 'Not found', 404);
	}

	// Only available in development mode with bypass enabled
	if (!isDevelopment() || !env.DEV_BYPASS_PASSWORD) {
		return sendErrorResponse(res, 'Not found', 404);
	}

	// Log security-sensitive operation
	logger.warn('AuthMiddleware', 'DEVELOPMENT: Role switching requested', {
		ip: req.ip,
		userAgent: req.get('User-Agent'),
		requestedRole: req.query.role
	});

	// Get the requested role from the query parameters
	const role = (req.query.role as string) || 'user';
	const validRoles = ['user', 'moderator', 'admin'];

	if (!validRoles.includes(role)) {
		return sendErrorResponse(res, 'Invalid role', 400, { validRoles });
	}

	// Set a session cookie with the selected role
	(req.session as any).devRole = role;

	sendSuccessResponse(res, {
    		message: `Development mode authentication set to: ${role}`,
    		role: role,
    		warning: 'DEVELOPMENT ONLY - This endpoint is disabled in production'
    	});
}
