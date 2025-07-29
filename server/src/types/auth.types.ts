import type { UserId, GroupId } from '@shared/types/ids';

/**
 * Unified user type for both JWT and session authentication
 * This interface represents the user object attached to Express requests
 */
export interface User {
	id: UserId;
	username: string;
	email: string;
	role: string;
	xp: number;
	level: number;
	isActive: boolean;
	createdAt: Date;
	// Optional fields that may come from session
	groupId?: GroupId;
	isBanned?: boolean;
	isVerified?: boolean;
}

/**
 * Express Request extension for authenticated requests
 */
export interface AuthenticatedRequest extends Express.Request {
	user?: User;
}

/**
 * JWT Token payload
 */
export interface JWTPayload {
	userId: UserId;
	iat?: number;
	exp?: number;
}

// Extend Express types globally
// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Express {
		// Use the User type from this file, not extending itself
		interface User {
			id: UserId;
			username: string;
			email: string;
			role: string;
			xp: number;
			level: number;
			isActive: boolean;
			createdAt: Date;
			// Optional fields that may come from session
			groupId?: GroupId;
			isBanned?: boolean;
			isVerified?: boolean;
		}
		
		interface Request {
			user?: User;
		}
	}
}