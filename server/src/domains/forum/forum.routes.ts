/**
 * Forum Routes
 *
 * Defines API routes for forum functionality including threads, posts,
 * categories, and related operations.
 */

import { Router, Request, Response } from 'express';
import { db } from '@db';
import { z } from 'zod';
import {
	posts,
	threads,
	postReactions,
	reactionTypeEnum,
	transactions,
	treasurySettings,
	transactionTypeEnum,
	transactionStatusEnum,
	users,
	threadDrafts,
	threadFeaturePermissions,
	insertThreadDraftSchema,
	forumCategories,
	userGroups,
	insertThreadSchema,
	insertPostSchema,
	userThreadBookmarks,
	threadPrefixes,
	tags,
	threadTags
} from '@schema';
import {
	sql,
	eq,
	and,
	desc,
	count,
	isNotNull,
	asc,
	ilike,
	or,
	gt,
	ne,
	inArray,
	isNull
} from 'drizzle-orm';
import { awardPathXp } from '@server/utils/path-utils';
import { xpRewards } from '@shared/path-config';
import { xpCloutService } from '../../../services/xp-clout-service';
import {
	isAuthenticated as requireAuth,
	isAdmin,
	isAdminOrModerator
} from '../auth/middleware/auth.middleware';
import { ThreadWithUserAndCategory, PostWithUser } from '@shared/types';
import { slugify } from '@server/utils/slugify';
import { XpLevelService, xpLevelService, XP_ACTIONS } from '../../../services/xp-level-service';
import rulesRoutes from './rules/rules.routes';
import { forumController } from './forum.controller';
import { forumService } from './forum.service';

// Define validation schemas
const tipPostSchema = z.object({
	amount: z.number().positive().min(0.000001)
});

// Define Bookmark creation schema
const createBookmarkSchema = z
	.object({
		threadId: z.number().int().positive()
	})
	.strict();

// Define Post creation schema (reply)
const createPostSchema = z
	.object({
		threadId: z.number().int().positive(),
		content: z.string().min(1),
		replyToPostId: z.number().int().positive().optional().nullable(),
		editorState: z.any().optional() // Allow editor state for rich text
	})
	.strict();

// Define Post update schema
const updatePostSchema = z
	.object({
		content: z.string().min(1), // Require content
		editorState: z.any().optional()
	})
	.strict();

// Post reaction schema
const postReactionSchema = z.object({
	type: z.enum(['like', 'helpful']),
	active: z.boolean()
});

// Helper function to get user ID from req.user
function getUserId(req: Request): number {
	if (req.user && typeof (req.user as any).id === 'number') {
		return (req.user as any).id;
	}
	console.error('User ID not found in req.user');
	return (req.user as any)?.user_id;
}

// Helper function to check user permissions (simplified)
async function getUserPermissions(userId: number | undefined) {
	if (!userId) return { isMod: false, isAdmin: false };
	const [user] = await db.select({ role: users.role }).from(users).where(eq(users.id, userId));
	// TODO: Enhance this with group checks if roles aren't sufficient
	const isAdmin = user?.role === 'admin';
	const isMod = isAdmin || user?.role === 'mod';
	return { isMod, isAdmin };
}

// ADDED: Helper function to check if user can manage (solve/unsolve) a thread
async function userCanManageThread(
	currentUserId: number,
	threadId: number,
	dbInstance: typeof db
): Promise<boolean> {
	const threadDetails = await dbInstance
		.select({ ownerId: threads.userId })
		.from(threads)
		.where(eq(threads.id, threadId))
		.limit(1);
	if (!threadDetails || threadDetails.length === 0) {
		return false; // Thread not found
	}
	if (threadDetails[0].ownerId === currentUserId) {
		return true; // User is the owner
	}
	// Check if user is mod or admin
	const { isMod, isAdmin } = await getUserPermissions(currentUserId);
	return isMod || isAdmin;
}

// Define thread draft validation schema
const updateDraftSchema = insertThreadDraftSchema
	.extend({
		editorState: z.any().optional()
	})
	.partial()
	.required({
		categoryId: true
	});

// ADDED: Schema for marking a thread as solved/unsolved
const solveThreadSchema = z
	.object({
		postId: z.number().int().positive().optional().nullable()
	})
	.strict();

const router = Router();

// Use the rules sub-router
router.use('/rules', rulesRoutes);

// --- THREAD CRUD ---

// Specific routes like '/search' should come BEFORE dynamic routes like '/:id' or '/:slug'
router.get('/threads/search', forumController.searchThreads);

