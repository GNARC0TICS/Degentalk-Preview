/**
 * Cache Metrics Controller
 * 
 * Provides comprehensive cache performance monitoring for production readiness
 * Includes hit rates, error rates, memory usage, and performance recommendations
 */

import type { Request, Response } from 'express';
import { getCacheOperationStats, getRecentCacheOperations } from '@core/cache/decorators';
import { getInvalidationStats, getInvalidationLog } from '@core/cache/invalidateCache';
import { redisCacheService } from '@core/cache/redis.service';
import { adminCacheService } from '../shared';
import { logger } from '@core/logger';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';

export interface CacheHealthMetrics {
  overall: {
    status: 'healthy' | 'degraded' | 'critical';
    score: number; // 0-100
    hitRate: number;
    errorRate: number;
    responseTime: number;
  };
  decoratorCache: {
    hits: number;
    misses: number;
    sets: number;
    errors: number;
    hitRate: number;
  };
  invalidation: {
    total: number;
    successful: number;
    failed: number;
    recentCount: number;
    failureRate: number;
  };
  memory: {
    redisMemoryUsage?: number;
    adminCacheSize: number;
    forumCacheSize: number;
  };
  performance: {
    averageLatency: number;
    p95Latency: number;
    slowestOperations: Array<{
      key: string;
      operation: string;
      duration: number;
    }>;
  };
  recommendations: string[];
}

