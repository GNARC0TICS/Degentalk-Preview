import type { Request } from 'express';
import { verifyToken, extractTokenFromHeader } from '../domains/auth/utils/jwt.utils';
import { userService } from '@core/services/user.service';
import type { AuthenticatedUser } from '../types/auth.types';
import { logger } from '@core/logger';

/**
 * Get authenticated user from request
 * Checks both JWT token and session authentication
 * Useful for SSR pages that need user data
 * 
 * @param req Express request object
 * @returns User object or null if not authenticated
 */
export async function getUserFromRequest(req: Request): Promise<AuthenticatedUser | null> {
	try {
		// First check if user is already attached (by middleware)
		if (req.user) {
			return req.user as AuthenticatedUser;
		}

		// Try JWT token
		const authHeader = req.headers.authorization;
		const token = extractTokenFromHeader(authHeader);
		
		if (token) {
			const decoded = verifyToken(token);
			if (decoded) {
				const user = await userService.findById(decoded.userId);
				if (user && user.isActive) {
					return {
						id: user.id,
						username: user.username,
						email: user.email,
						role: user.role,
						xp: user.xp,
						level: user.level,
						isActive: user.isActive,
						createdAt: user.createdAt,
						isBanned: user.isBanned,
						isVerified: user.isVerified
					};
				}
			}
		}

		// Try session authentication
		if (req.isAuthenticated && req.isAuthenticated()) {
			const sessionUser = req.user as any;
			if (sessionUser) {
				return {
					id: sessionUser.id,
					username: sessionUser.username,
					email: sessionUser.email,
					role: sessionUser.role,
					xp: sessionUser.xp || 0,
					level: sessionUser.level || 1,
					isActive: sessionUser.isActive ?? true,
					createdAt: sessionUser.createdAt || new Date(),
					isBanned: sessionUser.isBanned || false,
					isVerified: sessionUser.isVerified || false
				};
			}
		}

		return null;
	} catch (error) {
		logger.debug('Error getting user from request', { error });
		return null;
	}
}

/**
 * Check if request is authenticated (either JWT or session)
 */
export function isAuthenticated(req: Request): boolean {
	// Check JWT
	const authHeader = req.headers.authorization;
	const token = extractTokenFromHeader(authHeader);
	if (token && verifyToken(token)) {
		return true;
	}

	// Check session
	return req.isAuthenticated?.() || false;
}

/**
 * Get user ID from request (sync)
 * Useful when you just need the ID quickly
 */
export function getUserIdFromRequest(req: Request): string | null {
	// From attached user
	if (req.user?.id) {
		return req.user.id;
	}

	// From JWT
	const authHeader = req.headers.authorization;
	const token = extractTokenFromHeader(authHeader);
	if (token) {
		const decoded = verifyToken(token);
		if (decoded?.userId) {
			return decoded.userId;
		}
	}

	// From session
	if (req.isAuthenticated?.() && (req.user as any)?.id) {
		return (req.user as any).id;
	}

	return null;
}