// GET /threads - List threads with filtering, sorting, pagination
router.get('/threads', async (req: Request, res: Response) => {
	try {
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 25;
		const offset = (page - 1) * limit;
		const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
		const sortBy = (req.query.sort as string) || 'latest'; // 'latest', 'hot', 'staked'
		const searchQuery = req.query.q as string;

		const userId = getUserId(req); // Get current user ID if logged in
		const { isMod, isAdmin } = await getUserPermissions(userId);

		// Base query conditions
		const conditions = [
			eq(threads.isDeleted, false),
			// Hide hidden threads unless user is mod/admin
			...(isMod || isAdmin ? [] : [eq(threads.isHidden, false)])
		];

		if (categoryId) {
			conditions.push(eq(threads.categoryId, categoryId));
		}

		// Add search query condition (searching title)
		if (searchQuery) {
			conditions.push(ilike(threads.title, `%${searchQuery}%`));
		}

		// Determine sorting order
		let orderByClause;
		switch (sortBy) {
			case 'hot':
				orderByClause = [desc(threads.isSticky), desc(threads.hotScore), desc(threads.lastPostAt)];
				break;
			case 'staked':
				orderByClause = [desc(threads.isSticky), desc(threads.dgtStaked), desc(threads.lastPostAt)];
				break;
			case 'latest': // Default
			default:
				orderByClause = [desc(threads.isSticky), desc(threads.lastPostAt)];
				break;
		}

		try {
			// Fetch threads with user and category info using correct column names
			const threadListRaw = await db
				.select({
					// Select specific fields to avoid over-fetching
					id: threads.id,
					title: threads.title,
					slug: threads.slug,
					userId: threads.userId,
					prefixId: threads.prefixId,
					isSticky: threads.isSticky,
					isLocked: threads.isLocked,
					isHidden: threads.isHidden,
					viewCount: threads.viewCount,
					postCount: threads.postCount,
					firstPostLikeCount: threads.firstPostLikeCount,
					dgtStaked: threads.dgtStaked,
					hotScore: threads.hotScore,
					lastPostAt: threads.lastPostAt,
					createdAt: threads.createdAt,
					updatedAt: threads.updatedAt,
					isSolved: threads.isSolved,
					solvingPostId: threads.solvingPostId,
					// Include user info
					user: {
						id: users.id,
						username: users.username,
						avatarUrl: users.avatarUrl,
						activeAvatarUrl: users.activeAvatarUrl,
						role: users.role
					},
					// Include category info
					category: {
						id: forumCategories.id,
						name: forumCategories.name,
						slug: forumCategories.slug
					}
				})
				.from(threads)
				.innerJoin(users, eq(threads.userId, users.id))
				.innerJoin(forumCategories, eq(threads.categoryId, forumCategories.id))
				.where(and(...conditions))
				.orderBy(...orderByClause)
				.limit(limit)
				.offset(offset);

			// Fetch tags for the retrieved threads
			const threadIds = threadListRaw.map((t: any) => t.id);
			let tagsByThreadId: Record<number, { id: number; name: string; slug: string }[]> = {};

			if (threadIds.length > 0) {
				const tagResults = await db
					.select({
						threadId: threadTags.threadId,
						tagId: tags.id,
						tagName: tags.name,
						tagSlug: tags.slug
					})
					.from(threadTags)
					.innerJoin(tags, eq(threadTags.tagId, tags.id))
					.where(inArray(threadTags.threadId, threadIds));

				tagsByThreadId = tagResults.reduce(
					(acc: Record<number, { id: number; name: string; slug: string }[]>, row: any) => {
						if (!acc[row.threadId]) {
							acc[row.threadId] = [];
						}
						acc[row.threadId].push({ id: row.tagId, name: row.tagName, slug: row.tagSlug });
						return acc;
					},
					{} as Record<number, { id: number; name: string; slug: string }[]>
				);
			}

			const threadList = threadListRaw.map((thread: any) => ({
				...thread,
				tags: tagsByThreadId[thread.id] || []
			}));

			// Get total count for pagination
			const totalResult = await db
				.select({ count: count() })
				.from(threads)
				.where(and(...conditions));
			const totalThreads = totalResult[0]?.count || 0;
			const totalPages = Math.ceil(totalThreads / limit);

			// Add canEdit/canDelete flags
			const threadsWithFlags = threadList.map((t: any) => ({
				...t,
				canEdit: userId === t.user?.id || isMod || isAdmin,
				canDelete: userId === t.user?.id || isAdmin
			}));

			res.json({
				threads: threadsWithFlags,
				pagination: {
					page,
					limit,
					totalThreads,
					totalPages
				}
			});
		} catch (error) {
			console.error('Error in threads query:', error);
			// Return empty results instead of an error
			res.json({
				threads: [],
				pagination: {
					page,
					limit,
					totalThreads: 0,
					totalPages: 0
				}
			});
		}
	} catch (error) {
		console.error('Error fetching threads:', error);
		res.status(500).json({ message: 'An error occurred fetching threads' });
	}
});

// GET /threads/:id - Get a single thread and its posts
router.get('/threads/:id', async (req: Request, res: Response) => {
	try {
		const threadId = parseInt(req.params.id);
		if (isNaN(threadId)) {
			return res.status(400).json({ message: 'Invalid thread ID' });
		}

		const userId = getUserId(req); // Get current user ID if logged in
		const { isMod, isAdmin } = await getUserPermissions(userId);

		// Fetch thread details
		const threadResult = await db
			.select({
				// Select specific fields
				id: threads.id,
				title: threads.title,
				slug: threads.slug,
				userId: threads.userId,
				prefixId: threads.prefixId,
				isSticky: threads.isSticky,
				isLocked: threads.isLocked,
				isHidden: threads.isHidden,
				viewCount: threads.viewCount,
				postCount: threads.postCount,
				firstPostLikeCount: threads.firstPostLikeCount,
				dgtStaked: threads.dgtStaked,
				createdAt: threads.createdAt,
				updatedAt: threads.updatedAt,
				isSolved: threads.isSolved,
				solvingPostId: threads.solvingPostId,
				// Include user info
				user: {
					id: users.id,
					username: users.username,
					avatarUrl: users.avatarUrl,
					activeAvatarUrl: users.activeAvatarUrl,
					role: users.role
				},
				// Include category info
				category: {
					id: forumCategories.id,
					name: forumCategories.name,
					slug: forumCategories.slug
				}
			})
			.from(threads)
			.innerJoin(users, eq(threads.userId, users.id))
			.innerJoin(forumCategories, eq(threads.categoryId, forumCategories.id))
			.where(eq(threads.id, threadId))
			.limit(1);

		if (threadResult.length === 0) {
			return res.status(404).json({ message: 'Thread not found' });
		}

		const threadDetails = threadResult[0];

		// Check visibility permissions
		if (threadDetails.isHidden && !(isMod || isAdmin)) {
			return res.status(403).json({ message: 'You do not have permission to view this thread' });
		}
		// TODO: Add checks for category visibility permissions if applicable (VIP, group restrictions)

		// Fetch tags for this specific thread
		const threadTagResults = await db
			.select({
				id: tags.id,
				name: tags.name,
				slug: tags.slug
			})
			.from(threadTags)
			.innerJoin(tags, eq(threadTags.tagId, tags.id))
			.where(eq(threadTags.threadId, threadId));

		const threadWithTags = {
			...threadDetails,
			tags: threadTagResults || []
		};

		// Increment view count (consider debouncing or rate limiting this)
		await db
			.update(threads)
			.set({ viewCount: sql`${threads.viewCount} + 1` })
			.where(eq(threads.id, threadId));

		// Check if the current user has bookmarked this thread
		let hasBookmarked = false;
		if (userId) {
			const bookmarkCheck = await db
				.select({ threadId: userThreadBookmarks.threadId })
				.from(userThreadBookmarks)
				.where(
					and(eq(userThreadBookmarks.userId, userId), eq(userThreadBookmarks.threadId, threadId))
				)
				.limit(1);
			hasBookmarked = bookmarkCheck.length > 0;
		}

		// Fetch posts for this thread (with pagination)
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 50; // More posts per page for threads
		const offset = (page - 1) * limit;

		const postConditions = [
			eq(posts.threadId, threadId),
			eq(posts.isDeleted, false),
			// Hide hidden posts unless user is mod/admin
			...(isMod || isAdmin ? [] : [eq(posts.isHidden, false)])
		];

		const postList = await db
			.select({
				// Select post fields
				id: posts.id,
				userId: posts.userId,
				content: posts.content,
				editorState: posts.editorState, // Include if using rich text editor
				likeCount: posts.likeCount,
				tipCount: posts.tipCount,
				totalTips: posts.totalTips,
				isFirstPost: posts.isFirstPost,
				isHidden: posts.isHidden,
				isEdited: posts.isEdited,
				editedAt: posts.editedAt,
				createdAt: posts.createdAt,
				updatedAt: posts.updatedAt,
				replyToPostId: posts.replyToPostId,
				// Include user info
				user: {
					id: users.id,
					username: users.username,
					avatarUrl: users.avatarUrl,
					activeAvatarUrl: users.activeAvatarUrl,
					role: users.role,
					level: users.level,
					clout: users.clout
				}
			})
			.from(posts)
			.innerJoin(users, eq(posts.userId, users.id))
			.where(and(...postConditions))
			.orderBy(asc(posts.createdAt)) // Posts usually ordered oldest to newest
			.limit(limit)
			.offset(offset);

		// Get total post count for pagination
		const totalPostsResult = await db
			.select({ count: count() })
			.from(posts)
			.where(and(...postConditions));
		const totalPosts = totalPostsResult[0]?.count || 0;
		const totalPages = Math.ceil(totalPosts / limit);

		// Add flags to posts (canEdit, canDelete, hasLiked, etc.)
		// Fetch user's reactions (likes) for these posts in one go
		const postIds = postList.map((p: any) => p.id);
		let userLikes: Set<number> = new Set();
		if (userId && postIds.length > 0) {
			const likesResult = await db
				.select({ postId: postReactions.postId })
				.from(postReactions)
				.where(
					and(
						eq(postReactions.userId, userId),
						eq(postReactions.reactionType, 'like'),
						sql`${postReactions.postId} IN ${postIds}`
					)
				);
			userLikes = new Set(likesResult.map((l: any) => l.postId));
		}

		const postsWithFlags = postList.map((p: any) => ({
			...p,
			canEdit: userId === p.userId || isMod || isAdmin,
			canDelete: userId === p.userId || isAdmin, // Or isMod?
			hasLiked: userLikes.has(p.id)
		}));

		res.json({
			thread: {
				...threadWithTags,
				canEdit: userId === threadWithTags.user?.id || isMod || isAdmin,
				canDelete: userId === threadWithTags.user?.id || isAdmin,
				hasBookmarked: hasBookmarked
			},
			posts: postsWithFlags,
			pagination: {
				page,
				limit,
				totalPosts,
				totalPages
			}
		});
	} catch (error) {
		console.error('Error fetching thread:', error);
		res.status(500).json({ message: 'An error occurred fetching the thread' });
	}
});

