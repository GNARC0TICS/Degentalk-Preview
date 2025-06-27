/**
 * Content Routes
 *
 * Provides unified content feed endpoints for homepage and forum pages
 * Supports trending, recent, and following tabs
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from '@db';
import { threads, posts, users, forumStructure } from '@schema';
import { desc, eq, sql, and, gte } from 'drizzle-orm';
import { logger } from '../../../core/logger';
import { isAuthenticatedOptional } from '../../auth/middleware/auth.middleware';

const router = Router();

interface ContentQuery {
	tab: 'trending' | 'recent' | 'following';
	page?: number;
	limit?: number;
	forumId?: number;
}

router.get('/', isAuthenticatedOptional, async (req: Request, res: Response) => {
	try {
		const {
			tab = 'trending',
			page = 1,
			limit = 20,
			forumId
		} = req.query as unknown as ContentQuery;

		const pageNum = Math.max(1, Number(page) || 1);
		const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
		const offset = (pageNum - 1) * limitNum;

		// Base conditions
		const conditions = [eq(threads.isHidden, false), eq(threads.isDeleted, false)];

		// Add forum filter if specified
		if (forumId) {
			conditions.push(eq(threads.structureId, Number(forumId)));
		}

		// Build query based on tab
		let orderBy;
		switch (tab) {
			case 'trending':
				// Trending: Recent threads with high activity
				const oneDayAgo = new Date();
				oneDayAgo.setDate(oneDayAgo.getDate() - 1);
				conditions.push(gte(threads.lastPostAt, oneDayAgo));
				orderBy = [
					desc(sql`${threads.postCount} * 0.7 + ${threads.viewCount} * 0.3`),
					desc(threads.lastPostAt)
				];
				break;

			case 'recent':
				// Recent: Newest threads first
				orderBy = [desc(threads.createdAt)];
				break;

			case 'following':
				// Following: Threads from followed users (requires auth)
				if (!req.user) {
					return res.json({
						items: [],
						meta: { hasMore: false, total: 0, page: pageNum }
					});
				}
				// TODO: Implement following logic when social system is ready
				orderBy = [desc(threads.lastPostAt)];
				break;

			default:
				orderBy = [desc(threads.createdAt)];
		}

		// Execute query
		const [threadResults, totalCountResult] = await Promise.all([
			db
				.select({
					thread: threads,
					user: users,
					category: forumStructure
				})
				.from(threads)
				.innerJoin(users, eq(threads.userId, users.id))
				.innerJoin(forumStructure, eq(threads.structureId, forumStructure.id))
				.where(and(...conditions))
				.orderBy(...orderBy)
				.limit(limitNum)
				.offset(offset),

			db
				.select({ count: sql<number>`count(*)` })
				.from(threads)
				.where(and(...conditions))
		]);

		const totalCount = Number(totalCountResult[0]?.count || 0);
		const totalPages = Math.ceil(totalCount / limitNum);
		const hasMore = pageNum < totalPages;

		// Format response
		const items = threadResults.map(({ thread, user, category }) => ({
			id: thread.id,
			title: thread.title,
			slug: thread.slug,
			userId: thread.userId,
			prefixId: thread.prefixId,
			isSticky: thread.isSticky,
			isLocked: thread.isLocked,
			isHidden: thread.isHidden,
			viewCount: thread.viewCount,
			postCount: thread.postCount,
			firstPostLikeCount: thread.firstPostLikeCount || 0,
			lastPostAt: thread.lastPostAt?.toISOString() || null,
			createdAt: thread.createdAt.toISOString(),
			updatedAt: thread.updatedAt?.toISOString() || null,
			isSolved: thread.isSolved,
			solvingPostId: thread.solvingPostId,
			user: {
				id: user.id,
				username: user.username,
				avatarUrl: user.avatarUrl,
				activeAvatarUrl: user.activeAvatarUrl || user.avatarUrl,
				role: user.role || 'user'
			},
			category: {
				id: category.id,
				name: category.name,
				slug: category.slug
			},
			tags: [],
			canEdit:
				req.user?.id === thread.userId || req.user?.role === 'admin' || req.user?.role === 'mod',
			canDelete: req.user?.role === 'admin' || req.user?.role === 'mod'
		}));

		res.json({
			items,
			meta: {
				hasMore,
				total: totalCount,
				page: pageNum
			}
		});
	} catch (error) {
		logger.error('ContentRoutes', 'Error fetching content', { error });
		res.status(500).json({ error: 'Failed to fetch content' });
	}
});

export default router;
