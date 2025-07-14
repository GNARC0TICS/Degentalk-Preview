/**
 * Cache Performance Test Script
 * 
 * Tests cache hit rates and performance improvements
 * for ad serving, forum threads, and analytics
 */

import { performance } from 'perf_hooks';
import { redisCacheService } from '@core/cache/redis.service';
import { adServingService } from '@domains/advertising/ad-serving.service';
import { threadService } from '@domains/forum/services/thread.service';
import { gamificationAnalyticsService } from '@domains/gamification/services/analytics.service';
import { sessionTrackingService } from '@domains/analytics/services/session-tracking.service';
import { logger } from '@core/logger';

interface TestResult {
  name: string;
  coldTime: number;
  hotTime: number;
  improvement: number;
  cacheHit: boolean;
}

export class CachePerformanceTest {
  private results: TestResult[] = [];

  async runAllTests(): Promise<void> {
    logger.info('CachePerformanceTest', 'Starting performance tests...');
    
    // Test ad serving cache
    await this.testAdServingCache();
    
    // Test forum thread cache
    await this.testForumThreadCache();
    
    // Test analytics cache
    await this.testAnalyticsCache();
    
    // Test session tracking
    await this.testSessionTracking();
    
    // Print results
    this.printResults();
    
    // Test cache metrics
    await this.testCacheMetrics();
  }

  private async testAdServingCache(): Promise<void> {
    logger.info('CachePerformanceTest', 'Testing ad serving cache...');
    
    const adRequest = {
      placementSlug: 'header',
      sessionId: 'test-session-123',
      deviceInfo: {
        type: 'desktop' as const,
        screenSize: '1920x1080',
        userAgent: 'Mozilla/5.0 (Test)'
      },
      geoData: {
        region: 'US',
        timezone: 'America/New_York'
      },
      userContext: {
        dgtBalanceTier: 'whale',
        xpLevel: 100,
        interestSegments: ['crypto', 'gaming'],
        activityLevel: 'high'
      }
    };

    try {
      // Cold run (cache miss)
      const coldStart = performance.now();
      const coldResult = await adServingService.serveAd(adRequest);
      const coldTime = performance.now() - coldStart;

      // Hot run (cache hit)
      const hotStart = performance.now();
      const hotResult = await adServingService.serveAd(adRequest);
      const hotTime = performance.now() - hotStart;

      const improvement = ((coldTime - hotTime) / coldTime) * 100;

      this.results.push({
        name: 'Ad Serving',
        coldTime: coldTime,
        hotTime: hotTime,
        improvement: improvement,
        cacheHit: hotTime < coldTime
      });

      logger.info('CachePerformanceTest', 'Ad serving test completed', {
        coldTime: Math.round(coldTime),
        hotTime: Math.round(hotTime),
        improvement: Math.round(improvement)
      });
    } catch (error) {
      logger.error('CachePerformanceTest', 'Ad serving test failed', { error });
    }
  }

  private async testForumThreadCache(): Promise<void> {
    logger.info('CachePerformanceTest', 'Testing forum thread cache...');
    
    const threadParams = {
      tab: 'trending' as const,
      page: 1,
      limit: 20
    };

    try {
      // Cold run (cache miss)
      const coldStart = performance.now();
      const coldResult = await threadService.fetchThreadsByTab(threadParams);
      const coldTime = performance.now() - coldStart;

      // Hot run (cache hit)
      const hotStart = performance.now();
      const hotResult = await threadService.fetchThreadsByTab(threadParams);
      const hotTime = performance.now() - hotStart;

      const improvement = ((coldTime - hotTime) / coldTime) * 100;

      this.results.push({
        name: 'Forum Threads',
        coldTime: coldTime,
        hotTime: hotTime,
        improvement: improvement,
        cacheHit: hotTime < coldTime
      });

      logger.info('CachePerformanceTest', 'Forum threads test completed', {
        coldTime: Math.round(coldTime),
        hotTime: Math.round(hotTime),
        improvement: Math.round(improvement),
        threadsCount: coldResult.items.length
      });
    } catch (error) {
      logger.error('CachePerformanceTest', 'Forum threads test failed', { error });
    }
  }

