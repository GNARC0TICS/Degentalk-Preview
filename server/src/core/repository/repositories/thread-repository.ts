/**
 * Thread Repository Implementation
 *
 * QUALITY IMPROVEMENT: Repository pattern for Thread data access
 * Implements IThreadRepository interface with proper error handling and type safety
 */

import { db } from '@db';
import { threads, posts } from '@schema';
import { eq, desc, asc, ilike, and, sql } from 'drizzle-orm';
import { BaseRepository, RepositoryError, type QueryOptions, type PaginatedResult } from '../base-repository';
import type { IThreadRepository } from '../interfaces';
import type { Thread } from '@schema';
import type { CategoryId, AuthorId, ThreadId, PostId } from '@shared/types/ids';
import { logger } from '@core/logger';

export class ThreadRepository extends BaseRepository<Thread> implements IThreadRepository {
	protected table = threads;
	protected entityName = 'Thread';

	/**
	 * Find thread by slug
	 */
	async findBySlug(slug: string): Promise<Thread | null> {
		try {
			const [result] = await db
				.select()
				.from(threads)
				.where(eq(threads.slug, slug))
				.limit(1);

			return result || null;
		} catch (error) {
			logger.error('ThreadRepository', 'Error in findBySlug', { slug, error });
			throw new RepositoryError('Failed to find thread by slug', 'FIND_BY_SLUG_ERROR', 500, {
				slug,
				originalError: error
			});
		}
	}

	/**
	 * Find threads by category ID with pagination
	 */
	async findByCategoryId(
		categoryId: CategoryId,
		options?: QueryOptions
	): Promise<PaginatedResult<Thread>> {
		try {
			const filters = { ...options?.filters, structureId: categoryId };
			return await this.findPaginated({ ...options, filters });
		} catch (error) {
			logger.error('ThreadRepository', 'Error in findByCategoryId', { categoryId, error });
			throw new RepositoryError('Failed to find threads by category', 'FIND_BY_CATEGORY_ERROR', 500, {
				categoryId,
				originalError: error
			});
		}
	}

	/**
	 * Find threads by author ID with pagination
	 */
	async findByAuthorId(
		authorId: AuthorId,
		options?: QueryOptions
	): Promise<PaginatedResult<Thread>> {
		try {
			const filters = { ...options?.filters, userId: authorId };
			return await this.findPaginated({ ...options, filters });
		} catch (error) {
			logger.error('ThreadRepository', 'Error in findByAuthorId', { authorId, error });
			throw new RepositoryError('Failed to find threads by author', 'FIND_BY_AUTHOR_ERROR', 500, {
				authorId,
				originalError: error
			});
		}
	}

	/**
	 * Search threads by query
	 */
	async searchThreads(query: string, options?: QueryOptions): Promise<PaginatedResult<Thread>> {
		try {
			// Build search conditions
			const searchConditions = [
				ilike(threads.title, `%${query}%`),
				ilike(threads.content, `%${query}%`)
			];

			// Get total count
			const [{ count: total }] = await db
				.select({ count: sql<number>`COUNT(*)` })
				.from(threads)
				.where(and(...searchConditions));

			// Get paginated results
			const page = options?.pagination?.page || 1;
			const limit = Math.min(options?.pagination?.limit || 20, 100);
			const offset = (page - 1) * limit;

			let searchQuery = db
				.select()
				.from(threads)
				.where(and(...searchConditions))
				.limit(limit)
				.offset(offset);

			// Apply sorting
			if (options?.sort && options.sort.length > 0) {
				const orderBy = options.sort.map((sort) => {
					const column = this.getColumnByName(sort.column);
					return sort.direction === 'desc' ? desc(column) : asc(column);
				});
				searchQuery = searchQuery.orderBy(...orderBy);
			} else {
				searchQuery = searchQuery.orderBy(desc(threads.createdAt));
			}

			const data = await searchQuery;
			const totalPages = Math.ceil(total / limit);

			return {
				data: data as Thread[],
				total,
				page,
				limit,
				totalPages,
				hasNext: page < totalPages,
				hasPrev: page > 1
			};
		} catch (error) {
			logger.error('ThreadRepository', 'Error in searchThreads', { query, error });
			throw new RepositoryError('Failed to search threads', 'SEARCH_ERROR', 500, {
				query,
				originalError: error
			});
		}
	}

	/**
	 * Increment thread view count
	 */
	async incrementViewCount(id: ThreadId): Promise<void> {
		try {
			await db
				.update(threads)
				.set({
					viewCount: sql`${threads.viewCount} + 1`,
					updatedAt: new Date()
				})
				.where(eq(threads.id, id));

			logger.debug('ThreadRepository', 'View count incremented', { threadId: id });
		} catch (error) {
			logger.error('ThreadRepository', 'Error in incrementViewCount', { id, error });
			throw new RepositoryError('Failed to increment view count', 'INCREMENT_VIEW_ERROR', 500, {
				threadId: id,
				originalError: error
			});
		}
	}

	/**
	 * Update thread post count
	 */
	async updatePostCount(id: ThreadId): Promise<void> {
		try {
			const [result] = await db
				.select({ count: sql<number>`COUNT(*)` })
				.from(posts)
				.where(eq(posts.threadId, id));

			await db
				.update(threads)
				.set({
					postCount: result.count,
					updatedAt: new Date()
				})
				.where(eq(threads.id, id));

			logger.debug('ThreadRepository', 'Post count updated', { threadId: id, count: result.count });
		} catch (error) {
			logger.error('ThreadRepository', 'Error in updatePostCount', { id, error });
			throw new RepositoryError('Failed to update post count', 'UPDATE_POST_COUNT_ERROR', 500, {
				threadId: id,
				originalError: error
			});
		}
	}

	/**
	 * Mark thread as solved
	 */
	async markAsSolved(id: ThreadId, solvingPostId?: PostId): Promise<Thread> {
		try {
			const updateData: any = {
				isSolved: true,
				updatedAt: new Date()
			};

			if (solvingPostId) {
				updateData.solvingPostId = solvingPostId;
			}

			const [result] = await db
				.update(threads)
				.set(updateData)
				.where(eq(threads.id, id))
				.returning();

			if (!result) {
				throw new RepositoryError('Thread not found', 'NOT_FOUND', 404, { id });
			}

			logger.info('ThreadRepository', 'Thread marked as solved', { threadId: id, solvingPostId });
			return result as Thread;
		} catch (error) {
			if (error instanceof RepositoryError) {
				throw error;
			}

			logger.error('ThreadRepository', 'Error in markAsSolved', { id, error });
			throw new RepositoryError('Failed to mark thread as solved', 'MARK_SOLVED_ERROR', 500, {
				threadId: id,
				originalError: error
			});
		}
	}

	/**
	 * Override prepareCreateData to set thread-specific defaults
	 */
	protected prepareCreateData(data: Partial<Thread>): any {
		return {
			...data,
			viewCount: 0,
			postCount: 0,
			isPinned: false,
			isLocked: false,
			isSolved: false,
			createdAt: new Date(),
			updatedAt: new Date()
		};
	}
}