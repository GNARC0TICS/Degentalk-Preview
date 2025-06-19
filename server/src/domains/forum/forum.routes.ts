/**
 * Forum Routes
 *
 * Defines API routes for forum functionality including threads, posts,
 * categories, and related operations.
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from '@db';
import { z } from 'zod';
import {
	posts,
	threads,
	postReactions,
	reactionTypeEnum,
	transactions,
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
	isNull,
	like,
	SQL
} from 'drizzle-orm';
import { awardPathXp } from '@server/utils/path-utils';
import { xpRewards } from '@shared/path-config';
import { xpCloutService } from '../../../services/xp-clout-service';
import {
	isAuthenticated as requireAuth,
	isAdmin,
	isAdminOrModerator
} from '../auth/middleware/auth.middleware';
import type { ThreadWithUserAndCategory, PostWithUser } from '../../../../db/types/forum.types.ts';
import { slugify } from '@server/utils/slugify';
import { XpLevelService, xpLevelService, XP_ACTIONS } from '../../../services/xp-level-service';
import rulesRoutes from './rules/rules.routes';
import { forumController } from './forum.controller';
import { forumService } from './forum.service';
import { getUserIdFromRequest } from '@server/src/utils/auth'; // Import the centralized function
import { logger } from '@server/src/core/logger';

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

// Helper function to check user permissions (simplified)
async function getUserPermissions(userId: number | undefined) {
	if (!userId) return { isMod: false, isAdmin: false };
	const [userRecord] = await db.select().from(users).where(eq(users.id, userId));
	if (!userRecord) return { isMod: false, isAdmin: false };
	const { canUser } = await import('../../../../lib/auth/canUser.ts');
	const isAdmin = await canUser(userRecord as any, 'canViewAdminPanel');
	const isMod = isAdmin || (await canUser(userRecord as any, 'canModerateThreads'));
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

// --- FORUM STRUCTURE ---

// GET /structure - Get the complete forum structure (zones, categories, forums)
router.get('/structure', async (req: Request, res: Response) => {
	try {
		const { zones: structuredZones } = await forumService.getForumStructure();

		function sanitize(entity: any) {
			const allowedKeys = [
				'id',
				'slug',
				'name',
				'description',
				'parentId',
				'type',
				'position',
				'isVip',
				'isLocked',
				'isHidden',
				'minXp',
				'minGroupIdRequired',
				'color',
				'icon',
				'colorTheme',
				'tippingEnabled',
				'xpMultiplier',
				'threadCount',
				'postCount',
				'pluginData',
				'createdAt',
				'updatedAt'
			] as const;
			const sanitized: Record<string, unknown> = {};
			for (const k of allowedKeys) {
				if (k in entity) sanitized[k] = entity[k];
			}
			return sanitized;
		}

		const sanitizedZones = structuredZones.map(sanitize);

		const flatForums: any[] = [];
		for (const z of structuredZones) {
			for (const pf of (z as any).forums || []) {
				flatForums.push(sanitize(pf));
				if (pf.childForums && pf.childForums.length > 0) {
					flatForums.push(...pf.childForums.map(sanitize));
				}
			}
		}

		return res.json({ zones: sanitizedZones, forums: flatForums });
	} catch (error) {
		logger.error('ForumRoutes', 'Error fetching forum structure', { err: error });
		return res.status(500).json({ error: 'Failed to fetch forum structure' });
	}
});

// GET /categories - Get all forum categories with stats
router.get('/categories', async (req: Request, res: Response) => {
	try {
		const categories = await forumService.getCategoriesWithStats();
		res.json(categories);
	} catch (error) {
		logger.error('ForumRoutes', 'Error fetching categories', {
			err: error,
			message: error instanceof Error ? error.message : 'Unknown error',
			stack: error instanceof Error ? error.stack : undefined
		});
		console.error('Forum categories error:', error); // Add console log for immediate visibility
		res.status(500).json({
			message: 'An error occurred fetching categories',
			error:
				process.env.NODE_ENV === 'development'
					? error instanceof Error
						? error.message
						: String(error)
					: undefined
		});
	}
});

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

		const userId = getUserIdFromRequest(req); // Get current user ID if logged in
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
			const threadListRaw = await db
				.select({
					// Select specific fields to avoid over-fetching
					id: threads.id,
					title: threads.title,
					slug: threads.slug,
					parentForumSlug: forumCategories.slug,
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
			logger.error('ForumRoutes', 'Error in threads query', { err: error, query: req.query });
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
		logger.error('ForumRoutes', 'Error fetching threads', { err: error, query: req.query });
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

		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 50;
		const currentUserId = getUserIdFromRequest(req); // Can be undefined if not logged in

		const result = await forumService.getThreadDetails(threadId, page, limit, currentUserId);

		if (!result) {
			return res.status(404).json({ message: 'Thread not found' });
		}

		// Perform visibility checks after fetching data
		const { isMod, isAdmin } = await getUserPermissions(currentUserId);
		if (result.thread.isHidden && !(isMod || isAdmin)) {
			return res.status(403).json({ message: 'You do not have permission to view this thread' });
		}
		// TODO: Add checks for category visibility permissions if applicable (VIP, group restrictions)
		// This might involve checking result.thread.category properties

		res.json(result);
	} catch (error) {
		logger.error('ForumRoutes', 'Error fetching thread by ID', {
			err: error,
			threadId: req.params.id
		});
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

		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 50;
		const currentUserId = getUserIdFromRequest(req); // Can be undefined

		const result = await forumService.getThreadDetails(threadSlug, page, limit, currentUserId);

		if (!result) {
			return res.status(404).json({ message: 'Thread not found' });
		}

		// Perform visibility checks
		const { isMod, isAdmin } = await getUserPermissions(currentUserId);
		if (result.thread.isHidden && !(isMod || isAdmin)) {
			return res.status(403).json({ message: 'You do not have permission to view this thread' });
		}
		// TODO: Add checks for category visibility permissions

		res.json(result);
	} catch (error) {
		logger.error('ForumRoutes', 'Error fetching thread by slug', {
			err: error,
			slug: req.params.slug
		});
		res.status(500).json({ message: 'An error occurred fetching the thread by slug' });
	}
});
// POST /threads - Create a new thread directly (not from draft)
router.post('/threads', requireAuth, async (req: Request, res: Response) => {
	// Changed isAuthenticated to requireAuth
	try {
		const userId = getUserIdFromRequest(req);
		if (userId === undefined) {
			return res.status(401).json({ message: 'User ID not found, authentication required.' });
		}

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
				logger.error('ForumRoutes', 'Error awarding XP for new thread/post', {
					err: xpError,
					userId
				});
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
		logger.error('ForumRoutes', 'Error creating thread', {
			err: error,
			body: req.body,
			userId: getUserIdFromRequest(req)
		});
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
		const currentUserId = getUserIdFromRequest(req);

		if (currentUserId === undefined) {
			return res.status(401).json({ message: 'User ID not found, authentication required.' });
		}
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
		logger.error('ForumRoutes', 'Error in PUT /threads/:threadId/solve route', {
			err: error,
			threadId: req.params.threadId,
			body: req.body
		});
		next(error); // Pass to error handler
	}
});

// POST /threads/:threadId/tags - Add a tag to a thread
router.post('/threads/:threadId/tags', requireAuth, async (req: Request, res: Response) => {
	// Changed isAuthenticated to requireAuth
	try {
		const threadId = parseInt(req.params.threadId);
		const userId = getUserIdFromRequest(req);

		if (userId === undefined) {
			return res.status(401).json({ message: 'User ID not found, authentication required.' });
		}
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
		logger.error('ForumRoutes', 'Error adding tag to thread', {
			err: error,
			threadId: req.params.threadId,
			body: req.body
		});
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
			const userId = getUserIdFromRequest(req);

			if (userId === undefined) {
				return res.status(401).json({ message: 'User ID not found, authentication required.' });
			}
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
			logger.error('ForumRoutes', 'Error removing tag from thread', {
				err: error,
				threadId: req.params.threadId,
				tagId: req.params.tagId
			});
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
		logger.error('ForumRoutes', 'Error fetching thread tags', {
			err: error,
			threadId: req.params.threadId
		});
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
		const userId = getUserIdFromRequest(req);

		if (userId === undefined) {
			return res.status(401).json({ message: 'User ID not found, authentication required.' });
		}
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
		logger.error('ForumRoutes', 'Error handling post reaction', {
			err: error,
			postId: req.params.postId,
			body: req.body
		});
		return res.status(500).json({ error: 'Internal server error' });
	}
});

// Bookmark a thread
router.post('/bookmarks', requireAuth, async (req, res) => {
	try {
		const { threadId } = req.body;
		const userId = getUserIdFromRequest(req);

		if (userId === undefined) {
			return res.status(401).json({ message: 'User ID not found, authentication required.' });
		}
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
		logger.error('ForumRoutes', 'Error bookmarking thread', {
			err: error,
			threadId: req.body.threadId,
			userId: getUserIdFromRequest(req)
		});
		return res.status(500).json({ error: 'Internal server error' });
	}
});

// Remove a thread bookmark
router.delete('/bookmarks/:threadId', requireAuth, async (req, res) => {
	try {
		const threadId = parseInt(req.params.threadId);
		const userId = getUserIdFromRequest(req);

		if (userId === undefined) {
			return res.status(401).json({ message: 'User ID not found, authentication required.' });
		}
		await db
			.delete(userThreadBookmarks)
			.where(
				and(eq(userThreadBookmarks.threadId, threadId), eq(userThreadBookmarks.userId, userId))
			);

		return res.status(200).json({ success: true });
	} catch (error) {
		logger.error('ForumRoutes', 'Error removing bookmark', {
			err: error,
			threadId: req.params.threadId,
			userId: getUserIdFromRequest(req)
		});
		return res.status(500).json({ error: 'Internal server error' });
	}
});

// Mark thread as solved
router.post('/threads/:threadId/solve', requireAuth, async (req, res) => {
	try {
		const threadId = parseInt(req.params.threadId);
		const { postId } = req.body;
		const userId = getUserIdFromRequest(req);

		if (userId === undefined) {
			return res.status(401).json({ message: 'User ID not found, authentication required.' });
		}
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
		logger.error('ForumRoutes', 'Error marking thread as solved', {
			err: error,
			threadId: req.params.threadId,
			postId: req.body.postId
		});
		return res.status(500).json({ error: 'Internal server error' });
	}
});

// Unmark thread as solved
router.post('/threads/:threadId/unsolve', requireAuth, async (req, res) => {
	try {
		const threadId = parseInt(req.params.threadId);
		const userId = getUserIdFromRequest(req);

		if (userId === undefined) {
			return res.status(401).json({ message: 'User ID not found, authentication required.' });
		}
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
		logger.error('ForumRoutes', 'Error unmarking thread as solved', {
			err: error,
			threadId: req.params.threadId
		});
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

		const userId = getUserIdFromRequest(req);
		// It's okay if userId is undefined here for getUserPermissions,
		// but if it's strictly required for editing, an earlier check might be needed.
		// For now, assume getUserPermissions handles undefined userId.
		// If an edit absolutely requires a logged-in user, the requireAuth middleware should handle it.
		// If userId is needed for the .set({ editedBy: userId }), then a check is vital.
		if (userId === undefined) {
			// Added check for editing
			return res
				.status(401)
				.json({ message: 'User ID not found, authentication required for editing.' });
		}
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
		logger.error('ForumRoutes', 'Error updating post', {
			err: error,
			postId: req.params.id,
			body: req.body
		});
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
		logger.error('ForumRoutes', 'Error searching users', { err: error, query: req.query.query });
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
				parentForumSlug: forumCategories.slug,
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
		logger.error('ForumRoutes', 'Error fetching hot threads', {
			err: error,
			limit: req.query.limit
		});
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
	logger.debug('ForumRoutes', `Received request for /forums/${slug}/topics`, { slug });
	try {
		// Call the controller function
		await forumController.getForumBySlugWithTopics(req, res);
		// Note: The controller handles sending the response, so no need to log result here
	} catch (error) {
		logger.error('ForumRoutes', `Error in /forums/${slug}/topics route:`, { err: error, slug });
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

		logger.debug('ForumRoutes', '/forums-by-parent called', { parentId });

		if (!parentId || isNaN(parentId)) {
			logger.warn('ForumRoutes', 'Invalid parentId parameter for /forums-by-parent', {
				providedValue: req.query.parentId,
				parsed: parentId
			});
			return res.status(400).json({
				message: 'Valid parent ID is required',
				debug: {
					providedValue: req.query.parentId,
					parsed: parentId
				}
			});
		}

		const categories = await forumService.getCategoriesWithStats();
		logger.debug(
			'ForumRoutes',
			`Total categories found for /forums-by-parent: ${categories.length}`,
			{ parentId }
		);

		const parentForum = categories.find((cat) => cat.id === parentId);
		logger.debug(
			'ForumRoutes',
			`Parent forum for /forums-by-parent: ${parentForum ? parentForum.name : 'Not found'}`,
			{ parentId, parentForumName: parentForum?.name }
		);

		const childForums = categories.filter((cat) => cat.parentId === parentId);
		logger.debug('ForumRoutes', `Child forums found for /forums-by-parent: ${childForums.length}`, {
			parentId,
			childCount: childForums.length
		});

		if (childForums.length === 0) {
			logger.debug('ForumRoutes', 'No child forums found for parentId for /forums-by-parent', {
				parentId
			});
		} else {
			logger.debug('ForumRoutes', 'Child forum names for /forums-by-parent', {
				parentId,
				childNames: childForums.map((f) => f.name)
			});
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
		logger.error('ForumRoutes', 'Error in debug /forums-by-parent', {
			err: error,
			parentId: req.query.parentId
		});
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
		logger.error('ForumRoutes', 'Debug structure error', { err: error });
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
		logger.error('ForumRoutes', 'Debug forum relationships error', { err: error });
		res.status(500).json({
			error: 'Failed to fetch forum relationships',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
});

// Get threads by category ID
router.get('/threads/:categoryId', async (req: Request, res: Response) => {
	return res.status(410).json({
		message: 'Endpoint deprecated: use /forums/:slug/threads instead of /threads/:categoryId',
		migrationGuide: 'Replace categoryId with forum slug as per forumMap.config.ts'
	});
});

// NEW: List threads within a leaf forum by slug (config-first enforcement)
// GET /forums/:forumSlug/threads
router.get('/forums/:forumSlug/threads', async (req: Request, res: Response) => {
	const { forumSlug } = req.params;

	if (!forumSlug) {
		return res.status(400).json({ message: 'Forum slug is required' });
	}

	try {
		const threadsInForum = await forumService.getThreadsInForum(forumSlug);
		return res.status(200).json({ threads: threadsInForum });
	} catch (error) {
		logger.error('ForumRoutes', 'Error fetching threads by forum slug', { err: error, forumSlug });
		return res
			.status(400)
			.json({ message: error instanceof Error ? error.message : 'Failed to fetch threads' });
	}
});

export default router;
