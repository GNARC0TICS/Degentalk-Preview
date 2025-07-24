/**
 * Analytics Controller
 * 
 * Provides endpoints for session tracking, performance metrics,
 * and retention analytics
 */

import { Request, Response } from 'express';
import { logger } from '@core/logger';
import { sessionTrackingService } from '../services/session-tracking.service';
import { redisCacheService } from '@core/cache/redis.service';
import { getAuthenticatedUser } from '@utils/request-user';
import { send } from '@api/utils/response';

export class AnalyticsController {
  /**
   * Get current session metrics
   */
  async getSessionMetrics(req: Request, res: Response): Promise<void> {
    try {
      const timeframe = req.query.timeframe as 'day' | 'week' | 'month' || 'day';
      
      const metrics = await sessionTrackingService.getSessionMetrics(timeframe);
      
      send(res, metrics);
    } catch (error) {
      logger.error('AnalyticsController', 'Error getting session metrics', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to get session metrics'
      });
    }
  }

  /**
   * Get retention cohort analysis
   */
  async getRetentionCohorts(req: Request, res: Response): Promise<void> {
    try {
      const weeks = parseInt(req.query.weeks as string) || 12;
      
      const cohorts = await sessionTrackingService.getRetentionCohorts(weeks);
      
      send(res, cohorts);
    } catch (error) {
      logger.error('AnalyticsController', 'Error getting retention cohorts', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to get retention cohorts'
      });
    }
  }

  /**
   * Get real-time session statistics
   */
  async getRealtimeStats(req: Request, res: Response): Promise<void> {
    try {
      const sessionStats = sessionTrackingService.getSessionStats();
      const cacheStats = redisCacheService.getStats();
      
      send(res, {
        sessions: sessionStats,
        cache: cacheStats,
        server: {
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('AnalyticsController', 'Error getting realtime stats', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to get realtime stats'
      });
    }
  }

  /**
   * Get cache performance metrics
   */
  async getCacheMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = redisCacheService.getMetrics();
      const stats = redisCacheService.getStats();
      
      send(res, {
        performance: metrics,
        status: stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('AnalyticsController', 'Error getting cache metrics', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to get cache metrics'
      });
    }
  }

  /**
   * Force cache clear for testing
   */
  async clearCache(req: Request, res: Response): Promise<void> {
    try {
      const user = getAuthenticatedUser(req);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Admin access required'
        });
      }
      
      const prefix = req.query.prefix as string;
      
      await redisCacheService.clear(prefix);
      
      logger.info('AnalyticsController', 'Cache cleared by admin', { 
        adminId: user.id,
        prefix: prefix || 'all'
      });
      
      send(res, { message: `Cache cleared${prefix ? ` for prefix: ${prefix}` : ''}` });
    } catch (error) {
      logger.error('AnalyticsController', 'Error clearing cache', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to clear cache'
      });
    }
  }

  /**
   * Get performance dashboard data
   */
  async getPerformanceDashboard(req: Request, res: Response): Promise<void> {
    try {
      const timeframe = req.query.timeframe as 'day' | 'week' | 'month' || 'day';
      
      const [sessionMetrics, cacheMetrics, realtimeStats] = await Promise.all([
        sessionTrackingService.getSessionMetrics(timeframe),
        redisCacheService.getMetrics(),
        sessionTrackingService.getSessionStats()
      ]);
      
      send(res, {
        sessions: sessionMetrics,
        cache: {
          performance: cacheMetrics,
          status: redisCacheService.getStats()
        },
        realtime: realtimeStats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('AnalyticsController', 'Error getting performance dashboard', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to get performance dashboard'
      });
    }
  }
}

export const analyticsController = new AnalyticsController();