import type { Request, Response } from 'express';
import { z } from 'zod';
import { logger } from '@core/logger';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';
import { getAuthenticatedUser } from '@core/utils/auth.helpers';
import { threadService } from '@server/domains/forum/services/thread.service';
import { ForumTransformer } from '@server/domains/forum/transformers/forum.transformer';
import type { StructureId, ThreadId, UserId, TagId } from '@shared/types/ids';

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
			search,
		});
		
		const user = getAuthenticatedUser(req);
		const transformedThreads = result.threads.map(thread => 
			user ? ForumTransformer.toSlimThread(thread) : ForumTransformer.toPublicThread(thread)
		);

		return sendSuccessResponse(res, {
			threads: transformedThreads,
			pagination: {
				page,
				limit: limit,
				totalThreads: result.total,
				totalPages: result.totalPages,
			},
		});
	}

	async getThreadById(req: Request, res: Response) {
		const threadId = req.params.id as ThreadId;
		const thread = await threadService.getThreadById(threadId);

		if (!thread) {
			return sendErrorResponse(res, 'Thread not found', 404);
		}

		const user = getAuthenticatedUser(req);
		const transformedThread = user
			? ForumTransformer.toAuthenticatedThread(thread, user)
			: ForumTransformer.toPublicThread(thread);

		return sendSuccessResponse(res, transformedThread);
	}

	async getThreadBySlug(req: Request, res: Response) {
		const { slug } = req.params;
		const thread = await threadService.getThreadBySlug(slug);

		if (!thread) {
			return sendErrorResponse(res, 'Thread not found', 404);
		}

		await threadService.incrementViewCount(thread.id);

		const user = getAuthenticatedUser(req);
		const transformedThread = user
			? ForumTransformer.toAuthenticatedThread(thread, user)
			: ForumTransformer.toPublicThread(thread);

		return sendSuccessResponse(res, transformedThread);
	}

	async createThread(req: Request, res: Response) {
		const userId = getAuthenticatedUser(req)?.id as UserId;
		const newThread = await threadService.createThread({
			...req.body,
			userId,
		});
		
		const user = getAuthenticatedUser(req);
		const transformedThread = user ? ForumTransformer.toAuthenticatedThread(newThread, user) : ForumTransformer.toPublicThread(newThread);
		
		return sendSuccessResponse(res, transformedThread, 201);
	}

	async updateThreadSolvedStatus(req: Request, res: Response) {
		const { threadId } = req.params as { threadId: ThreadId };
		const { solvingPostId } = req.body;

		const updatedThread = await threadService.updateThreadSolvedStatus({
			threadId,
			solvingPostId,
		});

		if (!updatedThread) {
			return sendErrorResponse(res, 'Thread not found', 404);
		}
		
		const user = getAuthenticatedUser(req);
		const transformedThread = user ? ForumTransformer.toAuthenticatedThread(updatedThread, user) : ForumTransformer.toPublicThread(updatedThread);

		return sendSuccessResponse(res, transformedThread);
	}

	async addTagsToThread(req: Request, res: Response) {
		const { threadId } = req.params as { threadId: ThreadId };
		const { tags } = req.body;
		const userId = getAuthenticatedUser(req)?.id as UserId;

		const updatedThread = await threadService.addTagsToThread(threadId, tags, userId);
		return sendSuccessResponse(res, updatedThread);
	}

	async removeTagFromThread(req: Request, res: Response) {
		const { threadId, tagId } = req.params as { threadId: ThreadId; tagId: TagId };
		const userId = getAuthenticatedUser(req)?.id as UserId;

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
}

export const threadController = new ThreadController(); 