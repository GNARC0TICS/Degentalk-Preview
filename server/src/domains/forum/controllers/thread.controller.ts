import type { Request, Response } from 'express';
import { z } from 'zod';
import { logger } from '@core/logger';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';
import { getUser } from '@core/utils/auth.helpers';
import { threadService } from '@api/domains/forum/services/thread.service';
import { ThreadTransformer } from '@api/domains/forum/transformers/thread.transformer';
import type { StructureId, ThreadId, UserId, TagId } from '@shared/types/ids';
import { db } from '@db';
import { forumStructure } from '@schema';
import { eq } from 'drizzle-orm';
import { ForumTransformer } from '@api/domains/forum/transformers/forum.transformer';
import { postService } from '@api/domains/forum/services/post.service';

class ThreadController {
	async searchThreads(req: Request, res: Response) {
		const page = parseInt(req.query.page as string) || 1;
		const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
		const structureId = req.query.structureId as StructureId | undefined;
		const sortBy = (req.query.sortBy as string) || 'newest';
		const search = req.query.search as string;

		const result = await threadService.searchThreads({
			structureId,
			page,
			limit,
			sortBy: sortBy as any,
			search
		});

		const user = getUser(req);
		const transformedThreads = result.threads.map((thread) =>
			user ? ThreadTransformer.toSlim(thread) : ThreadTransformer.toPublic(thread)
		);

		return sendSuccessResponse(res, {
			threads: transformedThreads,
			pagination: {
				page,
				limit: limit,
				totalThreads: result.total,
				totalPages: result.totalPages
			}
		});
	}

	async getThreadById(req: Request, res: Response) {
		const threadId = req.params.id as ThreadId;
		const thread = await threadService.getThreadById(threadId);

		if (!thread) {
			return sendErrorResponse(res, 'Thread not found', 404);
		}

		const user = getUser(req);
		const transformedThread = user
			? ThreadTransformer.toAuthenticated(thread, user)
			: ThreadTransformer.toPublic(thread);

		return sendSuccessResponse(res, transformedThread);
	}

	async getThreadBySlug(req: Request, res: Response) {
		const { slug } = req.params;
		const thread = await threadService.getThreadBySlug(slug);

		if (!thread) {
			return sendErrorResponse(res, 'Thread not found', 404);
		}

		await threadService.incrementViewCount(thread.id);

		const user = getUser(req);
		const transformedThread = user
			? ThreadTransformer.toAuthenticated(thread, user)
			: ThreadTransformer.toPublic(thread);

		return sendSuccessResponse(res, transformedThread);
	}

	async createThread(req: Request, res: Response) {
		const userId = getUser(req)?.id as UserId;
		const { forumSlug, ...restBody } = req.body;

		// Get forum structure by slug
		const [structure] = await db
			.select()
			.from(forumStructure)
			.where(eq(forumStructure.slug, forumSlug))
			.limit(1);

		if (!structure) {
			return sendErrorResponse(res, 'Forum not found', 404);
		}

		const newThread = await threadService.createThread({
			...restBody,
			structureId: structure.id,
			userId
		});

		// Return just the slug for the client to navigate
		return sendSuccessResponse(res, { slug: newThread.slug }, 201);
	}

	async updateThreadSolvedStatus(req: Request, res: Response) {
		const { threadId } = req.params as { threadId: ThreadId };
		const { solvingPostId } = req.body;

		const updatedThread = await threadService.updateThreadSolvedStatus({
			threadId,
			solvingPostId
		});

		if (!updatedThread) {
			return sendErrorResponse(res, 'Thread not found', 404);
		}

		const user = getUser(req);
		const transformedThread = user
			? ForumTransformer.toAuthenticatedThread(updatedThread, user)
			: ForumTransformer.toPublicThread(updatedThread);

		return sendSuccessResponse(res, transformedThread);
	}

	async addTagsToThread(req: Request, res: Response) {
		const { threadId } = req.params as { threadId: ThreadId };
		const { tags } = req.body;
		const userId = getUser(req)?.id as UserId;

		const updatedThread = await threadService.addTagsToThread(threadId, tags, userId);
		return sendSuccessResponse(res, updatedThread);
	}

	async removeTagFromThread(req: Request, res: Response) {
		const { threadId, tagId } = req.params as { threadId: ThreadId; tagId: TagId };
		const userId = getUser(req)?.id as UserId;

		const updatedThread = await threadService.removeTagFromThread(threadId, tagId, userId);
		return sendSuccessResponse(res, updatedThread);
	}

	async toggleThreadFeature(req: Request, res: Response) {
		const { threadId } = req.params as { threadId: ThreadId };
		const featured = req.method === 'POST';
		const updatedThread = await threadService.toggleThreadFeature(threadId, featured);
		return sendSuccessResponse(res, updatedThread);
	}

	async toggleThreadLock(req: Request, res: Response) {
		const { threadId } = req.params as { threadId: ThreadId };
		const locked = req.method === 'POST';
		const updatedThread = await threadService.toggleThreadLock(threadId, locked);
		return sendSuccessResponse(res, updatedThread);
	}

	async toggleThreadPin(req: Request, res: Response) {
		const { threadId } = req.params as { threadId: ThreadId };
		const pinned = req.method === 'POST';
		const updatedThread = await threadService.toggleThreadPin(threadId, pinned);
		return sendSuccessResponse(res, updatedThread);
	}

	async getThreadPosts(req: Request, res: Response) {
		const { threadId } = req.params as { threadId: ThreadId };
		const page = parseInt(req.query.page as string) || 1;
		const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
		const sortBy = (req.query.sortBy as string) || 'oldest';

		const result = await postService.getPostsByThread({
			threadId,
			page,
			limit,
			sortBy: sortBy as any
		});

		return sendSuccessResponse(res, {
			posts: result.posts,
			pagination: {
				page,
				limit,
				totalPosts: result.total,
				totalPages: result.totalPages
			}
		});
	}
}

export const threadController = new ThreadController();
