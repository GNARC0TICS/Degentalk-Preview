/**
 * Forum Routes - Main Router
 *
 * QUALITY IMPROVEMENT: Decomposed god object into focused route modules
 * This file now orchestrates between specialized route handlers
 */

import { Router } from 'express'
import type { Router as RouterType } from 'express';
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
import { isAuthenticated as requireAuth } from '@server/domains/auth/middleware/auth.middleware';
import { logger } from '@core/logger';
import { forumStructureService } from './services/structure.service';
import { threadService } from './services/thread.service';
import { asyncHandler } from '@core/errors';
import type { StructureId } from '@shared/types/ids';
import { ForumTransformer } from './transformers/forum.transformer';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';

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

// -------------------------------------------------------------
//  Zone Stats Endpoint – returns today\'s post count, trending threads,
//  last active user and creation date for momentum math.
//  GET /api/forum/zone-stats?slug=<zoneSlug>
// -------------------------------------------------------------

export default router;