// GET /threads/slug/:slug - Get a single thread and its posts by slug
router.get('/threads/slug/:slug', async (req: Request, res: Response) => {
	try {
		const threadSlug = req.params.slug;
		if (!threadSlug) {
			return res.status(400).json({ message: 'Thread slug is required' });
		}

		const userId = getUserId(req); // Get current user ID if logged in
		const { isMod, isAdmin } = await getUserPermissions(userId);

		// Fetch thread details by slug
		const threadResult = await db
			.select({
				// Select specific fields
				id: threads.id,
				title: threads.title,
				slug: threads.slug,
				userId: threads.userId,
				prefixId: threads.prefixId,
				isSticky: threads.isSticky,
				isLocked: threads.isLocked,
				isHidden: threads.isHidden,
				viewCount: threads.viewCount,
				postCount: threads.postCount,
				firstPostLikeCount: threads.firstPostLikeCount,
				dgtStaked: threads.dgtStaked,
				createdAt: threads.createdAt,
				updatedAt: threads.updatedAt,
				isSolved: threads.isSolved,
				solvingPostId: threads.solvingPostId,
				// Include user info
				user: {
					id: users.id,
					username: users.username,
					avatarUrl: users.avatarUrl,
					activeAvatarUrl: users.activeAvatarUrl,
					role: users.role
				},
				// Include category info
				category: {
					id: forumCategories.id,
					name: forumCategories.name,
					slug: forumCategories.slug
				}
			})
			.from(threads)
			.innerJoin(users, eq(threads.userId, users.id))
			.innerJoin(forumCategories, eq(threads.categoryId, forumCategories.id))
			.where(eq(threads.slug, threadSlug))
			.limit(1);

		if (threadResult.length === 0) {
			return res.status(404).json({ message: 'Thread not found' });
		}

		const threadDetails = threadResult[0];

		// Check visibility permissions
		if (threadDetails.isHidden && !(isMod || isAdmin)) {
			return res.status(403).json({ message: 'You do not have permission to view this thread' });
		}
		// TODO: Add checks for category visibility permissions if applicable (VIP, group restrictions)

		// Fetch tags for this specific thread
		const threadTagResults = await db
			.select({
				id: tags.id,
				name: tags.name,
				slug: tags.slug
			})
			.from(threadTags)
			.innerJoin(tags, eq(threadTags.tagId, tags.id))
			.where(eq(threadTags.threadId, threadDetails.id));

		const threadWithTags = {
			...threadDetails,
			tags: threadTagResults || []
		};

		// Increment view count (consider debouncing or rate limiting this)
		await db
			.update(threads)
			.set({ viewCount: sql`${threads.viewCount} + 1` })
			.where(eq(threads.id, threadDetails.id));

		// Check if the current user has bookmarked this thread
		let hasBookmarked = false;
		if (userId) {
			const bookmarkCheck = await db
				.select({ threadId: userThreadBookmarks.threadId })
				.from(userThreadBookmarks)
				.where(
					and(
						eq(userThreadBookmarks.userId, userId),
						eq(userThreadBookmarks.threadId, threadDetails.id)
					)
				)
				.limit(1);
			hasBookmarked = bookmarkCheck.length > 0;
		}

		// Fetch posts for this thread (with pagination)
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 50; // More posts per page for threads
		const offset = (page - 1) * limit;

		const postConditions = [
			eq(posts.threadId, threadDetails.id),
			eq(posts.isDeleted, false),
			// Hide hidden posts unless user is mod/admin
			...(isMod || isAdmin ? [] : [eq(posts.isHidden, false)])
		];

		const postList = await db
			.select({
				// Select post fields
				id: posts.id,
				userId: posts.userId,
				content: posts.content,
				editorState: posts.editorState, // Include if using rich text editor
				likeCount: posts.likeCount,
				tipCount: posts.tipCount,
				totalTips: posts.totalTips,
				isFirstPost: posts.isFirstPost,
				isHidden: posts.isHidden,
				isEdited: posts.isEdited,
				editedAt: posts.editedAt,
				createdAt: posts.createdAt,
				updatedAt: posts.updatedAt,
				replyToPostId: posts.replyToPostId,
				// Include user info
				user: {
					id: users.id,
					username: users.username,
					avatarUrl: users.avatarUrl,
					activeAvatarUrl: users.activeAvatarUrl,
					role: users.role,
					level: users.level,
					clout: users.clout
				}
			})
			.from(posts)
			.innerJoin(users, eq(posts.userId, users.id))
			.where(and(...postConditions))
			.orderBy(asc(posts.createdAt)) // Posts usually ordered oldest to newest
			.limit(limit)
			.offset(offset);

		// Get total post count for pagination
		const totalPostsResult = await db
			.select({ count: count() })
			.from(posts)
			.where(and(...postConditions));
		const totalPosts = totalPostsResult[0]?.count || 0;
		const totalPages = Math.ceil(totalPosts / limit);

		// Add flags to posts (canEdit, canDelete, hasLiked, etc.)
		// Fetch user's reactions (likes) for these posts in one go
		const postIds = postList.map((p: any) => p.id);
		let userLikes: Set<number> = new Set();
		if (userId && postIds.length > 0) {
			const likesResult = await db
				.select({ postId: postReactions.postId })
				.from(postReactions)
				.where(
					and(
						eq(postReactions.userId, userId),
						eq(postReactions.reactionType, 'like'),
						sql`${postReactions.postId} IN ${postIds}`
					)
				);
			userLikes = new Set(likesResult.map((l: any) => l.postId));
		}

		const postsWithFlags = postList.map((p: any) => ({
			...p,
			canEdit: userId === p.userId || isMod || isAdmin,
			canDelete: userId === p.userId || isAdmin, // Or isMod?
			hasLiked: userLikes.has(p.id)
		}));

		res.json({
			thread: {
				...threadWithTags,
				canEdit: userId === threadWithTags.user?.id || isMod || isAdmin,
				canDelete: userId === threadWithTags.user?.id || isAdmin,
				hasBookmarked: hasBookmarked
			},
			posts: postsWithFlags,
			pagination: {
				page,
				limit,
				totalPosts,
				totalPages
			}
		});
	} catch (error) {
		console.error('Error fetching thread by slug:', error);
		res.status(500).json({ message: 'An error occurred fetching the thread by slug' });
	}
});

