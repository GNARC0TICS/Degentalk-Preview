/**
 * Unified Gamification Routes
 *
 * Central routing hub for all gamification features:
 * - Leveling and progression
 * - Achievements and rewards
 * - Missions and challenges
 * - Leaderboards and analytics
 */

import { Router } from 'express';
import { sendSuccessResponse, sendErrorResponse } from '@server/src/core/utils/transformer.helpers';
import levelingRoutes from './leveling.routes';
import achievementRoutes from './achievement.routes';
import missionRoutes from './mission.routes';
import analyticsRoutes from './analytics.routes';
import adminRoutes from './admin.routes';

const router = Router();

// Mount sub-routers with clear prefixes
router.use('/levels', levelingRoutes);
router.use('/progression', levelingRoutes); // Alias for leveling routes
router.use('/achievements', achievementRoutes);
router.use('/missions', missionRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admin', adminRoutes);

// Health check endpoint for gamification system
router.get('/health', (req, res) => {
	sendSuccessResponse(res, {
		service: 'gamification',
		features: {
			leveling: 'active',
			achievements: 'active',
			missions: 'active',
			leaderboards: 'active',
			analytics: 'active'
		},
		timestamp: new Date().toISOString()
	});
});

// Quick stats endpoint for dashboard widgets
router.get('/stats', async (req, res) => {
	try {
		// This would aggregate key stats from all gamification systems
		sendSuccessResponse(res, {
			placeholder: true,
			message: 'Gamification stats aggregation - to be implemented',
			features: ['levels', 'achievements', 'missions', 'leaderboards', 'analytics']
		});
	} catch (error) {
		sendErrorResponse(res, 'Failed to fetch gamification stats', 500);
	}
});

export default router;
