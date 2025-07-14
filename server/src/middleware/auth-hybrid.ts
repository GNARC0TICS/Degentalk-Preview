import type { Request, Response, NextFunction } from 'express';
import { authenticateJWT } from './authenticate-jwt';
import { isAdmin as isAdminSession } from '../domains/auth/middleware/auth.middleware';

/**
 * Hybrid admin middleware
 * Checks JWT auth first, then session auth for admin access
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
	// First try JWT authentication
	authenticateJWT(req, res, (err) => {
		if (!err && req.user && req.user.role === 'admin') {
			// JWT auth successful and user is admin
			return next();
		}

		// Fall back to session auth for admin check
		isAdminSession(req, res, next);
	});
}