  private async testAnalyticsCache(): Promise<void> {
    logger.info('CachePerformanceTest', 'Testing analytics cache...');
    
    try {
      // Cold run (cache miss)
      const coldStart = performance.now();
      const coldResult = await gamificationAnalyticsService.generateDashboard('week');
      const coldTime = performance.now() - coldStart;

      // Hot run (cache hit)
      const hotStart = performance.now();
      const hotResult = await gamificationAnalyticsService.generateDashboard('week');
      const hotTime = performance.now() - hotStart;

      const improvement = ((coldTime - hotTime) / coldTime) * 100;

      this.results.push({
        name: 'Analytics Dashboard',
        coldTime: coldTime,
        hotTime: hotTime,
        improvement: improvement,
        cacheHit: hotTime < coldTime
      });

      logger.info('CachePerformanceTest', 'Analytics test completed', {
        coldTime: Math.round(coldTime),
        hotTime: Math.round(hotTime),
        improvement: Math.round(improvement)
      });
    } catch (error) {
      logger.error('CachePerformanceTest', 'Analytics test failed', { error });
    }
  }

  private async testSessionTracking(): Promise<void> {
    logger.info('CachePerformanceTest', 'Testing session tracking...');
    
    try {
      // Test session creation
      const sessionId = 'test-session-' + Date.now();
      
      const sessionStart = performance.now();
      await sessionTrackingService.startSession(sessionId, {
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent',
        currentPage: '/test',
        deviceType: 'desktop'
      });
      
      // Track some page views
      await sessionTrackingService.trackPageView(sessionId, '/test-page-1');
      await sessionTrackingService.trackPageView(sessionId, '/test-page-2');
      
      const sessionTime = performance.now() - sessionStart;
      
      // Test metrics retrieval
      const metricsStart = performance.now();
      const metrics = await sessionTrackingService.getSessionMetrics('day');
      const metricsTime = performance.now() - metricsStart;

      logger.info('CachePerformanceTest', 'Session tracking test completed', {
        sessionTime: Math.round(sessionTime),
        metricsTime: Math.round(metricsTime),
        activeSessions: sessionTrackingService.getActiveSessionsCount()
      });
      
      // Clean up
      await sessionTrackingService.endSession(sessionId);
    } catch (error) {
      logger.error('CachePerformanceTest', 'Session tracking test failed', { error });
    }
  }

  private async testCacheMetrics(): Promise<void> {
    logger.info('CachePerformanceTest', 'Testing cache metrics...');
    
    try {
      const metrics = redisCacheService.getMetrics();
      const stats = redisCacheService.getStats();
      
      logger.info('CachePerformanceTest', 'Cache metrics', {
        metrics,
        stats
      });
      
      // Test cache operations
      const testKey = 'test-key-' + Date.now();
      const testValue = { test: 'data', timestamp: Date.now() };
      
      // Set
      const setStart = performance.now();
      await redisCacheService.set(testKey, testValue, { ttl: 60000 });
      const setTime = performance.now() - setStart;
      
      // Get
      const getStart = performance.now();
      const retrieved = await redisCacheService.get(testKey);
      const getTime = performance.now() - getStart;
      
      // Delete
      const deleteStart = performance.now();
      await redisCacheService.delete(testKey);
      const deleteTime = performance.now() - deleteStart;
      
      logger.info('CachePerformanceTest', 'Cache operations performance', {
        setTime: Math.round(setTime),
        getTime: Math.round(getTime),
        deleteTime: Math.round(deleteTime),
        dataMatch: JSON.stringify(retrieved) === JSON.stringify(testValue)
      });
    } catch (error) {
      logger.error('CachePerformanceTest', 'Cache metrics test failed', { error });
    }
  }

  private printResults(): void {
    logger.info('CachePerformanceTest', '=== PERFORMANCE TEST RESULTS ===');
    
    this.results.forEach(result => {
      logger.info('CachePerformanceTest', `${result.name}:`, {
        coldTime: `${Math.round(result.coldTime)}ms`,
        hotTime: `${Math.round(result.hotTime)}ms`,
        improvement: `${Math.round(result.improvement)}%`,
        cacheWorking: result.cacheHit
      });
    });
    
    const avgImprovement = this.results.reduce((sum, r) => sum + r.improvement, 0) / this.results.length;
    logger.info('CachePerformanceTest', `Average performance improvement: ${Math.round(avgImprovement)}%`);
  }
}

// Export for use in tests
export const cachePerformanceTest = new CachePerformanceTest();

// Run tests if executed directly
if (require.main === module) {
  cachePerformanceTest.runAllTests().catch(console.error);
}