import { userService } from '@server/src/core/services/user.service';
/**
 * Admin Middleware
 *
 * Centralized middleware functions for admin routes
 */

import type { Request, Response, NextFunction } from 'express';
import { users } from '@schema';
import { eq } from 'drizzle-orm';
import { WalletError, ErrorCodes as WalletErrorCodes } from '../../core/errors';
import { db } from '@server/src/core/db';
import { logger } from '@server/src/core/logger'; // Added logger import

/**
 * Extract userId from request consistently
 * This standardizes user ID access across the platform
 */
export function getUserId(req: Request): number {
	// Handle both auth patterns (id and user_id)
	return (userService.getUserFromRequest(req) as any)?.id || 0;
}

/**
 * Middleware to ensure user is an admin
 * In development mode, it auto-authenticates as DevUser
 */
export async function isAdmin(req: Request, res: Response, next: NextFunction) {
	// Skip auth check in development mode and auto-login as DevUser
	if (process.env.ALLOW_DEV_ADMIN === 'true' && !req.isAuthenticated()) {
		try {
			// Use Drizzle ORM for secure, parameterized queries
			const [devUser] = await db.select().from(users).where(eq(users.username, 'DevUser')).limit(1);

			if (devUser) {
				// For admin routes, ensure the DevUser has admin privileges
				if (devUser.role !== 'admin') {
					logger.warn(
						'AdminMiddleware',
						'DevUser exists but does not have admin role. Updating to admin role.',
						{ userId: devUser.id }
					);
					await db.update(users).set({ role: 'admin' }).where(eq(users.username, 'DevUser'));
					devUser.role = 'admin';
				}

				// Mock an authenticated session with the DevUser
				req.login(devUser, (err) => {
					if (err) {
						logger.error(
							'AdminMiddleware',
							'Error auto-authenticating as DevUser for admin route',
							{ err, userId: devUser.id || devUser.user_id }
						);
						return res.status(401).json({ message: 'Unauthorized' });
					}

					logger.info(
						'AdminMiddleware',
						`Auto-authenticated as DevUser admin (ID: ${devUser.id})`,
						{ userId: devUser.id }
					);
					return next();
				});
			} else {
				logger.warn('AdminMiddleware', 'DevUser not found in database, admin auth failed');
				return res.status(401).json({ message: 'Unauthorized' });
			}
		} catch (error) {
			logger.error('AdminMiddleware', 'Error in dev mode admin authentication', { err: error });
			return res.status(401).json({ message: 'Unauthorized' });
		}
	} else if (req.isAuthenticated()) {
		// Normal authentication - use RBAC util
		const user = userService.getUserFromRequest(req) as any;
		const { canUser } = await import('@lib/auth/canUser.ts');
		if (user && (await canUser(user, 'canViewAdminPanel'))) {
			return next();
		}
		return res.status(403).json({ message: 'Forbidden - Admin access required' });
	} else {
		// Not authenticated and not in dev mode
		return res.status(401).json({ message: 'Unauthorized' });
	}
}

/**
 * Check if user is authenticated and has moderator or admin rights
 */
export async function isAdminOrModerator(req: Request, res: Response, next: NextFunction) {
	// Skip auth check in development mode and auto-login as DevUser
	if (process.env.ALLOW_DEV_ADMIN === 'true' && !req.isAuthenticated()) {
		try {
			// Use Drizzle ORM for secure, parameterized queries
			const [devUser] = await db.select().from(users).where(eq(users.username, 'DevUser')).limit(1);

			if (devUser) {
				// For admin routes, ensure the DevUser has admin or mod privileges
				if (devUser.role !== 'admin' && devUser.role !== 'mod') {
					logger.warn(
						'AdminMiddleware',
						'DevUser exists but does not have admin/mod role. Updating to admin role.',
						{ userId: devUser.id }
					);
					await db.update(users).set({ role: 'admin' }).where(eq(users.username, 'DevUser'));
					devUser.role = 'admin';
				}

				// Mock an authenticated session with the DevUser
				req.login(devUser, (err) => {
					if (err) {
						logger.error(
							'AdminMiddleware',
							'Error auto-authenticating as DevUser for admin/mod route',
							{ err, userId: devUser.id || devUser.user_id }
						);
						return res.status(401).json({ message: 'Unauthorized' });
					}

					logger.info(
						'AdminMiddleware',
						`Auto-authenticated as DevUser admin/mod (ID: ${devUser.id})`,
						{ userId: devUser.id }
					);
					return next();
				});
			} else {
				logger.warn('AdminMiddleware', 'DevUser not found in database, admin/mod auth failed');
				return res.status(401).json({ message: 'Unauthorized' });
			}
		} catch (error) {
			logger.error('AdminMiddleware', 'Error in dev mode admin/mod authentication', { err: error });
			return res.status(401).json({ message: 'Unauthorized' });
		}
	} else if (req.isAuthenticated()) {
		const user = userService.getUserFromRequest(req) as any;
		const { canUser } = await import('@lib/auth/canUser.ts');
		if (user && (await canUser(user, 'canManageUsers'))) {
			return next();
		}
		return res.status(403).json({ message: 'Forbidden - Admin or moderator access required' });
	} else {
		// Not authenticated and not in dev mode
		return res.status(401).json({ message: 'Unauthorized' });
	}
}

/**
 * Async handler for error handling in admin routes
 * Wraps async route handlers to properly catch errors
 */
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
	Promise.resolve(fn(req, res, next)).catch((error) => {
		logger.error('AdminMiddleware', 'Admin route error in asyncHandler', {
			err: error,
			path: req.path,
			method: req.method
		});

		if (error instanceof WalletError) {
			return res.status(error.httpStatus).json({
				error: error.message,
				code: error.code
			});
		}

		return res.status(500).json({
			error: 'An unexpected error occurred',
			message: error.message || 'Internal server error'
		});
	});
};