// POST /threads - Create a new thread directly (not from draft)
router.post('/threads', requireAuth, async (req: Request, res: Response) => {
	// Changed isAuthenticated to requireAuth
	try {
		const userId = getUserId(req);

		const combinedSchema = insertThreadSchema
			.extend({
				content: z.string().min(1),
				editorState: z.any().optional(),
				tagNames: z.array(z.string().min(1).max(50)).optional()
			})
			.required({ categoryId: true, title: true });

		const parseResult = combinedSchema.safeParse(req.body);
		if (!parseResult.success) {
			return res
				.status(400)
				.json({ message: 'Invalid thread data', errors: parseResult.error.flatten() });
		}
		const validatedThreadData = parseResult.data;
		const validatedPostData = {
			content: validatedThreadData.content,
			editorState: validatedThreadData.editorState
		};

		// Simplified Category Permission Check
		const category = await db
			.select()
			.from(forumCategories)
			.where(eq(forumCategories.id, Number(validatedThreadData.categoryId)))
			.limit(1);
		if (!category[0]) {
			return res.status(400).json({ message: 'Category not found' });
		}
		if (category[0].isLocked) {
			const { isMod, isAdmin } = await getUserPermissions(userId);
			if (!isMod && !isAdmin) {
				return res.status(403).json({ message: 'This category is locked.' });
			}
		}
		// Deferring more complex minGroupIdRequired checks for now to unblock tagging.

		const { thread: newThreadData, firstPost } = await db.transaction(async (tx: typeof db) => {
			const threadSlug = await slugify(String(validatedThreadData.title));

			const [createdThread] = await tx
				.insert(threads)
				.values({
					title: validatedThreadData.title,
					slug: threadSlug,
					categoryId: validatedThreadData.categoryId,
					userId: userId,
					prefixId: validatedThreadData.prefixId || null
				})
				.returning({ id: threads.id });

			const [createdPost] = await tx
				.insert(posts)
				.values({
					threadId: createdThread.id,
					userId: userId,
					content: validatedPostData.content,
					editorState: validatedPostData.editorState,
					isFirstPost: true
				})
				.returning();

			if (validatedThreadData.tagNames && validatedThreadData.tagNames.length > 0) {
				for (const tagName of validatedThreadData.tagNames) {
					let tag;
					const existingTags = await tx
						.select({ id: tags.id })
						.from(tags)
						.where(eq(tags.name, tagName))
						.limit(1);
					tag = existingTags[0];

					if (!tag) {
						const newTagSlug = await slugify(tagName);
						const newTagsResults = await tx
							.insert(tags)
							.values({ name: tagName, slug: newTagSlug })
							.returning({ id: tags.id, name: tags.name, slug: tags.slug });
						tag = newTagsResults[0];
					}
					if (tag) {
						// Ensure tag is defined before inserting into threadTags
						const existingThreadTag = await tx
							.select({ threadId: threadTags.threadId }) // select a field to check length
							.from(threadTags)
							.where(and(eq(threadTags.threadId, createdThread.id), eq(threadTags.tagId, tag.id)))
							.limit(1);
						if (existingThreadTag.length === 0) {
							await tx.insert(threadTags).values({ threadId: createdThread.id, tagId: tag.id });
						}
					}
				}
			}

			await tx
				.update(threads)
				.set({
					lastPostId: createdPost.id,
					lastPostAt: createdPost.createdAt,
					postCount: 1
				})
				.where(eq(threads.id, createdThread.id));

			// Award XP/Clout
			try {
				await xpCloutService.awardPoints(userId, 'THREAD_CREATE');
				await xpCloutService.awardPoints(userId, 'POST_CREATE');

				// Also award XP using the new XP system
				await xpLevelService.awardXp(userId, XP_ACTIONS.POST_CREATED);
				// Thread creation awards additional XP beyond regular post
				await xpLevelService.awardXp(userId, XP_ACTIONS.POST_CREATED);
			} catch (xpError) {
				console.error('Error awarding XP for new thread/post:', xpError);
			}

			const finalThreadDetailsArray = await tx
				.select({
					id: threads.id,
					title: threads.title,
					slug: threads.slug,
					userId: threads.userId,
					prefixId: threads.prefixId,
					isSticky: threads.isSticky,
					isLocked: threads.isLocked,
					isHidden: threads.isHidden,
					viewCount: threads.viewCount,
					postCount: threads.postCount,
					firstPostLikeCount: threads.firstPostLikeCount,
					dgtStaked: threads.dgtStaked,
					createdAt: threads.createdAt,
					updatedAt: threads.updatedAt,
					isSolved: threads.isSolved,
					solvingPostId: threads.solvingPostId,
					user: {
						id: users.id,
						username: users.username,
						activeAvatarUrl: users.activeAvatarUrl,
						role: users.role,
						level: users.level,
						clout: users.clout,
						createdAt: users.createdAt
					},
					category: {
						id: forumCategories.id,
						name: forumCategories.name,
						slug: forumCategories.slug
					}
				})
				.from(threads)
				.innerJoin(users, eq(threads.userId, users.id))
				.innerJoin(forumCategories, eq(threads.categoryId, forumCategories.id))
				.where(eq(threads.id, createdThread.id))
				.limit(1);

			const finalThreadDetails = finalThreadDetailsArray[0];

			const threadTagsData = await tx
				.select({ id: tags.id, name: tags.name, slug: tags.slug })
				.from(threadTags)
				.innerJoin(tags, eq(threadTags.tagId, tags.id))
				.where(eq(threadTags.threadId, createdThread.id));

			// Ensure user and category are not undefined before spreading
			const userPayload = finalThreadDetails.user || {};
			const categoryPayload = finalThreadDetails.category || {};

			return {
				thread: {
					...finalThreadDetails,
					user: userPayload,
					category: categoryPayload,
					tags: threadTagsData
				},
				firstPost: createdPost
			};
		});

		res.status(201).json({ thread: newThreadData, firstPost });
	} catch (error) {
		console.error('Error creating thread:', error);
		if (error instanceof z.ZodError) {
			return res.status(400).json({ message: 'Invalid thread data', errors: error.flatten() });
		}
		res.status(500).json({ message: 'An error occurred creating the thread' });
	}
});