export const cacheMetricsController = {
  /**
   * Get comprehensive cache health dashboard
   */
  async getHealthDashboard(req: Request, res: Response): Promise<void> {
    try {
      const decoratorStats = getCacheOperationStats();
      const invalidationStats = getInvalidationStats();
      const recentOperations = getRecentCacheOperations(50);
      
      // Calculate performance metrics
      const operationsWithDuration = recentOperations.filter(op => op.duration !== undefined);
      const latencies = operationsWithDuration.map(op => op.duration!).sort((a, b) => a - b);
      const averageLatency = latencies.length > 0 ? 
        latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length : 0;
      const p95Index = Math.floor(latencies.length * 0.95);
      const p95Latency = latencies.length > 0 ? latencies[p95Index] || latencies[latencies.length - 1] : 0;
      
      // Find slowest operations
      const slowestOperations = operationsWithDuration
        .sort((a, b) => (b.duration || 0) - (a.duration || 0))
        .slice(0, 5)
        .map(op => ({
          key: op.key,
          operation: op.operation,
          duration: op.duration || 0
        }));
      
      // Calculate error rates
      const invalidationFailureRate = invalidationStats.total > 0 ? 
        (invalidationStats.failed / invalidationStats.total) * 100 : 0;
      
      const cacheErrorRate = decoratorStats.hits + decoratorStats.misses > 0 ?
        (decoratorStats.errors / (decoratorStats.hits + decoratorStats.misses + decoratorStats.errors)) * 100 : 0;
      
      // Memory usage (mock for now - would query actual Redis)
      const memoryMetrics = {
        redisMemoryUsage: 0, // Would query Redis INFO memory
        adminCacheSize: await getAdminCacheSize(),
        forumCacheSize: 0 // Would query forum cache
      };
      
      // Overall health scoring
      const hitRateScore = Math.min(decoratorStats.hitRate, 100);
      const errorRateScore = Math.max(0, 100 - (cacheErrorRate * 10)); // Penalize errors heavily
      const latencyScore = averageLatency < 50 ? 100 : Math.max(0, 100 - (averageLatency / 10));
      const overallScore = Math.round((hitRateScore + errorRateScore + latencyScore) / 3);
      
      // Health status determination
      let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
      if (overallScore < 60 || cacheErrorRate > 10 || invalidationFailureRate > 20) {
        status = 'critical';
      } else if (overallScore < 80 || cacheErrorRate > 5 || decoratorStats.hitRate < 70) {
        status = 'degraded';
      }
      
      // Generate recommendations
      const recommendations: string[] = [];
      if (decoratorStats.hitRate < 70) {
        recommendations.push('Low cache hit rate detected. Consider increasing TTL values.');
      }
      if (cacheErrorRate > 5) {
        recommendations.push('High cache error rate. Check Redis connectivity and memory.');
      }
      if (averageLatency > 100) {
        recommendations.push('High cache latency detected. Consider Redis optimization.');
      }
      if (invalidationFailureRate > 10) {
        recommendations.push('Cache invalidation failures detected. Monitor Redis health.');
      }
      if (decoratorStats.errors > 10) {
        recommendations.push('Frequent cache errors. Enable fallback monitoring.');
      }
      
      const healthMetrics: CacheHealthMetrics = {
        overall: {
          status,
          score: overallScore,
          hitRate: decoratorStats.hitRate,
          errorRate: cacheErrorRate,
          responseTime: averageLatency
        },
        decoratorCache: decoratorStats,
        invalidation: {
          ...invalidationStats,
          failureRate: invalidationFailureRate
        },
        memory: memoryMetrics,
        performance: {
          averageLatency,
          p95Latency,
          slowestOperations
        },
        recommendations
      };
      
      sendSuccessResponse(res, healthMetrics);
      
    } catch (error) {
      logger.error('Cache health dashboard error:', error);
      sendErrorResponse(res, 'Failed to get cache metrics', 500);
    }
  },

  /**
   * Get recent cache operations for debugging
   */
  async getRecentOperations(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const operations = getRecentCacheOperations(Math.min(limit, 200));
      
      const groupedOperations = {
        hits: operations.filter(op => op.operation === 'HIT'),
        misses: operations.filter(op => op.operation === 'MISS'),
        sets: operations.filter(op => op.operation === 'SET'),
        errors: operations.filter(op => op.operation === 'ERROR')
      };
      
      sendSuccessResponse(res, {
        total: operations.length,
        operations: groupedOperations,
        summary: getCacheOperationStats()
      });
      
    } catch (error) {
      logger.error('Recent cache operations error:', error);
      sendErrorResponse(res, 'Failed to get cache operations', 500);
    }
  },

  /**
   * Get cache invalidation history
   */
  async getInvalidationHistory(req: Request, res: Response): Promise<void> {
    try {
      const log = getInvalidationLog();
      const stats = getInvalidationStats();
      
      // Group by reason for analysis
      const reasonGroups = log.reduce((groups, event) => {
        const reason = event.reason;
        if (!groups[reason]) {
          groups[reason] = { count: 0, successful: 0, failed: 0 };
        }
        groups[reason].count++;
        if (event.success) {
          groups[reason].successful++;
        } else {
          groups[reason].failed++;
        }
        return groups;
      }, {} as Record<string, { count: number; successful: number; failed: number }>);
      
      sendSuccessResponse(res, {
        stats,
        recentEvents: log.slice(-20), // Last 20 events
        reasonBreakdown: reasonGroups
      });
      
    } catch (error) {
      logger.error('Invalidation history error:', error);
      sendErrorResponse(res, 'Failed to get invalidation history', 500);
    }
  },

  /**
   * Clear cache metrics (development only)
   */
  async clearMetrics(req: Request, res: Response): Promise<void> {
    try {
      if (process.env.NODE_ENV === 'production') {
        return sendErrorResponse(res, 'Not available in production', 403);
      }
      
      // Clear decorator stats
      const { clearCacheStats } = await import('@core/cache/decorators');
      clearCacheStats();
      
      // Clear invalidation log
      const { clearInvalidationLog } = await import('@core/cache/invalidateCache');
      clearInvalidationLog();
      
      sendSuccessResponse(res, { message: 'Cache metrics cleared' });
      
    } catch (error) {
      logger.error('Clear cache metrics error:', error);
      sendErrorResponse(res, 'Failed to clear metrics', 500);
    }
  }
};

/**
 * Helper to get admin cache size estimation
 */
async function getAdminCacheSize(): Promise<number> {
  try {
    // This is a rough estimation - actual implementation would vary
    return 0; // Placeholder
  } catch (error) {
    logger.warn('Failed to get admin cache size:', error);
    return 0;
  }
}