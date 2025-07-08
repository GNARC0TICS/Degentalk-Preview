/**
 * Forum Routes - Main Router
 *
 * QUALITY IMPROVEMENT: Decomposed god object into focused route modules
 * This file now orchestrates between specialized route handlers
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from '@db';
import { z } from 'zod';
import {
	users,
	threadPrefixes,
	tags,
	forumStructure,
	posts,
	threads,
	users as usersTable
} from '@schema';
import { eq, ilike, asc, gt, inArray, lt, desc, and, sql } from 'drizzle-orm';
import { isAuthenticated as requireAuth } from '../auth/middleware/auth.middleware';
import { logger } from '@server/src/core/logger';
import { forumStructureService } from './services/structure.service';
import { threadService } from './services/thread.service';
import { asyncHandler } from '@server/src/core/errors';
import type { StructureId } from '@shared/types/ids';
import { ForumTransformer } from './transformers/forum.transformer';
import { 
	sendSuccessResponse,
	sendErrorResponse
} from '@server/src/core/utils/transformer.helpers';

// Import specialized route modules
import threadRoutes from './routes/thread.routes';
import postRoutes from './routes/post.routes';
import bookmarkRoutes from './routes/bookmark.routes';
import categoryRoutes from './routes/category.routes';
import contentRoutes from './routes/content.routes';
import rulesRoutes from './rules/rules.routes';
import reportsRoutes from './sub-domains/reports/reports.routes';

const router = Router();

// Mount specialized route modules
router.use('/threads', threadRoutes);
router.use('/posts', postRoutes);
router.use('/bookmarks', bookmarkRoutes);
router.use('/categories', categoryRoutes);
router.use('/content', contentRoutes);
router.use('/rules', rulesRoutes);
router.use('/reports', reportsRoutes);

// ------------------------------------------------------------------
// FLAT FORUM STRUCTURE ENDPOINT  ✨
//
// Returns `{ zones, forums }` without any deprecated "categories" path so
// the client can call `/api/forum/structure` directly.
// ------------------------------------------------------------------

router.get(
	'/structure',
	asyncHandler(async (req: Request, res: Response) => {
		try {
			const structures = await forumStructureService.getStructuresWithStats();
			const zones = structures.filter((s) => s.type === 'zone');
			const forums = structures.filter((s) => s.type === 'forum');
			return sendSuccessResponse(res, {
				zones: zones.map(z => ForumTransformer.toPublicForumStructure(z)), 
				forums: forums.map(f => ForumTransformer.toPublicForumStructure(f)) 
			});
		} catch (error) {
			logger.error('ForumRoutes', 'Error in GET /structure', { error });
			return sendErrorResponse(res, 'Failed to fetch forum structure', 500);
		}
	})
);

// Validation schemas for remaining endpoints
const userSearchSchema = z.object({
	q: z.string().min(1).max(50)
});

// User search endpoint (used by mention system)
router.get(
	'/users/search',
	asyncHandler(async (req: Request, res: Response) => {
		try {
			const validatedQuery = userSearchSchema.parse(req.query);
			const searchTerm = validatedQuery.q;

			const users_results = await db
				.select({
					id: users.id,
					username: users.username,
					avatar: users.avatarUrl
					// Note: Removed role field since it's in roles table via primaryRoleId
				})
				.from(users)
				.where(ilike(users.username, `%${searchTerm}%`))
				.limit(10)
				.orderBy(asc(users.username));

			sendSuccessResponse(res, users_results.map(user => ({
				id: user.id,
				username: user.username,
				avatar: user.avatar
			})));
		} catch (error) {
			logger.error('ForumRoutes', 'Error in GET /users/search', { error });

			if (error instanceof z.ZodError) {
				return sendErrorResponse(res, 'Invalid search query', 400);
			}

			return sendErrorResponse(res, 'Failed to search users', 500);
		}
	})
);

// Get thread prefixes
router.get(
	'/prefixes',
	asyncHandler(async (req: Request, res: Response) => {
		try {
			const forumId = req.query.forumId ? (req.query.forumId as string) : undefined;

			let prefixes;
			if (forumId) {
				prefixes = await db
					.select()
					.from(threadPrefixes)
					.where(eq(threadPrefixes.isActive, true))
					.orderBy(asc(threadPrefixes.position));
			} else {
				prefixes = await db
					.select()
					.from(threadPrefixes)
					.where(eq(threadPrefixes.isActive, true))
					.orderBy(asc(threadPrefixes.position));
			}

			sendSuccessResponse(res, prefixes);
		} catch (error) {
			logger.error('ForumRoutes', 'Error in GET /prefixes', { error });
			return sendErrorResponse(res, 'Failed to fetch prefixes', 500);
		}
	})
);

// Get tags
router.get(
	'/tags',
	asyncHandler(async (req: Request, res: Response) => {
		try {
			const allTags = await db.select().from(tags).orderBy(asc(tags.name));

			sendSuccessResponse(res, allTags);
		} catch (error) {
			logger.error('ForumRoutes', 'Error in GET /tags', { error });
			return sendErrorResponse(res, 'Failed to fetch tags', 500);
		}
	})
);

// Health check endpoint
router.get(
	'/health',
	asyncHandler((req: Request, res: Response) => {
		sendSuccessResponse(res, {
			message: 'Forum API is healthy',
			timestamp: new Date().toISOString()
		});
	})
);

// ------------------------------------------------------------------
// LIST THREADS BY FORUM ID (flat model)
// ------------------------------------------------------------------

router.get(
	'/forums/:id/threads',
	asyncHandler(async (req: Request, res: Response) => {
		try {
			const forumId = req.params.id as StructureId;
			const page = parseInt(req.query.page as string) || 1;
			const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
			const sortBy = (req.query.sort as string) || 'newest';
			const search = req.query.search as string;

			const result = await threadService.searchThreads({
				structureId: forumId,
				page,
				limit,
				sortBy: sortBy as any,
				search
			});

			// Transform threads using ForumTransformer
			const transformedThreads = result.threads.map(thread => 
				ForumTransformer.toPublicThread(thread)
			);

			return sendSuccessResponse(res, {
				...result,
				threads: transformedThreads,
				pagination: {
					page,
					limit,
					total: result.total,
					totalPages: result.totalPages
				}
			});
		} catch (error) {
			logger.error('ForumRoutes', 'Error in GET /forums/:id/threads', { error });
			return sendErrorResponse(res, 'Failed to fetch threads', 500);
		}
	})
);

// -------------------------------------------------------------
//  Zone Stats Endpoint – returns today\'s post count, trending threads,
//  last active user and creation date for momentum math.
//  GET /api/forum/zone-stats?slug=<zoneSlug>
// -------------------------------------------------------------

router.get(
	'/zone-stats',
	asyncHandler(async (req: Request, res: Response) => {
		try {
			const slug = (req.query.slug as string) ?? '';
			if (!slug) {
				return sendErrorResponse(res, 'Missing slug query param', 400);
			}

			// Fetch the zone node
			const [zone] = await db
				.select()
				.from(forumStructure)
				.where(eq(forumStructure.slug, slug))
				.limit(1);
			if (!zone || zone.type !== 'zone') {
				return sendErrorResponse(res, 'Zone not found', 404);
			}

			// Find forums under this zone
			const forumRows = await db
				.select({ id: forumStructure.id })
				.from(forumStructure)
				.where(eq(forumStructure.parentId, zone.id));

			const forumIds = forumRows.map((f) => f.id);
			if (forumIds.length === 0) {
				return sendSuccessResponse(res, {
					todaysPosts: 0,
					trendingThreads: 0,
					lastActiveUser: null,
					createdAt: zone.createdAt
				});
			}

			const todayStart = new Date();
			todayStart.setUTCHours(0, 0, 0, 0);

			// Count today\'s posts
			const [{ count: todaysPosts }] = await db
				.select({ count: sql<number>`count(*)` })
				.from(posts)
				.innerJoin(threads, eq(posts.threadId, threads.id))
				.where(and(inArray(threads.structureId, forumIds), gt(posts.createdAt, todayStart)));

			// Trending threads = threads with most posts in last 24h (top 3)
			const trending = await db
				.select({ id: threads.id })
				.from(threads)
				.where(and(inArray(threads.structureId, forumIds), gt(threads.createdAt, todayStart)))
				.orderBy(desc(threads.postCount))
				.limit(3);

			const trendingThreads = trending.length;

			// Last active user = author of most recent post today
			const [lastPost] = await db
				.select({ userId: posts.userId })
				.from(posts)
				.innerJoin(threads, eq(posts.threadId, threads.id))
				.where(inArray(threads.structureId, forumIds))
				.orderBy(desc(posts.createdAt))
				.limit(1);

			let lastActiveUser = null;
			if (lastPost) {
				const [u] = await db
					.select({ username: usersTable.username, avatarUrl: usersTable.avatarUrl })
					.from(usersTable)
					.where(eq(usersTable.id, lastPost.userId))
					.limit(1);
				if (u) lastActiveUser = { username: u.username, avatarUrl: u.avatarUrl };
			}

			return sendSuccessResponse(res, { todaysPosts, trendingThreads, lastActiveUser, createdAt: zone.createdAt });
		} catch (error) {
			logger.error('ForumRoutes', 'Error in GET /zone-stats', { error });
			return sendErrorResponse(res, 'Failed to fetch zone stats', 500);
		}
	})
);

export default router;