// ADDED: PUT route to mark/unmark a thread as solved
router.put('/threads/:threadId/solve', requireAuth, async (req, res, next) => {
	try {
		const threadId = parseInt(req.params.threadId);
		const currentUserId = getUserId(req);

		if (isNaN(threadId)) {
			return res.status(400).json({ message: 'Invalid thread ID.' });
		}

		// Check permissions using the helper function
		const canManage = await userCanManageThread(currentUserId, threadId, db);
		if (!canManage) {
			return res
				.status(403)
				.json({ message: 'Unauthorized to manage solved status for this thread.' });
		}

		// Validate request body for postId (optional for unsolving)
		const validationResult = solveThreadSchema.safeParse(req.body);
		if (!validationResult.success) {
			return res
				.status(400)
				.json({ message: 'Invalid request body.', errors: validationResult.error.errors });
		}

		const { postId } = validationResult.data;

		// Call the controller function
		// Note: The controller will handle the logic of solving (with postId) or unsolving (with postId = null)
		return forumController.solveThread(req, res);
	} catch (error) {
		console.error('Error in PUT /threads/:threadId/solve route:', error);
		next(error); // Pass to error handler
	}
});

// POST /threads/:threadId/tags - Add a tag to a thread
router.post('/threads/:threadId/tags', requireAuth, async (req: Request, res: Response) => {
	// Changed isAuthenticated to requireAuth
	try {
		const threadId = parseInt(req.params.threadId);
		const userId = getUserId(req);

		// Validate tag name from request body
		const { tagName } = z.object({ tagName: z.string().min(1).max(50) }).parse(req.body);

		if (isNaN(threadId)) {
			return res.status(400).json({ message: 'Invalid thread ID' });
		}

		// Check if user has permission to manage this thread's tags
		const canManage = await userCanManageThread(userId, threadId, db);
		if (!canManage) {
			return res
				.status(403)
				.json({ message: "You do not have permission to manage this thread's tags." });
		}

		// Insert or retrieve tag and create thread-tag association in a transaction
		const result = await db.transaction(async (tx: typeof db) => {
			// Check if tag already exists
			let [tag] = await tx
				.select({ id: tags.id, name: tags.name, slug: tags.slug })
				.from(tags)
				.where(eq(tags.name, tagName))
				.limit(1);

			// If tag doesn't exist, create a new one with a slugified name
			if (!tag) {
				const newTagSlug = await slugify(tagName);
				[tag] = await tx
					.insert(tags)
					.values({ name: tagName, slug: newTagSlug })
					.returning({ id: tags.id, name: tags.name, slug: tags.slug });
			}

			// Check if thread already has this tag
			const existingThreadTag = await tx
				.select({ threadId: threadTags.threadId })
				.from(threadTags)
				.where(and(eq(threadTags.threadId, threadId), eq(threadTags.tagId, tag.id)))
				.limit(1);

			// If thread doesn't have this tag, add it
			if (existingThreadTag.length === 0) {
				await tx.insert(threadTags).values({ threadId: threadId, tagId: tag.id });
				return { tag, added: true }; // Tag was newly added
			}

			return { tag, added: false }; // Tag was already associated
		});

		res.status(result.added ? 201 : 200).json(result.tag);
	} catch (error) {
		console.error('Error adding tag to thread:', error);
		if (error instanceof z.ZodError) {
			return res.status(400).json({
				message: 'Invalid request data',
				errors: error.flatten()
			});
		}
		res.status(500).json({ message: 'An error occurred while adding tag to thread' });
	}
});

// DELETE /threads/:threadId/tags/:tagId - Remove a tag from a thread
router.delete(
	'/threads/:threadId/tags/:tagId',
	requireAuth,
	async (req: Request, res: Response) => {
		// Changed isAuthenticated to requireAuth
		try {
			const threadId = parseInt(req.params.threadId);
			const tagId = parseInt(req.params.tagId);
			const userId = getUserId(req);

			if (isNaN(threadId) || isNaN(tagId)) {
				return res.status(400).json({ message: 'Invalid thread ID or tag ID' });
			}

			const canManage = await userCanManageThread(userId, threadId, db);
			if (!canManage) {
				return res
					.status(403)
					.json({ message: "You do not have permission to manage this thread's tags." });
			}

			const deleteResult = await db
				.delete(threadTags)
				.where(and(eq(threadTags.threadId, threadId), eq(threadTags.tagId, tagId)))
				.returning({ deletedThreadId: threadTags.threadId }); // Check if anything was deleted

			if (deleteResult.length === 0) {
				return res.status(404).json({ message: 'Tag association not found or already removed.' });
			}

			res.status(200).json({ message: 'Tag removed successfully' });
		} catch (error) {
			console.error('Error removing tag from thread:', error);
			res.status(500).json({ message: 'An error occurred while removing tag from thread' });
		}
	}
);

// GET /threads/:threadId/tags - Get all tags for a thread
router.get('/threads/:threadId/tags', async (req: Request, res: Response) => {
	try {
		const threadId = parseInt(req.params.threadId);

		if (isNaN(threadId)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid thread ID'
			});
		}

		// Fetch tags associated with the thread - renamed variable to tagsForThread to avoid collision
		const tagsForThread = await db
			.select({
				tagId: tags.id,
				tagName: tags.name,
				tagSlug: tags.slug
			})
			.from(tags)
			.innerJoin(threadTags, eq(tags.id, threadTags.tagId))
			.where(eq(threadTags.threadId, threadId))
			.orderBy(asc(tags.name));

		res.json({
			success: true,
			threadId,
			tags: tagsForThread,
			count: tagsForThread.length
		});
	} catch (error) {
		console.error('Error fetching thread tags:', error);
		res.status(500).json({
			success: false,
			message: 'An error occurred fetching thread tags',
			error: error instanceof Error ? error.message : 'Unknown error'
		});
	}
});

