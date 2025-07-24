import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '@core/middleware/auth';
import { validateRequest } from '@core/middleware/validate-request';
import { dailyBonusService } from '../services/daily-bonus.service';
import { asyncHandler } from '@core/utils/async-handler';
import { logger } from '@core/logger';

const router = Router();

/**
 * Daily Bonus Routes
 * MVP engagement feature while missions are archived
 */

// Check and claim daily bonus
router.post(
  '/claim',
  authenticate,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    
    const result = await dailyBonusService.checkDailyBonus(userId);
    
    if (!result) {
      return res.status(500).json({
        success: false,
        error: 'Failed to process daily bonus'
      });
    }
    
    return res.json({
      success: true,
      data: result
    });
  })
);

// Get current streak
router.get(
  '/streak',
  authenticate,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const streak = await dailyBonusService.getCurrentStreak(userId);
    
    return res.json({
      success: true,
      data: { streak }
    });
  })
);

// Admin: Get today's claim count
router.get(
  '/admin/stats',
  authenticate,
  asyncHandler(async (req, res) => {
    // Check admin permission
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }
    
    const claimCount = await dailyBonusService.getTodayClaimCount();
    
    return res.json({
      success: true,
      data: {
        date: new Date().toDateString(),
        claimCount
      }
    });
  })
);

// Admin: Reset user streak
const resetStreakSchema = z.object({
  body: z.object({
    userId: z.string().uuid()
  })
});

router.post(
  '/admin/reset-streak',
  authenticate,
  validateRequest(resetStreakSchema),
  asyncHandler(async (req, res) => {
    // Check admin permission
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }
    
    const { userId } = req.body;
    await dailyBonusService.resetStreak(userId);
    
    logger.info('DAILY_BONUS_ADMIN', 'Streak reset by admin', {
      adminId: req.user!.id,
      targetUserId: userId
    });
    
    return res.json({
      success: true,
      message: 'Streak reset successfully'
    });
  })
);

export default router;