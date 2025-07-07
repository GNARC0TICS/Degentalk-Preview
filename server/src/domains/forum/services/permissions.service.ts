import { userService } from '@server/src/core/services/user.service';
/**
 * Forum Permissions Service
 *
 * Centralized permission checking for forum operations
 * Handles user roles, ownership, and moderation privileges
 */

import { db } from '@db';
import { posts, threads, forumStructure } from '@schema';
import { eq } from 'drizzle-orm';
import { logger } from '@server/src/core/logger';
import type { EntityId, ForumId, UserId, PostId, ThreadId } from '@shared/types/ids';

export interface User {
	id: UserId;
	role: 'user' | 'moderator' | 'admin';
	username?: string;
}

export interface PermissionContext {
	userId: UserId;
	userRole: string;
	entityId?: EntityId;
	entityType?: 'post' | 'thread' | 'forum';
	action: 'create' | 'read' | 'update' | 'delete' | 'moderate';
}

/**
 * Check if user has admin privileges
 */
export function isAdmin(user: User): boolean {
	return user.role === 'admin';
}

/**
 * Check if user has moderator or admin privileges
 */
export function isModerator(user: User): boolean {
	return user.role === 'moderator' || user.role === 'admin';
}

/**
 * Check if user owns a specific post
 */
export async function isPostOwner(userId: UserId, postId: PostId): Promise<boolean> {
	try {
		const [post] = await db
			.select({ userId: posts.userId })
			.from(posts)
			.where(eq(posts.id, postId))
			.limit(1);

		return post?.userId === userId;
	} catch (error) {
		logger.error('PermissionsService', 'Error checking post ownership', { userId, postId, error });
		return false;
	}
}

/**
 * Check if user owns a specific thread
 */
export async function isThreadOwner(userId: UserId, threadId: ThreadId): Promise<boolean> {
	try {
		const [thread] = await db
			.select({ userId: threads.userId })
			.from(threads)
			.where(eq(threads.id, threadId))
			.limit(1);

		return thread?.userId === userId;
	} catch (error) {
		logger.error('PermissionsService', 'Error checking thread ownership', {
			userId,
			threadId,
			error
		});
		return false;
	}
}

/**
 * Check if user can edit a post
 * Rules: Post owner, moderators, or admins can edit
 */
export async function canEditPost(user: User, postId: PostId): Promise<boolean> {
	// Admins and moderators can edit any post
	if (isModerator(user)) {
		return true;
	}

	// Users can edit their own posts
	return await isPostOwner(user.id, postId);
}

/**
 * Check if user can delete a post
 * Rules: Post owner, moderators, or admins can delete
 */
export async function canDeletePost(user: User, postId: PostId): Promise<boolean> {
	// Admins and moderators can delete any post
	if (isModerator(user)) {
		return true;
	}

	// Users can delete their own posts
	return await isPostOwner(user.id, postId);
}

/**
 * Check if user can edit a thread
 * Rules: Thread owner, moderators, or admins can edit
 */
export async function canEditThread(user: User, threadId: ThreadId): Promise<boolean> {
	// Admins and moderators can edit any thread
	if (isModerator(user)) {
		return true;
	}

	// Users can edit their own threads
	return await isThreadOwner(user.id, threadId);
}

/**
 * Check if user can delete a thread
 * Rules: Thread owner, moderators, or admins can delete
 */
export async function canDeleteThread(user: User, threadId: ThreadId): Promise<boolean> {
	// Admins and moderators can delete any thread
	if (isModerator(user)) {
		return true;
	}

	// Users can delete their own threads
	return await isThreadOwner(user.id, threadId);
}

/**
 * Check if user can solve/unsolved a thread
 * Rules: Thread owner, moderators, or admins can solve
 */
export async function canSolveThread(user: User, threadId: ThreadId): Promise<boolean> {
	// Admins and moderators can solve any thread
	if (isModerator(user)) {
		return true;
	}

	// Thread owners can solve their own threads
	return await isThreadOwner(user.id, threadId);
}

/**
 * Check if user can manage thread tags
 * Rules: Thread owner, moderators, or admins can manage tags
 */
export async function canManageThreadTags(user: User, threadId: ThreadId): Promise<boolean> {
	// Admins and moderators can manage tags on any thread
	if (isModerator(user)) {
		return true;
	}

	// Thread owners can manage tags on their own threads
	return await isThreadOwner(user.id, threadId);
}

/**
 * Check if user can post in a forum
 * Rules: Check forum access level and user permissions
 */
