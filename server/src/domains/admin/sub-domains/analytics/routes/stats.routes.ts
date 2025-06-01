/**
 * Admin Platform Stats Routes
 * 
 * Provides API endpoints for platform statistics
 */
import { Router } from 'express';
import { db } from '@server/src/core/db';
import { platformStatistics } from '@db/schema';
import { eq } from 'drizzle-orm';
import { platformStatsService } from '../services/platformStats.service';
import { isAdmin } from '../../../../auth/middleware/auth.middleware';
import { PlatformStatsController } from '../controllers/platformStats.controller';

const router = Router();

// Apply admin authorization middleware to all routes
router.use(isAdmin);

/**
 * GET /api/admin/platform-stats
 * 
 * Retrieves all platform statistics
 */
router.get('/', async (req, res) => {
  try {
    // Fetch all stats from the platformStatistics table
    const stats = await db.select().from(platformStatistics);
    
    // Convert to a more usable format
    const formattedStats = stats.reduce((acc, stat) => {
      acc[stat.statKey] = Number(stat.statValue);
      return acc;
    }, {} as Record<string, number>);
    
    // Include the latest update timestamp
    const latestStat = stats.sort((a, b) => {
      return new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime();
    })[0];
    
    const response = {
      stats: formattedStats,
      lastUpdated: latestStat?.lastUpdatedAt || new Date()
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching platform statistics:', error);
    res.status(500).json({ error: 'Failed to fetch platform statistics' });
  }
});

/**
 * GET /api/admin/platform-stats/:key
 * 
 * Retrieves a specific platform statistic by key
 */
router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    
    const [stat] = await db.select().from(platformStatistics)
      .where(eq(platformStatistics.statKey, key));
    
    if (!stat) {
      return res.status(404).json({ error: `Statistic '${key}' not found` });
    }
    
    res.json({
      key: stat.statKey,
      value: Number(stat.statValue),
      lastUpdated: stat.lastUpdatedAt
    });
  } catch (error) {
    console.error('Error fetching platform statistic:', error);
    res.status(500).json({ error: 'Failed to fetch platform statistic' });
  }
});

/**
 * POST /api/admin/platform-stats/refresh
 * 
 * Refreshes all platform statistics
 */
router.post('/refresh', async (req, res) => {
  try {
    const stats = await platformStatsService.updateAllStats();
    
    res.json({
      message: 'Platform statistics refreshed successfully',
      stats
    });
  } catch (error) {
    console.error('Error refreshing platform statistics:', error);
    res.status(500).json({ error: 'Failed to refresh platform statistics' });
  }
});

export default router; 