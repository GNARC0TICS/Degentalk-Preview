import type { Request, Response } from 'express';
import { z } from 'zod';
import { logger } from '@core/logger';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';
import { userSearchService } from '@server/domains/forum/services/user-search.service';
import { userSearchValidation } from '@server/domains/forum/validation/user-search.validation';
import { ForumTransformer } from '@server/domains/forum/transformers/forum.transformer';

class UserSearchController {
  async searchUsers(req: Request, res: Response) {
    try {
      const { q } = userSearchValidation.parse(req).query;
      const users = await userSearchService.searchUsers(q);
      
      const publicUsers = users.map(ForumTransformer.toPublicUser);

      return sendSuccessResponse(res, publicUsers);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendErrorResponse(res, 'Invalid search query', 400, error.issues);
      }
      logger.error('UserSearchController', 'Error in searchUsers', { error });
      return sendErrorResponse(res, 'Failed to search users', 500);
    }
  }
}

export const userSearchController = new UserSearchController(); 