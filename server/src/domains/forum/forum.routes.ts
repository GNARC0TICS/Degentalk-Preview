/**
 * Forum Routes - Main Router
 *
 * QUALITY IMPROVEMENT: Decomposed god object into focused route modules
 * This file now orchestrates between specialized route handlers
 */

import { Router } from 'express'
import type { Router as RouterType } from 'express';
import type { Request, Response } from 'express';
import { db } from '@degentalk/db';
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
import { isAuthenticated as requireAuth } from '@domains/auth/middleware/auth.middleware';
import { logger } from '@core/logger';
import { forumStructureService } from './services/structure.service';
import { threadService } from './services/thread.service';
import { asyncHandler } from '@core/errors';
import type { StructureId } from '@shared/types/ids';
import { ForumTransformer } from './transformers/forum.transformer';
import { sendSuccess, errorResponses } from '@utils/api-responses';

// Import specialized route modules
import threadRoutes from './routes/thread.routes';
import postRoutes from './routes/post.routes';
import bookmarkRoutes from './routes/bookmark.routes';
import categoryRoutes from './routes/category.routes';
import contentRoutes from './routes/content.routes';
import rulesRoutes from './rules/rules.routes';
import reportsRoutes from './sub-domains/reports/reports.routes';
import structureRoutes from './routes/structure.routes';
import userSearchRoutes from './routes/user-search.routes';
import prefixesRoutes from './routes/prefixes.routes';
import tagsRoutes from './routes/tags.routes';

const router: RouterType = Router();

// Mount specialized route modules
router.use('/threads', threadRoutes);
router.use('/posts', postRoutes);
router.use('/bookmarks', bookmarkRoutes);
router.use('/categories', categoryRoutes);
router.use('/content', contentRoutes);
router.use('/rules', rulesRoutes);
router.use('/reports', reportsRoutes);
router.use('/structure', structureRoutes);
router.use('/users/search', userSearchRoutes);
router.use('/prefixes', prefixesRoutes);
router.use('/tags', tagsRoutes);

// ------------------------------------------------------------------
// FLAT FORUM STRUCTURE ENDPOINT  ✨
//
// Returns `{ zones, forums }` without any deprecated "categories" path so
// the client can call `/api/forum/structure` directly.
// ------------------------------------------------------------------

// Validation schemas for remaining endpoints

// User search endpoint (used by mention system)

// Get thread prefixes

// Get tags

// Active members endpoint - get currently active forum members
router.get(
	'/active-members',
	asyncHandler(async (req: Request, res: Response) => {
		try {
			// Get recently active users (within last 15 minutes)
			const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
			
			const activeMembers = await db
				.select({
					id: users.id,
					username: users.username,
					displayName: users.displayName,
					avatarUrl: users.avatarUrl,
					lastSeenAt: users.lastSeenAt,
					isOnline: users.isOnline
				})
				.from(users)
				.where(
					and(
						gt(users.lastSeenAt, fifteenMinutesAgo),
						eq(users.isOnline, true)
					)
				)
				.orderBy(desc(users.lastSeenAt))
				.limit(20);

			sendSuccess(res, activeMembers);
		} catch (error) {
			logger.error('Forum', 'Error fetching active members', { error });
			errorResponses.internalError(res, 'Failed to fetch active members');
		}
	})
);

// Featured forum stats endpoint - get statistics for featured forums
router.get(
	'/featured-forum-stats',
	asyncHandler(async (req: Request, res: Response) => {
		try {
			// Get featured forums with their stats
			const featuredForums = await db
				.select({
					id: forumStructure.id,
					name: forumStructure.name,
					slug: forumStructure.slug,
					threadCount: forumStructure.threadCount,
					postCount: forumStructure.postCount,
					lastPostAt: forumStructure.lastPostAt,
					isFeatured: forumStructure.isFeatured,
					themePreset: forumStructure.themePreset
				})
				.from(forumStructure)
				.where(eq(forumStructure.isFeatured, true))
				.orderBy(asc(forumStructure.position));

			sendSuccess(res, featuredForums);
		} catch (error) {
			logger.error('Forum', 'Error fetching featured forum stats', { error });
			errorResponses.internalError(res, 'Failed to fetch featured forum stats');
		}
	})
);

// Health check endpoint
router.get(
	'/health',
	asyncHandler((req: Request, res: Response) => {
		sendSuccess(res, {
			message: 'Forum API is healthy',
			timestamp: new Date().toISOString()
		});
	})
);

// -------------------------------------------------------------
//  Zone Stats Endpoint – returns today\'s post count, trending threads,
//  last active user and creation date for momentum math.
//  GET /api/forum/zone-stats?slug=<zoneSlug>
// -------------------------------------------------------------

export default router;
