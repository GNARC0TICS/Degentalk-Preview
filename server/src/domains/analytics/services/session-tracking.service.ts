/**
 * Session Tracking Service for User Retention Analytics
 * 
 * Tracks user sessions, page views, and engagement metrics
 * for comprehensive retention analysis
 */

import { db } from '@degentalk/db';
import { eq, and, gte, desc, count, avg, sql } from 'drizzle-orm';
import { logger } from '@core/logger';
import { redisCacheService, CacheMinute } from '@core/cache/redis.service';
import type { UserId } from '@shared/types/ids';

export interface SessionData {
  sessionId: string;
  userId?: UserId;
  ipAddress: string;
  userAgent: string;
  startTime: Date;
  lastActivity: Date;
  pageViews: number;
  currentPage: string;
  referrer?: string;
  isAuthenticated: boolean;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  os: string;
  country?: string;
  city?: string;
}

export interface SessionMetrics {
  totalSessions: number;
  averageSessionDuration: number;
  bounceRate: number;
  pageViewsPerSession: number;
  uniqueUsers: number;
  returningUsers: number;
  newUsers: number;
  topPages: Array<{
    page: string;
    views: number;
    uniqueUsers: number;
  }>;
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  retentionRate: number;
}

export interface RetentionCohort {
  cohortWeek: string;
  totalUsers: number;
  week0: number; // Users active in week 0 (registration week)
  week1: number; // Users active in week 1
  week2: number; // Users active in week 2
  week4: number; // Users active in week 4
  week8: number; // Users active in week 8
  week12: number; // Users active in week 12
}

export class SessionTrackingService {
  private activeSessions = new Map<string, SessionData>();
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  constructor() {
    // Clean up inactive sessions every 5 minutes
    setInterval(() => this.cleanupInactiveSessions(), 5 * 60 * 1000);
  }

  /**
   * Start a new session or update existing one
   */
  async startSession(sessionId: string, data: Partial<SessionData>): Promise<void> {
    try {
      const now = new Date();
      
      // Check if session exists
      let session = this.activeSessions.get(sessionId);
      
      if (!session) {
        session = {
          sessionId,
          userId: data.userId,
          ipAddress: data.ipAddress || 'unknown',
          userAgent: data.userAgent || 'unknown',
          startTime: now,
          lastActivity: now,
          pageViews: 0,
          currentPage: data.currentPage || '/',
          referrer: data.referrer,
          isAuthenticated: !!data.userId,
          deviceType: this.detectDeviceType(data.userAgent || ''),
          browser: this.detectBrowser(data.userAgent || ''),
          os: this.detectOS(data.userAgent || ''),
          country: data.country,
          city: data.city
        };
        
        this.activeSessions.set(sessionId, session);
        logger.debug('SessionTracking', 'New session started', { sessionId, userId: data.userId });
      } else {
        // Update existing session
        session.lastActivity = now;
        session.userId = data.userId || session.userId;
        session.isAuthenticated = !!data.userId;
        session.currentPage = data.currentPage || session.currentPage;
      }

      // Cache session data in Redis for persistence
      await redisCacheService.set(
        `session:${sessionId}`,
        session,
        { ttl: this.SESSION_TIMEOUT, prefix: 'tracking' }
      );
    } catch (error) {
      logger.error('SessionTracking', 'Error starting session', { sessionId, error });
    }
  }

  /**
   * Track page view
   */
  async trackPageView(sessionId: string, page: string, userId?: UserId): Promise<void> {
    try {
      let session = this.activeSessions.get(sessionId);
      
      if (!session) {
        // Try to restore from Redis
        session = await redisCacheService.get(`session:${sessionId}`);
        if (session) {
          this.activeSessions.set(sessionId, session);
        }
      }
      
      if (session) {
        session.pageViews++;
        session.currentPage = page;
        session.lastActivity = new Date();
        session.userId = userId || session.userId;
        session.isAuthenticated = !!userId;
        
        // Update cache
        await redisCacheService.set(
          `session:${sessionId}`,
          session,
          { ttl: this.SESSION_TIMEOUT, prefix: 'tracking' }
        );
        
        // Track page view in analytics
        await this.recordPageView(sessionId, page, userId);
      }
    } catch (error) {
      logger.error('SessionTracking', 'Error tracking page view', { sessionId, page, error });
    }
  }

  /**
   * End a session
   */
  async endSession(sessionId: string): Promise<void> {
    try {
      const session = this.activeSessions.get(sessionId);
      
      if (session) {
        const sessionDuration = Date.now() - session.startTime.getTime();
        
        // Record session end in analytics
        await this.recordSessionEnd(session, sessionDuration);
        
        // Clean up
        this.activeSessions.delete(sessionId);
        await redisCacheService.delete(`session:${sessionId}`, { prefix: 'tracking' });
        
        logger.debug('SessionTracking', 'Session ended', { 
          sessionId, 
          duration: sessionDuration,
          pageViews: session.pageViews 
        });
      }
    } catch (error) {
      logger.error('SessionTracking', 'Error ending session', { sessionId, error });
    }
  }

