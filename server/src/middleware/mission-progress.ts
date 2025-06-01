import { Request, Response, NextFunction } from 'express';
import { missionsService } from '../domains/missions/missions.service';
import { MissionType } from '@shared/schema';
import { logger } from '../core/logger';

/**
 * Middleware for tracking mission progress when users perform actions
 * 
 * This middleware should be applied to routes where user actions
 * related to missions occur, like creating posts, liking content, etc.
 */
export const trackMissionProgress = (
  actionType: MissionType,
  getMetadata?: (req: Request) => Record<string, any>
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Skip if no authenticated user
      // @ts-ignore - user is added by auth middleware
      const userId = req.user?.id;
      if (!userId) {
        return next();
      }
      
      // Create a response interceptor to update missions after the main handler completes
      const originalSend = res.send;
      res.send = function(body) {
        // Execute original handler first
        res.send = originalSend;
        const result = res.send(body);
        
        // Then update mission progress asynchronously
        // We don't await this to avoid delaying the response
        updateMissionProgress(userId, actionType, req, getMetadata).catch(err => {
          logger.error('MISSION_PROGRESS', 'Error updating mission progress:', err);
        });
        
        return result;
      };
      
      next();
    } catch (error) {
      // Don't fail the request if mission tracking fails
      logger.error('MISSION_PROGRESS', 'Error in trackMissionProgress middleware:', error);
      next();
    }
  };
};

/**
 * Update mission progress for a user action
 */
const updateMissionProgress = async (
  userId: number,
  actionType: MissionType,
  req: Request,
  getMetadata?: (req: Request) => Record<string, any>
) => {
  try {
    // Get any additional metadata for this action
    const metadata = getMetadata ? getMetadata(req) : {};
    
    // Update mission progress
    const updatedProgress = await missionsService.updateMissionProgress({
      userId,
      actionType,
      metadata,
    });
    
    // Log the result if any missions were updated
    if (updatedProgress.length > 0) {
      logger.info('MISSION_PROGRESS', `Updated mission progress for user ${userId}, action ${actionType}`, {
        userId,
        actionType,
        updatedMissions: updatedProgress.map(p => ({
          missionId: p.missionId,
          currentCount: p.currentCount,
          isCompleted: p.isCompleted,
        })),
      });
    }
    
    return updatedProgress;
  } catch (error) {
    logger.error('MISSION_PROGRESS', 'Error updating mission progress:', error);
    return [];
  }
}; 