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
import { users, threadPrefixes, tags } from '@schema';
import { eq, ilike, asc } from 'drizzle-orm';
import { isAuthenticated as requireAuth } from '../auth/middleware/auth.middleware';
import { logger } from '@server/src/core/logger';
import { forumStructureService } from './services/structure.service';

// Import specialized route modules
import threadRoutes from './routes/thread.routes';
import postRoutes from './routes/post.routes';
import bookmarkRoutes from './routes/bookmark.routes';
import categoryRoutes from './routes/category.routes';
import rulesRoutes from './rules/rules.routes';
import reportsRoutes from './sub-domains/reports/reports.routes';

const router = Router();

// Mount specialized route modules
router.use('/threads', threadRoutes);
router.use('/posts', postRoutes);
router.use('/bookmarks', bookmarkRoutes);
router.use('/categories', categoryRoutes);
router.use('/rules', rulesRoutes);
router.use('/reports', reportsRoutes);

// ------------------------------------------------------------------
// FLAT FORUM STRUCTURE ENDPOINT  ✨
//
// Returns `{ zones, forums }` without any deprecated "categories" path so
// the client can call `/api/forum/structure` directly.
// ------------------------------------------------------------------

router.get('/structure', async (req: Request, res: Response) => {
	try {
		const structures = await forumStructureService.getStructuresWithStats();
		const zones = structures.filter((s) => s.type === 'zone');
		const forums = structures.filter((s) => s.type === 'forum');
		return res.json({ zones, forums });
	} catch (error) {
		logger.error('ForumRoutes', 'Error in GET /structure', { error });
		return res.status(500).json({
			success: false,
			error: 'Failed to fetch forum structure'
		});
	}
});

// Validation schemas for remaining endpoints
const userSearchSchema = z.object({
	q: z.string().min(1).max(50)
});

// User search endpoint (used by mention system)
router.get('/users/search', async (req: Request, res: Response) => {
	try {
		const validatedQuery = userSearchSchema.parse(req.query);
		const searchTerm = validatedQuery.q;

		const users_results = await db
			.select({
				id: users.id,
				username: users.username,
				avatar: users.avatar,
				role: users.role
			})
			.from(users)
			.where(ilike(users.username, `%${searchTerm}%`))
			.limit(10)
			.orderBy(asc(users.username));

		res.json({
			success: true,
			data: users_results
		});
	} catch (error) {
		logger.error('ForumRoutes', 'Error in GET /users/search', { error });

		if (error instanceof z.ZodError) {
			return res.status(400).json({
				success: false,
				error: 'Invalid search query',
				details: error.errors
			});
		}

		res.status(500).json({
			success: false,
			error: 'Failed to search users'
		});
	}
});

// Get thread prefixes
router.get('/prefixes', async (req: Request, res: Response) => {
	try {
		const forumId = req.query.forumId ? parseInt(req.query.forumId as string) : undefined;

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

		res.json({
			success: true,
			data: prefixes
		});
	} catch (error) {
		logger.error('ForumRoutes', 'Error in GET /prefixes', { error });
		res.status(500).json({
			success: false,
			error: 'Failed to fetch prefixes'
		});
	}
});

// Get tags
router.get('/tags', async (req: Request, res: Response) => {
	try {
		const allTags = await db.select().from(tags).orderBy(asc(tags.name));

		res.json({
			success: true,
			data: allTags
		});
	} catch (error) {
		logger.error('ForumRoutes', 'Error in GET /tags', { error });
		res.status(500).json({
			success: false,
			error: 'Failed to fetch tags'
		});
	}
});

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
	res.json({
		success: true,
		message: 'Forum API is healthy',
		timestamp: new Date().toISOString()
	});
});

// ------------------------------------------------------------------
// LIST THREADS BY FORUM ID (flat model)
// ------------------------------------------------------------------

router.get('/forums/:id/threads', async (req: Request, res: Response) => {
	try {
		const forumId = parseInt(req.params.id);
		const page = parseInt(req.query.page as string) || 1;
		const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
		const sortBy = (req.query.sort as string) || 'newest';
		const search = req.query.search as string;

		const result = await threadService.searchThreads({
			categoryId: forumId, // threadService still uses categoryId internally
			page,
			limit,
			sortBy: sortBy as any,
			search
		});

		return res.json({
			success: true,
			data: result,
			pagination: {
				page,
				limit,
				total: result.total,
				totalPages: result.totalPages
			}
		});
	} catch (error) {
		logger.error('ForumRoutes', 'Error in GET /forums/:id/threads', { error });
		return res.status(500).json({
			success: false,
			error: 'Failed to fetch threads'
		});
	}
});

export default router;
