/**
 * Tipping Analytics Controller
 * 
 * Handles requests for tipping analytics data in the admin dashboard
 */

import { Request, Response } from 'express';
import { tippingAnalyticsService } from './tipping-analytics.service';
import { logger } from '../../../../../core/logger';

class TippingAnalyticsController {
  /**
   * Get tipping analytics data
   * GET /api/admin/analytics/engagement/tips
   */
  async getTippingAnalytics(req: Request, res: Response) {
    try {
      // Extract query parameters with defaults
      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      const topLimit = req.query.topLimit ? parseInt(req.query.topLimit as string) : 10;
      
      // Validate parameters
      if (isNaN(days) || days < 1 || days > 365) {
        return res.status(400).json({ 
          error: 'Invalid days parameter. Must be between 1 and 365.' 
        });
      }
      
      if (isNaN(topLimit) || topLimit < 1 || topLimit > 100) {
        return res.status(400).json({ 
          error: 'Invalid topLimit parameter. Must be between 1 and 100.' 
        });
      }
      
      // Get analytics data from service
      const analytics = await tippingAnalyticsService.getTippingAnalytics(days, topLimit);
      
      // Return the data
      return res.status(200).json(analytics);
    } catch (error) {
      logger.error('Error fetching tipping analytics:', error);
      return res.status(500).json({ 
        error: 'An error occurred while fetching tipping analytics' 
      });
    }
  }
}

export const tippingAnalyticsController = new TippingAnalyticsController();