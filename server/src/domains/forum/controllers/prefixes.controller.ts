import type { Request, Response } from 'express';
import { logger } from '@core/logger';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';
import { taxonomyService } from '@server/domains/forum/services/taxonomy.service';
import { ForumTransformer } from '@server/domains/forum/transformers/forum.transformer';

class PrefixesController {
  async getPrefixes(req: Request, res: Response) {
    try {
      const forumId = req.query.forumId as string | undefined;
      const prefixes = await taxonomyService.getPrefixes(forumId);
      const publicPrefixes = prefixes.map(ForumTransformer.toPublicPrefix);
      return sendSuccessResponse(res, publicPrefixes);
    } catch (error) {
      logger.error('PrefixesController', 'Error in getPrefixes', { error });
      return sendErrorResponse(res, 'Failed to fetch prefixes', 500);
    }
  }
}

export const prefixesController = new PrefixesController(); 