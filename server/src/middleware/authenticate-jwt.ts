import type { Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../domains/auth/utils/jwt.utils';
import { userService } from '@core/services/user.service';
import { logger } from '@core/logger';
import type { AuthenticatedRequest } from '../types/auth.types';

/**
 * Hybrid Authentication Middleware
 * 1. First tries JWT token from Authorization header
 * 2. Falls back to session authentication if no token
 * 3. Rejects if neither authentication method succeeds
 */
export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
	const authHeader = req.headers.authorization;
	const token = extractTokenFromHeader(authHeader);

	// If token is provided, validate it
	if (token) {
		const decoded = verifyToken(token);
		if (!decoded) {
			return res.status(401).json({ error: 'Invalid or expired token.' });
		}

		// Fetch user from database using the userId from token
		return userService.findById(decoded.userId)
			.then(user => {
				if (!user) {
					return res.status(401).json({ error: 'User not found.' });
				}

				if (!user.isActive) {
					return res.status(401).json({ error: 'Account is not active.' });
				}

				// Attach user to request
				req.user = {
					id: user.id as UserId,
					username: user.username,
					email: user.email,
					role: user.role,
					xp: user.xp,
					level: user.level,
					isActive: user.isActive,
					createdAt: user.createdAt
				};

				next();
			})
			.catch(error => {
				logger.error('Error in JWT authentication', { error });
				res.status(500).json({ error: 'Internal server error.' });
			});
	}

	// No token provided - fall back to session authentication
	if (req.isAuthenticated && req.isAuthenticated() && req.user) {
		// Session auth is valid, user is already attached by Passport
		// Ensure the user object has the expected shape
		const sessionUser = req.user as any;
		req.user = {
			id: sessionUser.id as UserId,
			username: sessionUser.username,
			email: sessionUser.email,
			role: sessionUser.role,
			xp: sessionUser.xp || 0,
			level: sessionUser.level || 1,
			isActive: sessionUser.isActive ?? true,
			createdAt: sessionUser.createdAt || new Date()
		};
		return next();
	}

	// Neither JWT nor session auth succeeded
	return res.status(401).json({ error: 'Authentication required. Please provide a valid token or login.' });
}

/**
 * Hybrid Authentication Middleware
 * Checks for JWT token first, then falls back to session auth
 * Useful for routes that support both authentication methods
 */
export function authenticateHybrid(req: AuthenticatedRequest, res: Response, next: NextFunction) {
	// First try JWT authentication
	const authHeader = req.headers.authorization;
	const token = extractTokenFromHeader(authHeader);

	if (token) {
		const decoded = verifyToken(token);
		if (decoded) {
			// Valid JWT token found, fetch user
			userService.findById(decoded.userId)
				.then(user => {
					if (user && user.isActive) {
						req.user = {
							id: user.id as UserId,
							username: user.username,
							email: user.email,
							role: user.role,
							xp: user.xp,
							level: user.level,
							isActive: user.isActive,
							createdAt: user.createdAt
						};
					}
					next();
				})
				.catch(() => {
					// Continue even if user fetch fails
					next();
				});
			return;
		}
	}

	// Fall back to session authentication
	if (req.isAuthenticated && req.isAuthenticated()) {
		// Session auth is valid, user is already attached by Passport
		next();
	} else {
		// No valid authentication found
		res.status(401).json({ error: 'Authentication required.' });
	}
}