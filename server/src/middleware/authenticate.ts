import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '@db';
import { users } from '@schema';
import { eq } from 'drizzle-orm';
import type { GroupId } from '@/db/types';

// Extend Express Request type to include user
declare global {
	namespace Express {
		interface User {
			id: number;
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
		const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

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
		req.user = {
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

		console.error('Authentication error:', error);
		return res.status(401).json({ error: 'Invalid token' });
	}
};
