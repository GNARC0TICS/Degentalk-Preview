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
	res.json({
		success: true,
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
		res.json({
			success: true,
			data: {
				placeholder: true,
				message: 'Gamification stats aggregation - to be implemented',
				features: ['levels', 'achievements', 'missions', 'leaderboards', 'analytics']
			}
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: 'Failed to fetch gamification stats'
		});
	}
});

export default router;
