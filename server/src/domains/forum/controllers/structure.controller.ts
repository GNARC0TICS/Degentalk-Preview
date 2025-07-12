import type { Request, Response } from 'express';
import { logger } from '@core/logger';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';
import { forumStructureService } from '@server/domains/forum/services/structure.service';
import { ForumTransformer } from '@server/domains/forum/transformers/forum.transformer';

class ForumStructureController {
  async getStructure(req: Request, res: Response) {
    try {
      const structures = await forumStructureService.getStructuresWithStats();
      const zones = structures.filter((s) => s.type === 'zone');
      const forums = structures.filter((s) => s.type === 'forum');
      return sendSuccessResponse(res, {
        zones: zones.map(z => ForumTransformer.toPublicForumStructure(z)),
        forums: forums.map(f => ForumTransformer.toPublicForumStructure(f))
      });
    } catch (error) {
      logger.error('ForumStructureController', 'Error in getStructure', { error });
      return sendErrorResponse(res, 'Failed to fetch forum structure', 500);
    }
  }

  async getZoneStats(req: Request, res: Response) {
    try {
      const slug = req.query.slug as string;
      if (!slug) {
        return sendErrorResponse(res, 'Missing slug query param', 400);
      }

      const stats = await forumStructureService.getZoneStats(slug);

      if (!stats) {
        return sendErrorResponse(res, 'Zone not found', 404);
      }

      const publicStats = {
        ...stats,
        trendingThreads: stats.trendingThreads.map(ForumTransformer.toPublicThread),
      };

      return sendSuccessResponse(res, publicStats);
    } catch (error) {
      logger.error('ForumStructureController', 'Error in getZoneStats', { error });
      return sendErrorResponse(res, 'Failed to fetch zone stats', 500);
    }
  }
}

export const forumStructureController = new ForumStructureController(); 