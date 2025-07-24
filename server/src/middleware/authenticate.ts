import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '@core/database';
import { users } from '@schema';
import { eq } from 'drizzle-orm';
import type { GroupId, UserId } from '@shared/types/ids';
import { getUser } from '@core/utils/auth.helpers';
import { logger } from '@core/logger';

/* eslint-disable @typescript-eslint/no-namespace */

// Extend Express Request type to include user
declare global {
	namespace Express {
		interface User {
			id: UserId;
			role: string;
			username: string;
			email: string;
			groupId?: GroupId | undefined;
		}
	}
}

/**
 * Authentication middleware
 * Validates JWT token and attaches user to request
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
	try {
		// Get token from header
		const authHeader = req.headers.authorization;
		const token = authHeader && authHeader.split(' ')[1];

		if (!token) {
			return res.status(401).json({ error: 'Access denied. No token provided.' });
		}

		// Verify token
		const jwtSecret = process.env.JWT_SECRET;
		if (!jwtSecret) {
			logger.error('JWT_SECRET not configured');
			return res.status(500).json({ error: 'Authentication configuration error' });
		}
		
		const decoded = jwt.verify(token, jwtSecret) as any;

		// Get user from database
		const user = await db.query.users.findFirst({
			where: eq(users.id, decoded.userId),
			columns: {
				id: true,
				username: true,
				email: true,
				role: true,
				isActive: true,
				isBanned: true
			}
		});

		if (!user) {
			return res.status(401).json({ error: 'User not found' });
		}

		if (!user.isActive || user.isBanned) {
			return res.status(403).json({ error: 'Account is inactive or banned' });
		}

		// Attach user to request
		(req as any).user = {
			id: user.id,
			username: user.username,
			email: user.email,
			role: user.role as string
		};

		next();
	} catch (error) {
		if ((error as any).name === 'TokenExpiredError') {
			return res.status(401).json({ error: 'Token expired' });
		}

		logger.error('Authentication error:', error);
		return res.status(401).json({ error: 'Invalid token' });
	}
};
