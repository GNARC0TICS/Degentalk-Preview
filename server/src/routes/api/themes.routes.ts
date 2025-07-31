/**
 * Theme API Routes
 * 
 * Provides endpoints for theme retrieval based on context
 */

import { Router } from 'express';
import { asyncHandler } from '@core/errors';
import { luciaAuth } from '@middleware/lucia-auth.middleware';
import { themeService } from '@domains/themes/services/theme.service';
import type { Request, Response } from 'express';
import { parseId } from '@shared/utils/id';
import type { ForumId } from '@shared/types/ids';
import { logger } from '@core/logger';

const router = Router();

/**
 * GET /api/themes/context
 * Get theme for specific context (forum, user)
 */
router.get('/context', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { forumId } = req.query;
    const userId = req.user?.id; // From auth middleware if authenticated
    
    // Build context
    const context = {
      forumId: forumId ? parseId<'ForumId'>(forumId as string) : undefined,
      userId: userId ? parseId<'UserId'>(userId) : undefined
    };
    
    // Get theme for context
    const theme = await themeService.getThemeForContext(context);
    
    res.json({
      success: true,
      data: theme
    });
  } catch (error) {
    logger.error('Failed to get theme for context:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve theme'
    });
  }
}));

/**
 * GET /api/themes/:themeKey
 * Get specific theme by key
 */
router.get('/:themeKey', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { themeKey } = req.params;
    
    // For now, use the existing uiThemes service
    // In future, this would be replaced with the new theme service
    const themes = await themeService.getThemeForContext({});
    
    if (themes.themeKey === themeKey) {
      res.json({
        success: true,
        data: themes
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Theme not found'
      });
    }
  } catch (error) {
    logger.error('Failed to get theme:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve theme'
    });
  }
}));

/**
 * POST /api/themes/clear-cache
 * Clear theme cache (admin only)
 */
router.post('/clear-cache', 
  luciaAuth.requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    try {
      await themeService.clearCache();
      
      res.json({
        success: true,
        message: 'Theme cache cleared successfully'
      });
    } catch (error) {
      logger.error('Failed to clear theme cache:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to clear cache'
      });
    }
  })
);

export default router;