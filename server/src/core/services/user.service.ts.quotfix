/**
 * Centralized User Service
 *
 * Consolidates scattered getUser patterns across the codebase
 * Provides consistent user fetching, validation, and management
 */

import { db } from '@db';
import { users } from '@schema';
import { eq, and } from 'drizzle-orm';
import { logger } from '../logger';
import type { UserId } from '@shared/types/ids';
import { getAuthenticatedUser } from "@core/utils/auth.helpers";

export interface User {
	id: UserId;
	username: string;
	email: string;
	role: 'user' | 'moderator' | 'admin';
	level?: number;
	dgtBalance?: number;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface UserProfile extends User {
	displayName?: string;
	bio?: string;
	avatarUrl?: string;
	totalPosts: number;
	totalThreads: number;
	reputation: number;
	lastActiveAt?: Date;
}

export interface AuthenticatedUser extends User {
	sessionId?: string;
	permissions?: string[];
	lastLoginAt?: Date;
}

class UserService {
	/**
	 * Get user from Express request object with type safety
	 */
	getUserFromRequest(req: any): AuthenticatedUser | null {
		const user = getAuthenticatedUser(req);
		if (!user || !user.id) {
			return null;
		}

		return {
			id: user.id,
			username: user.username,
			email: user.email,
			role: user.role || 'user',
			level: user.level,
			dgtBalance: user.dgtBalance,
			isActive: user.isActive !== false,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
			sessionId: req.sessionID,
			permissions: user.permissions,
			lastLoginAt: user.lastLoginAt
		};
	}

	/**
	 * Get user by ID with complete profile data
	 */
	async getUserById(userId: UserId): Promise<UserProfile | null> {
		try {
			const [user] = await db
				.select({
					id: users.id,
					username: users.username,
					email: users.email,
					role: users.role,
					level: users.level,
					dgtBalance: users.dgtBalance,
					isActive: users.isActive,
					createdAt: users.createdAt,
					updatedAt: users.updatedAt,
					displayName: users.displayName,
					bio: users.bio,
					avatarUrl: users.avatarUrl,
					totalPosts: users.totalPosts,
					totalThreads: users.totalThreads,
					reputation: users.reputation,
					lastActiveAt: users.lastActiveAt
				})
				.from(users)
				.where(eq(users.id, userId))
				.limit(1);

			return user || null;
		} catch (error) {
			logger.error('UserService', 'Error fetching user by ID', { userId, error });
			return null;
		}
	}

	/**
	 * Get user by username
	 */
	async getUserByUsername(username: string): Promise<User | null> {
		try {
			const [user] = await db
				.select({
					id: users.id,
					username: users.username,
					email: users.email,
					role: users.role,
					level: users.level,
					dgtBalance: users.dgtBalance,
					isActive: users.isActive,
					createdAt: users.createdAt,
					updatedAt: users.updatedAt
				})
				.from(users)
				.where(eq(users.username, username))
				.limit(1);

			return user || null;
		} catch (error) {
			logger.error('UserService', 'Error fetching user by username', { username, error });
			return null;
		}
	}

	/**
	 * Get user by email
	 */
	async getUserByEmail(email: string): Promise<User | null> {
		try {
			const [user] = await db
				.select({
					id: users.id,
					username: users.username,
					email: users.email,
					role: users.role,
					level: users.level,
					dgtBalance: users.dgtBalance,
					isActive: users.isActive,
					createdAt: users.createdAt,
					updatedAt: users.updatedAt
				})
				.from(users)
				.where(eq(users.email, email))
				.limit(1);

			return user || null;
		} catch (error) {
			logger.error('UserService', 'Error fetching user by email', { email, error });
			return null;
		}
	}

	/**
	 * Get multiple users by IDs
	 */
	async getUsersByIds(userIds: UserId[]): Promise<User[]> {
		if (userIds.length === 0) return [];

		try {
			const userList = await db
				.select({
					id: users.id,
					username: users.username,
					email: users.email,
					role: users.role,
					level: users.level,
					dgtBalance: users.dgtBalance,
					isActive: users.isActive,
					createdAt: users.createdAt,
					updatedAt: users.updatedAt
				})
				.from(users)
				.where(eq(users.id, userIds[0])); // TODO: Use proper IN clause when Drizzle supports it

			return userList;
		} catch (error) {
			logger.error('UserService', 'Error fetching users by IDs', { userIds, error });
			return [];
		}
	}

	/**
	 * Check if user exists and is active
	 */
	async isActiveUser(userId: UserId): Promise<boolean> {
		try {
			const [user] = await db
				.select({ isActive: users.isActive })
				.from(users)
				.where(and(eq(users.id, userId), eq(users.isActive, true)))
				.limit(1);

			return !!user;
		} catch (error) {
			logger.error('UserService', 'Error checking user active status', { userId, error });
			return false;
		}
	}

	/**
	 * Update user's last active timestamp
	 */
	async updateLastActive(userId: UserId): Promise<void> {
		try {
			await db.update(users).set({ lastActiveAt: new Date() }).where(eq(users.id, userId));
		} catch (error) {
			logger.error('UserService', 'Error updating last active', { userId, error });
		}
	}

	/**
	 * Check if user has specific role
	 */
	hasRole(user: User | AuthenticatedUser, role: 'admin' | 'moderator' | 'user'): boolean {
		if (role === 'admin') {
			return user.role === 'admin';
		}
		if (role === 'moderator') {
			return user.role === 'moderator' || user.role === 'admin';
		}
		return true; // All authenticated users have 'user' role
	}

	/**
	 * Check if user is admin
	 */
	isAdmin(user: User | AuthenticatedUser): boolean {
		return user.role === 'admin';
	}

	/**
	 * Check if user is moderator or admin
	 */
	isModerator(user: User | AuthenticatedUser): boolean {
		return user.role === 'moderator' || user.role === 'admin';
	}

	/**
	 * Validate user session and return user data
	 */
	async validateUserSession(req: any): Promise<AuthenticatedUser | null> {
		const user = this.getUserFromRequest(req);
		if (!user) return null;

		// Check if user is still active
		const isActive = await this.isActiveUser(user.id);
		if (!isActive) {
			logger.warn('UserService', 'Inactive user attempted access', { userId: user.id });
			return null;
		}

		// Update last active
		await this.updateLastActive(user.id);

		return user;
	}

	/**
	 * Get user display name (fallback to username)
	 */
	getDisplayName(user: Partial<UserProfile>): string {
		return user.displayName || user.username || `User ${user.id}`;
	}

	/**
	 * Format user for API response (remove sensitive data)
	 */
	formatForAPI(user: User | UserProfile): Omit<User | UserProfile, 'email'> {
		const { email, ...safeUser } = user;
		return safeUser;
	}

	/**
	 * Batch user operations for efficiency
	 */
	async batchGetUsers(userIds: UserId[]): Promise<Map<UserId, User>> {
		const users = await this.getUsersByIds(userIds);
		const userMap = new Map<UserId, User>();

		users.forEach((user) => {
			userMap.set(user.id, user);
		});

		return userMap;
	}
}

// Global service instance
export const userService = new UserService();

/**
 * Express middleware to inject user service
 */
export function injectUserService(req: any, res: any, next: any) {
	req.userService = userService;
	next();
}

/**
 * Helper function for backward compatibility
 */
export function getUserFromRequest(req: any): AuthenticatedUser | null {
	return userService.getUserFromRequest(req);
}
