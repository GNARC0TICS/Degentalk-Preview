import type { Request, Response } from 'express';
import { logger } from '@core/logger';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';
import { taxonomyService } from '@api/domains/forum/services/taxonomy.service';
import { ForumTransformer } from '@api/domains/forum/transformers/forum.transformer';

class TagsController {
	async getTags(req: Request, res: Response) {
		try {
			const tags = await taxonomyService.getTags();
			const publicTags = tags.map(ForumTransformer.toPublicTag);
			return sendSuccessResponse(res, publicTags);
		} catch (error) {
			logger.error('TagsController', 'Error in getTags', { error });
			return sendErrorResponse(res, 'Failed to fetch tags', 500);
		}
	}
}

export const tagsController = new TagsController();