// React to a post
router.post('/posts/:postId/react', requireAuth, async (req, res) => {
	try {
		const { postId } = req.params;
		const type = req.body.type;
		const active = req.body.active;
		const userId = getUserId(req);

		// Get post to verify it exists
		const postResult = await db
			.select()
			.from(posts)
			.where(eq(posts.id, parseInt(postId)));
		if (postResult.length === 0) {
			return res.status(404).json({ error: 'Post not found' });
		}

		// Check if reaction already exists
		const existingReaction = await db
			.select()
			.from(postReactions)
			.where(
				and(
					eq(postReactions.postId, parseInt(postId)),
					eq(postReactions.userId, userId),
					eq(postReactions.reactionType, type)
				)
			);

		if (active) {
			// Add reaction if it doesn't exist
			if (existingReaction.length === 0) {
				await db.insert(postReactions).values({
					postId: parseInt(postId),
					userId,
					reactionType: type
				});

				// Update like count
				if (type === 'like') {
					await db
						.update(posts)
						.set({
							likeCount: sql`${posts.likeCount} + 1`
						})
						.where(eq(posts.id, parseInt(postId)));
				}
			}
		} else {
			// Remove reaction if it exists
			if (existingReaction.length > 0) {
				await db
					.delete(postReactions)
					.where(
						and(
							eq(postReactions.postId, parseInt(postId)),
							eq(postReactions.userId, userId),
							eq(postReactions.reactionType, type)
						)
					);

				// Update like count
				if (type === 'like') {
					await db
						.update(posts)
						.set({
							likeCount: sql`${posts.likeCount} - 1`
						})
						.where(eq(posts.id, parseInt(postId)));
				}
			}
		}

		return res.status(200).json({ success: true });
	} catch (error) {
		console.error('Error handling post reaction:', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
});

// Bookmark a thread
router.post('/bookmarks', requireAuth, async (req, res) => {
	try {
		const { threadId } = req.body;
		const userId = getUserId(req);

		// Verify thread exists
		const threadResult = await db.select().from(threads).where(eq(threads.id, threadId));
		if (threadResult.length === 0) {
			return res.status(404).json({ error: 'Thread not found' });
		}

		// Check if bookmark already exists
		const existingBookmark = await db
			.select()
			.from(userThreadBookmarks)
			.where(
				and(eq(userThreadBookmarks.threadId, threadId), eq(userThreadBookmarks.userId, userId))
			);

		if (existingBookmark.length === 0) {
			await db.insert(userThreadBookmarks).values({
				threadId,
				userId
			});
		}

		return res.status(200).json({ success: true });
	} catch (error) {
		console.error('Error bookmarking thread:', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
});

// Remove a thread bookmark
router.delete('/bookmarks/:threadId', requireAuth, async (req, res) => {
	try {
		const threadId = parseInt(req.params.threadId);
		const userId = getUserId(req);

		await db
			.delete(userThreadBookmarks)
			.where(
				and(eq(userThreadBookmarks.threadId, threadId), eq(userThreadBookmarks.userId, userId))
			);

		return res.status(200).json({ success: true });
	} catch (error) {
		console.error('Error removing bookmark:', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
});

// Mark thread as solved
router.post('/threads/:threadId/solve', requireAuth, async (req, res) => {
	try {
		const threadId = parseInt(req.params.threadId);
		const { postId } = req.body;
		const userId = getUserId(req);

		// Get thread details
		const threadResult = await db
			.select({
				id: threads.id,
				userId: threads.userId,
				isSolved: threads.isSolved
			})
			.from(threads)
			.where(eq(threads.id, threadId))
			.limit(1);

		if (threadResult.length === 0) {
			return res.status(404).json({ error: 'Thread not found' });
		}

		const thread = threadResult[0];

		// Check if user can mark this thread as solved
		const canManage = await userCanManageThread(userId, threadId, db);
		if (!canManage) {
			return res
				.status(403)
				.json({ error: 'You do not have permission to mark this thread as solved' });
		}

		// If postId is provided, verify it exists and belongs to this thread
		if (postId) {
			const postResult = await db
				.select({ id: posts.id })
				.from(posts)
				.where(and(eq(posts.id, postId), eq(posts.threadId, threadId)))
				.limit(1);

			if (postResult.length === 0) {
				return res.status(404).json({ error: 'Post not found or does not belong to this thread' });
			}
		}

		// Update thread as solved
		await db
			.update(threads)
			.set({
				isSolved: true,
				solvingPostId: postId
			})
			.where(eq(threads.id, threadId));

		return res.status(200).json({
			success: true,
			message: 'Thread marked as solved'
		});
	} catch (error) {
		console.error('Error marking thread as solved:', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
});

// Unmark thread as solved
router.post('/threads/:threadId/unsolve', requireAuth, async (req, res) => {
	try {
		const threadId = parseInt(req.params.threadId);
		const userId = getUserId(req);

		// Get thread details
		const threadResult = await db
			.select({
				id: threads.id,
				userId: threads.userId,
				isSolved: threads.isSolved
			})
			.from(threads)
			.where(eq(threads.id, threadId))
			.limit(1);

		if (threadResult.length === 0) {
			return res.status(404).json({ error: 'Thread not found' });
		}

		const thread = threadResult[0];

		// Check if user can unmark this thread as solved
		const canManage = await userCanManageThread(userId, threadId, db);
		if (!canManage) {
			return res
				.status(403)
				.json({ error: 'You do not have permission to unmark this thread as solved' });
		}

		// Update thread as not solved
		await db
			.update(threads)
			.set({
				isSolved: false,
				solvingPostId: null
			})
			.where(eq(threads.id, threadId));

		return res.status(200).json({
			success: true,
			message: 'Thread unmarked as solved'
		});
	} catch (error) {
		console.error('Error unmarking thread as solved:', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
});

// PUT /posts/:id - Update an existing post
router.put('/posts/:id', requireAuth, async (req: Request, res: Response) => {
	try {
		const postId = parseInt(req.params.id);
		if (isNaN(postId)) {
			return res.status(400).json({ message: 'Invalid post ID' });
		}

		const userId = getUserId(req);
		const { isMod, isAdmin } = await getUserPermissions(userId);

		// Validate request body
		const validatedData = updatePostSchema.safeParse(req.body);
		if (!validatedData.success) {
			return res.status(400).json({
				message: 'Invalid post data',
				errors: validatedData.error.errors
			});
		}

		// Fetch post to check ownership and existence
		const existingPost = await db
			.select({
				id: posts.id,
				userId: posts.userId,
				content: posts.content
			})
			.from(posts)
			.where(eq(posts.id, postId))
			.limit(1);

		if (existingPost.length === 0) {
			return res.status(404).json({ message: 'Post not found' });
		}

		const post = existingPost[0];

		// Check if user has permission to edit this post
		if (post.userId !== userId && !isMod && !isAdmin) {
			return res.status(403).json({ message: "You don't have permission to edit this post" });
		}

		// Update the post
		const { content, editorState } = validatedData.data;

		// Only update if content has changed
		if (content === post.content) {
			return res.status(200).json({
				message: 'No changes made to post',
				post: post
			});
		}

		const updatedPost = await db
			.update(posts)
			.set({
				content: content,
				editorState: editorState || null,
				isEdited: true,
				editedAt: new Date(),
				editedBy: userId,
				updatedAt: new Date()
			})
			.where(eq(posts.id, postId))
			.returning({
				id: posts.id,
				content: posts.content,
				editorState: posts.editorState,
				isEdited: posts.isEdited,
				editedAt: posts.editedAt,
				updatedAt: posts.updatedAt
			});

		if (!updatedPost || updatedPost.length === 0) {
			return res.status(500).json({ message: 'Failed to update post' });
		}

		// Return success response
		return res.status(200).json({
			message: 'Post updated successfully',
			post: updatedPost[0]
		});
	} catch (error) {
		console.error('Error updating post:', error);
		return res.status(500).json({ message: 'An error occurred updating the post' });
	}
});

// GET /users/search - Search for users for @mentions
router.get('/users/search', async (req: Request, res: Response) => {
	try {
		const query = req.query.query as string;
		if (!query || query.length < 2) {
			return res.status(200).json({ users: [] });
		}

		const results = await db
			.select({
				id: users.id,
				username: users.username,
				avatarUrl: users.avatarUrl
			})
			.from(users)
			.where(ilike(users.username, `%${query}%`))
			.limit(10);

		return res.status(200).json({ users: results });
	} catch (error) {
		console.error('Error searching users:', error);
		return res.status(500).json({ message: 'An error occurred searching for users' });
	}
});

// Hot threads endpoint for homepage
router.get('/hot-threads', async (req: Request, res: Response) => {
	try {
		const limit = parseInt(req.query.limit as string) || 5;

		// Use the regular db instance instead of neon client
		const hotThreads = await db
			.select({
				id: threads.id,
				title: threads.title,
				slug: threads.slug,
				postCount: threads.postCount,
				viewCount: threads.viewCount,
				hotScore: threads.hotScore,
				createdAt: threads.createdAt,
				lastPostAt: threads.lastPostAt,
				userId: threads.userId,
				username: users.username,
				avatarUrl: users.avatarUrl,
				categoryName: forumCategories.name,
				categorySlug: forumCategories.slug,
				likeCount: posts.likeCount
			})
			.from(threads)
			.leftJoin(users, eq(threads.userId, users.id))
			.leftJoin(forumCategories, eq(threads.categoryId, forumCategories.id))
			.leftJoin(posts, and(eq(threads.id, posts.threadId), eq(posts.isFirstPost, true)))
			.where(and(eq(threads.isDeleted, false), eq(threads.isHidden, false)))
			.orderBy(desc(threads.createdAt)) // Sort by newest first since we don't rely on hot_score
			.limit(limit);

		// Map to the expected format
		const formattedThreads = hotThreads.map((thread: any) => ({
			thread_id: thread.id,
			title: thread.title,
			slug: thread.slug,
			post_count: thread.postCount || 0,
			view_count: thread.viewCount || 0,
			hot_score: thread.hotScore || 0,
			created_at: thread.createdAt,
			last_post_at: thread.lastPostAt,
			user_id: thread.userId,
			username: thread.username || 'Anonymous',
			avatar_url: thread.avatarUrl,
			category_name: thread.categoryName || 'General',
			category_slug: thread.categorySlug || 'general',
			like_count: thread.likeCount || 0
		}));

		res.json(formattedThreads);
	} catch (error) {
		console.error('Error fetching hot threads:', error);
		res.status(500).json({ error: 'Failed to fetch hot threads' });
	}
});

// General category and forum routes using controller (usually less specific, so can be later)
router.get('/categories', forumController.getCategoriesWithStats);
router.get('/categories/tree', forumController.getCategoriesTree);
router.get('/categories/:slug', forumController.getCategoryBySlug);
router.get('/category/:id', forumController.getCategoryById); // Note: singular 'category'
router.get('/forums/:slug', forumController.getForumBySlug);
router.get('/forums/:slug/topics', async (req, res) => {
	const { slug } = req.params;
	console.log(`[Forum Routes] Received request for /forums/${slug}/topics`);
	try {
		// Call the controller function
		await forumController.getForumBySlugWithTopics(req, res);
		// Note: The controller handles sending the response, so no need to log result here
	} catch (error) {
		console.error(`[Forum Routes] Error in /forums/${slug}/topics route:`, error);
		// Ensure a response is sent if the controller didn't handle the error
		if (!res.headersSent) {
			res.status(500).json({ message: 'An error occurred fetching forum topics' });
		}
	}
});
router.get('/prefixes', forumController.getPrefixes);
router.get('/tags', forumController.getTags); // Controller version of getTags

// New route for getting forums by parent ID
router.get('/forums', forumController.getForumsByParentId);

// Add an explicit route with debug logging
router.get('/debug/forums-by-parent', async (req: Request, res: Response) => {
	try {
		const parentId = req.query.parentId ? parseInt(req.query.parentId as string) : undefined;

		console.log('[DEBUG] /forums-by-parent called with parentId:', parentId);

		if (!parentId || isNaN(parentId)) {
			console.log('[DEBUG] Invalid parentId parameter:', req.query.parentId);
			return res.status(400).json({
				message: 'Valid parent ID is required',
				debug: {
					providedValue: req.query.parentId,
					parsed: parentId
				}
			});
		}

		const categories = await forumService.getCategoriesWithStats();
		console.log('[DEBUG] Total categories found:', categories.length);

		const parentForum = categories.find((cat) => cat.id === parentId);
		console.log('[DEBUG] Parent forum found:', parentForum ? parentForum.name : 'Not found');

		const childForums = categories.filter((cat) => cat.parentId === parentId);
		console.log('[DEBUG] Child forums found:', childForums.length);

		if (childForums.length === 0) {
			console.log('[DEBUG] No child forums found for parentId:', parentId);
		} else {
			console.log(
				'[DEBUG] Child forum names:',
				childForums.map((f) => f.name)
			);
		}

		// Add canHaveThreads property and parent info to each child forum
		const result = childForums.map((forum) => ({
			...forum,
			canHaveThreads: true, // Child forums should always be able to have threads
			parentSlug: parentForum?.slug || null,
			parentName: parentForum?.name || null
		}));

		return res.status(200).json({
			forums: result,
			debug: {
				parentId,
				parentName: parentForum?.name,
				childCount: result.length
			}
		});
	} catch (error) {
		console.error('[DEBUG] Error in debug forums-by-parent:', error);
		return res.status(500).json({
			message: 'Failed to fetch child forums',
			error: error instanceof Error ? error.message : 'Unknown error'
		});
	}
});

// Debug route to examine database forum structure (only accessible in development)
router.get('/debug/structure', async (req: Request, res: Response) => {
	if (process.env.NODE_ENV === 'production' && !req.query.admin_key) {
		return res.status(403).json({ message: 'Not allowed in production' });
	}

	try {
		const { neon } = await import('@neondatabase/serverless');
		const sql = neon(process.env.DATABASE_URL!);

		// Fetch raw forum categories from database
		const categories = await sql`
      SELECT * FROM forum_categories
      ORDER BY position ASC, name ASC
    `;

		// Count threads per category
		const threadCounts = await sql`
      SELECT category_id, COUNT(*) as thread_count
      FROM threads 
      GROUP BY category_id
    `;

		// Create thread count map
		const threadCountMap = new Map();
		threadCounts.forEach((tc: any) => {
			threadCountMap.set(tc.category_id, tc.thread_count);
		});

		// Add thread counts to categories
		const categoriesWithCounts = categories.map((cat: any) => ({
			...cat,
			threadCount: threadCountMap.get(cat.category_id) || 0
		}));

		// Return detailed structure data
		res.json({
			categories: categoriesWithCounts,
			threadCounts: Object.fromEntries(threadCountMap),
			categoriesCount: categories.length,
			message: 'This endpoint is for debugging purposes only'
		});
	} catch (error) {
		console.error('Debug structure error:', error);
		res.status(500).json({
			error: 'Failed to fetch debug structure',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
});

// Debug route to examine forum parent-child relationships
router.get('/debug/forum-relationships', async (req: Request, res: Response) => {
	if (process.env.NODE_ENV === 'production' && !req.query.admin_key) {
		return res.status(403).json({ message: 'Not allowed in production' });
	}

	try {
		const relationships = await forumService.debugForumRelationships();

		// Add some summary statistics for debugging
		const stats = {
			primaryZoneCount: relationships.primaryZones.length,
			categoryCount: relationships.categories.length,
			totalChildForumCount: relationships.categories.reduce(
				(sum, cat) => sum + cat.childForums.length,
				0
			),
			categoriesWithNoChildren: relationships.categories
				.filter((cat) => cat.childForums.length === 0)
				.map((cat) => `${cat.name} (ID: ${cat.id})`)
		};

		// Count child forums per category
		const categoryBreakdown = relationships.categories.map((cat) => ({
			id: cat.id,
			name: cat.name,
			childCount: cat.childForums.length,
			childForums: cat.childForums.map((forum) => `${forum.name} (ID: ${forum.id})`)
		}));

		// Return the debug info
		res.json({
			relationships,
			stats,
			categoryBreakdown
		});
	} catch (error) {
		console.error('Debug forum relationships error:', error);
		res.status(500).json({
			error: 'Failed to fetch forum relationships',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
});

// Get forum structure (zones and categories) - needed by frontend
router.get('/structure', async (req: Request, res: Response) => {
	try {
		// Get forum categories with stats (threadCount, postCount, and pluginData are already handled by the service)
		const allCategories = await forumService.getCategoriesWithStats();

		// Extract primary zones (isZone is true, canonical is true)
		const primaryZones = allCategories
			.filter((cat) => cat.isZone === true && cat.canonical === true)
			.map((zone) => ({
				...zone,
				canHaveThreads: true
			}));

		// Extract categories (not zones, parentId is null)
		const categories = allCategories
			.filter((cat) => !cat.isZone && cat.parentId === null)
			.map((category) => {
				// Find child forums for this category
				const forums = allCategories
					.filter((forum) => forum.parentId === category.id)
					.map((forum) => ({
						...forum,
						canHaveThreads: true
					}));

				return {
					...category,
					canHaveThreads: false,
					forums
				};
			});

		// Log what we're returning for debugging
		console.log(
			`[API /forum/structure] Returning ${primaryZones.length} primary zones and ${categories.length} categories`
		);

		// Return the structure in the format expected by useForumStructure
		res.json({
			primaryZones,
			categories
		});
	} catch (error) {
		console.error('Error fetching forum structure:', error);
		res.status(500).json({ error: 'Failed to fetch forum structure' });
	}
});

// Get threads by category ID
router.get('/threads/:categoryId', async (req: Request, res: Response) => {
	try {
		const categoryId = parseInt(req.params.categoryId);
		console.log(`[Forum Routes] Received request for /threads/${categoryId}`);

		if (isNaN(categoryId)) {
			console.log(`[Forum Routes] Invalid category ID received: ${req.params.categoryId}`);
			return res.status(400).json({ message: 'Invalid category ID' });
		}

		const limit = parseInt(req.query.limit as string) || 20;
		const page = parseInt(req.query.page as string) || 1;
		const offset = (page - 1) * limit;

		// Use the regular db instance
		const categoryThreads = await db
			.select({
				id: threads.id,
				title: threads.title,
				slug: threads.slug,
				postCount: threads.postCount,
				viewCount: threads.viewCount,
				hotScore: threads.hotScore,
				createdAt: threads.createdAt,
				lastPostAt: threads.lastPostAt,
				userId: threads.userId,
				username: users.username,
				avatarUrl: users.avatarUrl,
				categoryId: threads.categoryId
			})
			.from(threads)
			.leftJoin(users, eq(threads.userId, users.id))
			.where(eq(threads.categoryId, categoryId))
			.orderBy(desc(threads.lastPostAt))
			.limit(limit)
			.offset(offset);

		if (categoryThreads.length === 0) {
			return res.status(404).json({ message: 'No threads found for this category' });
		}

		// Return the threads
		console.log(
			`[Forum Routes] Returning ${categoryThreads.length} threads for category ID ${categoryId}`
		);
		return res.json(categoryThreads);
	} catch (error) {
		console.error('Error fetching threads by category:', error);
		return res.status(500).json({ message: 'Error fetching threads' });
	}
});

export default router;