export async function canPostInForum(user: User, forumId: ForumId): Promise<boolean> {
	try {
		const [forum] = await db
			.select({
				accessLevel: forumStructure.accessLevel,
				allowPosting: forumStructure.allowPosting
			})
			.from(forumStructure)
			.where(eq(forumStructure.id, forumId))
			.limit(1);

		if (!forum) {
			return false;
		}

		// Check if posting is disabled in this forum
		if (!forum.allowPosting) {
			return isModerator(user); // Only moderators can post in restricted forums
		}

		// Check access level requirements
		switch (forum.accessLevel) {
			case 'public':
				return true;
			case 'registered':
				return true; // All authenticated users can post
			case 'level_10+':
				// TODO: Implement level checking when user levels are available
				return true;
			case 'mod':
				return isModerator(user);
			case 'admin':
				return isAdmin(user);
			default:
				return true;
		}
	} catch (error) {
		logger.error('PermissionsService', 'Error checking forum posting permission', {
			userId: user.id,
			forumId,
			error
		});
		return false;
	}
}

/**
 * Check if user can perform moderation actions
 * Rules: Only moderators and admins
 */
export function canModerate(user: User): boolean {
	return isModerator(user);
}

/**
 * Check if user can access admin features
 * Rules: Only admins
 */
export function canAdministrate(user: User): boolean {
	return isAdmin(user);
}

// Removed deprecated getUserFromRequest wrapper - use userService.getUserFromRequest() directly

/**
 * Middleware helper for permission checking
 */
export function createPermissionChecker<T extends (...args: any[]) => Promise<boolean>>(
	permissionFn: T,
	errorMessage = 'Permission denied'
) {
	return async (req: any, res: any, next: any) => {
		try {
			const user = userService.getUserFromRequest(req);

			if (!user) {
				return res.status(401).json({
					success: false,
					error: 'Authentication required'
				});
			}

			// Extract entity ID from params
			const rawId = req.params.id || req.params.postId || req.params.threadId;
			if (!rawId || typeof rawId !== 'string') {
				return res.status(400).json({ 
					success: false, 
					error: 'Invalid ID format' 
				});
			}
			const entityId = rawId; // Keep as string for branded type system

			const hasPermission = await permissionFn(user, entityId);

			if (!hasPermission) {
				logger.warn('PermissionsService', 'Permission denied', {
					userId: user.id,
					userRole: user.role,
					entityId,
					path: req.path,
					method: req.method
				});

				return res.status(403).json({
					success: false,
					error: errorMessage
				});
			}

			next();
		} catch (error) {
			logger.error('PermissionsService', 'Error in permission check', { error });
			return res.status(500).json({
				success: false,
				error: 'Permission check failed'
			});
		}
	};
}

/**
 * Pre-built permission middleware for common operations
 */
export const requirePostEditPermission = createPermissionChecker(
	canEditPost,
	'You can only edit your own posts or must be a moderator'
);

export const requirePostDeletePermission = createPermissionChecker(
	canDeletePost,
	'You can only delete your own posts or must be a moderator'
);

export const requireThreadEditPermission = createPermissionChecker(
	canEditThread,
	'You can only edit your own threads or must be a moderator'
);

export const requireThreadDeletePermission = createPermissionChecker(
	canDeleteThread,
	'You can only delete your own threads or must be a moderator'
);

export const requireThreadSolvePermission = createPermissionChecker(
	canSolveThread,
	'You can only solve your own threads or must be a moderator'
);

export const requireThreadTagPermission = createPermissionChecker(
	canManageThreadTags,
	'You can only manage tags on your own threads or must be a moderator'
);

/**
 * Role-based middleware
 */
export function requireModerator(req: any, res: any, next: any) {
	const user = userService.getUserFromRequest(req);

	if (!user) {
		return res.status(401).json({
			success: false,
			error: 'Authentication required'
		});
	}

	if (!isModerator(user)) {
		logger.warn('PermissionsService', 'Moderator access denied', {
			userId: user.id,
			userRole: user.role,
			path: req.path
		});

		return res.status(403).json({
			success: false,
			error: 'Moderator privileges required'
		});
	}

	next();
}

export function requireAdmin(req: any, res: any, next: any) {
	const user = userService.getUserFromRequest(req);

	if (!user) {
		return res.status(401).json({
			success: false,
			error: 'Authentication required'
		});
	}

	if (!isAdmin(user)) {
		logger.warn('PermissionsService', 'Admin access denied', {
			userId: user.id,
			userRole: user.role,
			path: req.path
		});

		return res.status(403).json({
			success: false,
			error: 'Administrator privileges required'
		});
	}

	next();
}
