import { userService } from '@core/services/user.service';
import type { Request, Response } from 'express';
import { forumService } from './forum.service';
import type { ThreadSearchParams } from './forum.service';
import { logger } from '@core/logger';
import type { StructureId, ThreadId } from '@shared/types/ids';
import { ForumTransformer } from '@domains/forum/transformers/forum.transformer';
import {
	toPublicList,
	sendSuccessResponse,
	sendErrorResponse
} from '@core/utils/transformer.helpers';
// import { isAuthenticated } from '@api/src/domains/auth/middleware/auth.middleware"; // Removed as unused

// TODO: @syncSchema threads
// TODO: @syncSchema posts
// TODO: @syncSchema content_visibility_status_enum

export const forumController = {
	// Get all categories with forum statistics
	async getCategoriesWithStats(req: Request, res: Response) {
		try {
			const categories = await forumService.getCategoriesWithStats();
			res.status(200);
			return sendSuccessResponse(
				res,
				toPublicList(categories, ForumTransformer.toPublicForumStructure)
			);
		} catch (error) {
			logger.error('ForumController', 'Error fetching forum categories', { err: error });
			return sendErrorResponse(res, 'Failed to fetch forum categories', 500);
		}
	},

	// Get hierarchical category tree
	async getCategoriesTree(req: Request, res: Response) {
		try {
			const includeHidden = req.query.includeHidden === 'true';
			const includeEmptyStats = req.query.includeEmptyStats === 'true';

			// Admin can see hidden categories
			const isAdmin =
				userService.getUserFromRequest(req) &&
				(userService.getUserFromRequest(req) as any).role === 'admin';

			const categories = await forumService.getCategoriesTree({
				includeHidden: isAdmin || includeHidden,
				includeEmptyStats
			});

			res.status(200);
			return sendSuccessResponse(
				res,
				toPublicList(categories, ForumTransformer.toPublicForumStructure)
			);
		} catch (error) {
			logger.error('ForumController', 'Error fetching forum category tree', {
				err: error,
				query: req.query
			});
			return sendErrorResponse(res, 'Failed to fetch forum category tree', 500);
		}
	},

	// Get a specific category by slug
	async getCategoryBySlug(req: Request, res: Response) {
		try {
			const { slug } = req.params;

			if (!slug) {
				return sendErrorResponse(res, 'Category slug is required', 400);
			}

			const category = await forumService.getCategoryBySlug(slug);

			if (!category) {
				return sendErrorResponse(res, 'Category not found', 404);
			}

			res.status(200);
			return sendSuccessResponse(res, ForumTransformer.toPublicForumStructure(category));
		} catch (error) {
			logger.error('ForumController', 'Error fetching category by slug', {
				err: error,
				slug: req.params.slug
			});
			return sendErrorResponse(res, 'Failed to fetch category', 500);
		}
	},

	// Get a forum and its child topics by forum slug
	async getForumBySlugWithTopics(req: Request, res: Response) {
		try {
			const { slug } = req.params;

			if (!slug) {
				return sendErrorResponse(res, 'Forum slug is required', 400);
			}

			const result = await forumService.getForumBySlugWithTopics(slug);

			if (!result.forum) {
				return sendErrorResponse(res, 'Forum not found', 404);
			}

			// Transform forum and threads separately
			const transformedResult = {
				forum: ForumTransformer.toPublicForumStructure(result.forum),
				threads: result.threads ? toPublicList(result.threads, ForumTransformer.toPublicThread) : []
			};

			res.status(200);
			return sendSuccessResponse(res, transformedResult);
		} catch (error) {
			logger.error('ForumController', 'Error fetching forum with topics by slug', {
				err: error,
				slug: req.params.slug
			});
			return sendErrorResponse(res, 'Failed to fetch forum with topics', 500);
		}
	},

	// Get a specific category by ID
	async getCategoryById(req: Request, res: Response) {
		try {
			const { id } = req.params;

			if (!id) {
				return sendErrorResponse(res, 'Valid category ID is required', 400);
			}

			const category = await forumService.getCategoryById(id as StructureId);

			if (!category) {
				return sendErrorResponse(res, 'Category not found', 404);
			}

			res.status(200);
			return sendSuccessResponse(res, ForumTransformer.toPublicForumStructure(category));
		} catch (error) {
			logger.error('ForumController', 'Error fetching category by ID', {
				err: error,
				categoryId: req.params.id
			});
			return sendErrorResponse(res, 'Failed to fetch category', 500);
		}
	},

	// Get all thread prefixes
	async getPrefixes(req: Request, res: Response) {
		try {
			const categoryId = req.query.categoryId ? (req.query.categoryId as StructureId) : undefined;

			const prefixes = await forumService.getPrefixes(categoryId);
			res.status(200);
			return sendSuccessResponse(res, prefixes);
		} catch (error) {
			logger.error('ForumController', 'Error fetching thread prefixes', {
				err: error,
				categoryId: req.query.categoryId
			});
			return sendErrorResponse(res, 'Failed to fetch thread prefixes', 500);
		}
	},

	// Get all tags
	async getTags(req: Request, res: Response) {
		try {
			const tags = await forumService.getTags();
			res.status(200);
			return sendSuccessResponse(res, tags);
		} catch (error) {
			logger.error('ForumController', 'Error fetching tags', { err: error });
			return sendErrorResponse(res, 'Failed to fetch tags', 500);
		}
	},

	// Search threads with various filters
	async searchThreads(req: Request, res: Response) {
		try {
			logger.debug('ForumController', 'Thread search endpoint called', { query: req.query });

			const params: ThreadSearchParams = {
				categoryId: req.query.categoryId ? (req.query.categoryId as StructureId) : undefined,
				prefix: req.query.prefix as string | undefined,
				tag: req.query.tag as string | undefined,
				page: req.query.page ? parseInt(req.query.page as string) : 1,
				limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
				sortBy: (req.query.sortBy as any) || 'latest',
				search: req.query.search as string | undefined
			};

			logger.debug('ForumController', 'Processed search params', { params });

			const result = await forumService.searchThreads(params);
			// Transform the threads in the result
			const transformedResult = {
				...result,
				threads: toPublicList(result.threads || [], ForumTransformer.toPublicThread)
			};
			res.status(200);
			return sendSuccessResponse(res, transformedResult);
		} catch (error) {
			logger.error('ForumController', 'Error searching threads', { err: error, query: req.query });
			return sendErrorResponse(res, 'Failed to search threads', 500);
		}
	},

	// ADDED: Controller function to mark/unmark a thread as solved
	async solveThread(req: Request, res: Response) {
		try {
			const threadId = req.params.threadId as ThreadId;
			// The route handler already validated that threadId is a number and permissions are checked.
			// The route handler also validated the body and extracted postId.
			const { postId } = req.body; // postId is optional (null/undefined for unsolve)

			// Call the service to update the thread status
			const updatedThread = await forumService.updateThreadSolvedStatus({
				threadId: threadId,
				solvingPostId: postId === undefined ? null : postId // Use null for unsolve, postId for solve
			});

			if (!updatedThread) {
				return sendErrorResponse(res, 'Thread not found or update failed.', 404);
			}

			// Send success response with transformed thread
			res.status(200);
			return sendSuccessResponse(res, {
				success: true,
				thread: ForumTransformer.toPublicThread(updatedThread)
			});
		} catch (error) {
			logger.error('ForumController', 'Error in solveThread', {
				err: error,
				threadId: req.params.threadId,
				body: req.body
			});
			// Pass the error to the next middleware (global error handler)
			throw error; // Re-throw the error to be caught by the error handler
		}
	},

	// ADDED: Controller function to mark a post as the solving post
	// Note: This is now handled by the single solveThread function above,
	// which accepts an optional postId. Keeping this comment for context.
	// async markPostAsSolution(req: Request, res: Response) { ... }

	// Get a forum by slug
	async getForumBySlug(req: Request, res: Response) {
		try {
			const { slug } = req.params;

			if (!slug) {
				return sendErrorResponse(res, 'Forum slug is required', 400);
			}

			const forum = await forumService.getCategoryBySlug(slug);

			if (!forum) {
				return sendErrorResponse(res, 'Forum not found', 404);
			}

			res.status(200);
			return sendSuccessResponse(res, { forum: ForumTransformer.toPublicForumStructure(forum) });
		} catch (error) {
			logger.error('ForumController', 'Error fetching forum by slug', {
				err: error,
				slug: req.params.slug
			});
			return sendErrorResponse(res, 'Failed to fetch forum', 500);
		}
	},

	// Get child forums by parent ID
	async getForumsByParentId(req: Request, res: Response) {
		try {
			const parentId = req.query.parentId ? (req.query.parentId as StructureId) : undefined;

			if (!parentId) {
				return sendErrorResponse(res, 'Valid parent ID is required', 400);
			}

			const forums = await forumService.getForumsByParentId(parentId);

			res.status(200);
			return sendSuccessResponse(res, {
				forums: toPublicList(forums, ForumTransformer.toPublicForumStructure)
			});
		} catch (error) {
			logger.error('ForumController', 'Error fetching forums by parent ID', {
				err: error,
				parentId: req.query.parentId
			});
			return sendErrorResponse(res, 'Failed to fetch child forums', 500);
		}
	}
};

export default forumController;
