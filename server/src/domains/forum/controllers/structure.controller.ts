import type { Request, Response } from 'express';
import { logger } from '@core/logger';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';
import { forumStructureService } from '@api/domains/forum/services/structure.service';
import { ForumTransformer } from '@api/domains/forum/transformers/forum.transformer';

class ForumStructureController {
	async getStructure(req: Request, res: Response) {
		try {
			const structures = await forumStructureService.getStructuresWithStats();
			const zones = structures.filter((s) => s.parentId === null);
			const forums = structures.filter((s) => s.type === 'forum');
			return sendSuccessResponse(res, {
				zones: zones.map((z) => ForumTransformer.toPublicForumStructure(z)),
				forums: forums.map((f) => ForumTransformer.toPublicForumStructure(f))
			});
		} catch (error) {
			logger.error('ForumStructureController', 'Error in getStructure', { error });
			return sendErrorResponse(res, 'Failed to fetch forum structure', 500);
		}
	}

	async getForumStats(req: Request, res: Response) {
		try {
			const slug = req.query.slug as string;
			if (!slug) {
				return sendErrorResponse(res, 'Missing slug query param', 400);
			}

			const stats = await forumStructureService.getForumStats(slug);

			if (!stats) {
				return sendErrorResponse(res, 'Forum not found', 404);
			}

			const publicStats = {
				...stats,
				trendingThreads: stats.trendingThreads.map(ForumTransformer.toPublicThread)
			};

			return sendSuccessResponse(res, publicStats);
		} catch (error) {
			logger.error('ForumStructureController', 'Error in getForumStats', { error });
			return sendErrorResponse(res, 'Failed to fetch forum stats', 500);
		}
	}

	// Legacy alias for backward compatibility
	async getZoneStats(req: Request, res: Response) {
		return this.getForumStats(req, res);
	}
}

export const forumStructureController = new ForumStructureController();