  /**
   * Get current session metrics
   */
  @CacheMinute(5)
  async getSessionMetrics(timeframe: 'day' | 'week' | 'month' = 'day'): Promise<SessionMetrics> {
    try {
      const timeFilter = this.getTimeFilter(timeframe);
      
      // This would normally query a sessions table
      // For now, we'll return metrics from active sessions and cache
      const activeSessions = Array.from(this.activeSessions.values());
      
      const totalSessions = activeSessions.length;
      const averageSessionDuration = activeSessions.reduce((sum, session) => {
        return sum + (Date.now() - session.startTime.getTime());
      }, 0) / totalSessions || 0;
      
      const bounceRate = activeSessions.filter(s => s.pageViews <= 1).length / totalSessions * 100;
      
      const pageViewsPerSession = activeSessions.reduce((sum, s) => sum + s.pageViews, 0) / totalSessions || 0;
      
      const uniqueUsers = new Set(activeSessions.map(s => s.userId).filter(Boolean)).size;
      
      const deviceBreakdown = activeSessions.reduce((acc, session) => {
        acc[session.deviceType]++;
        return acc;
      }, { mobile: 0, desktop: 0, tablet: 0 });
      
      // Calculate top pages
      const pageViews = new Map<string, { views: number; users: Set<UserId> }>();
      activeSessions.forEach(session => {
        if (!pageViews.has(session.currentPage)) {
          pageViews.set(session.currentPage, { views: 0, users: new Set() });
        }
        const pageData = pageViews.get(session.currentPage)!;
        pageData.views += session.pageViews;
        if (session.userId) {
          pageData.users.add(session.userId);
        }
      });
      
      const topPages = Array.from(pageViews.entries())
        .map(([page, data]) => ({
          page,
          views: data.views,
          uniqueUsers: data.users.size
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);
      
      return {
        totalSessions,
        averageSessionDuration: Math.round(averageSessionDuration / 1000), // Convert to seconds
        bounceRate: Math.round(bounceRate),
        pageViewsPerSession: Math.round(pageViewsPerSession * 100) / 100,
        uniqueUsers,
        returningUsers: 0, // Would need to calculate from historical data
        newUsers: uniqueUsers, // For now, assume all are new
        topPages,
        deviceBreakdown,
        retentionRate: 0 // Would need to calculate from historical data
      };
    } catch (error) {
      logger.error('SessionTracking', 'Error getting session metrics', { error });
      throw error;
    }
  }

  /**
   * Get retention cohort analysis
   */
  @CacheMinute(60) // Cache for 1 hour as this is expensive
  async getRetentionCohorts(weeks: number = 12): Promise<RetentionCohort[]> {
    try {
      // This would normally query user registration and activity data
      // For now, return mock data structure
      
      const cohorts: RetentionCohort[] = [];
      const now = new Date();
      
      for (let i = 0; i < weeks; i++) {
        const cohortDate = new Date(now);
        cohortDate.setDate(cohortDate.getDate() - (i * 7));
        
        cohorts.push({
          cohortWeek: cohortDate.toISOString().split('T')[0],
          totalUsers: Math.floor(Math.random() * 100) + 50, // Mock data
          week0: Math.floor(Math.random() * 100) + 50,
          week1: Math.floor(Math.random() * 80) + 20,
          week2: Math.floor(Math.random() * 60) + 15,
          week4: Math.floor(Math.random() * 40) + 10,
          week8: Math.floor(Math.random() * 30) + 8,
          week12: Math.floor(Math.random() * 20) + 5
        });
      }
      
      return cohorts;
    } catch (error) {
      logger.error('SessionTracking', 'Error getting retention cohorts', { error });
      throw error;
    }
  }

  /**
   * Get active sessions count
   */
  getActiveSessionsCount(): number {
    return this.activeSessions.size;
  }

  /**
   * Get session statistics
   */
  getSessionStats() {
    const sessions = Array.from(this.activeSessions.values());
    const authenticated = sessions.filter(s => s.isAuthenticated).length;
    const anonymous = sessions.length - authenticated;
    
    return {
      total: sessions.length,
      authenticated,
      anonymous,
      averagePageViews: sessions.reduce((sum, s) => sum + s.pageViews, 0) / sessions.length || 0,
      oldestSession: sessions.length > 0 ? Math.min(...sessions.map(s => s.startTime.getTime())) : null
    };
  }

  // Private helper methods
  private cleanupInactiveSessions(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (now - session.lastActivity.getTime() > this.SESSION_TIMEOUT) {
        this.endSession(sessionId);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      logger.debug('SessionTracking', `Cleaned up ${cleaned} inactive sessions`);
    }
  }

  private detectDeviceType(userAgent: string): 'mobile' | 'desktop' | 'tablet' {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'tablet';
    }
    return 'desktop';
  }

  private detectBrowser(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    if (ua.includes('chrome')) return 'Chrome';
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('safari')) return 'Safari';
    if (ua.includes('edge')) return 'Edge';
    return 'Other';
  }

  private detectOS(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    if (ua.includes('windows')) return 'Windows';
    if (ua.includes('mac')) return 'macOS';
    if (ua.includes('linux')) return 'Linux';
    if (ua.includes('android')) return 'Android';
    if (ua.includes('ios')) return 'iOS';
    return 'Other';
  }

  private getTimeFilter(timeframe: 'day' | 'week' | 'month'): Date {
    const now = new Date();
    switch (timeframe) {
      case 'day':
        now.setDate(now.getDate() - 1);
        break;
      case 'week':
        now.setDate(now.getDate() - 7);
        break;
      case 'month':
        now.setDate(now.getDate() - 30);
        break;
    }
    return now;
  }

  private async recordPageView(sessionId: string, page: string, userId?: UserId): Promise<void> {
    // This would normally insert into a page_views table
    // For now, just log it
    logger.debug('SessionTracking', 'Page view recorded', { sessionId, page, userId });
  }

  private async recordSessionEnd(session: SessionData, duration: number): Promise<void> {
    // This would normally insert into a sessions table
    // For now, just log it
    logger.info('SessionTracking', 'Session completed', {
      sessionId: session.sessionId,
      userId: session.userId,
      duration: Math.round(duration / 1000),
      pageViews: session.pageViews,
      deviceType: session.deviceType
    });
  }
}

export const sessionTrackingService = new SessionTrackingService();