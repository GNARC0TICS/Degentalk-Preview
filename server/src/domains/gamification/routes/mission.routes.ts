import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { authenticate } from '@api/middleware/auth';
import { validateRequest } from '@api/middleware/validate-request';
import { requireAdmin } from '../../forum/services/permissions.service';
import { missionService } from '../services/mission.service';
import { getAuthenticatedUser } from '@core/utils/auth.helpers';
import { logger } from '@core/logger';
import { 
	ProgressUpdateSchema, 
	CreateEventMissionSchema,
	CreateFromTemplatesSchema 
} from '../schemas/mission.schemas';
import { toPublicMission, toAuthenticatedMission } from '../transformers/mission.transformer';
import { send } from '@api/utils/response';

const router: RouterType = Router();

// Get all active missions with user progress
router.get('/', authenticate, async (req, res) => {
	try {
		const user = getAuthenticatedUser(req);
		if (!user) return res.status(401).json({ error: 'Unauthorized' });

		const missions = await missionService.getActiveMissions();
		const enriched = await Promise.all(
			missions.map(async (mission) => {
				const progress = await missionService.getUserMissionProgress(user.id, mission.id);
				return toAuthenticatedMission(mission, progress);
			})
		);

		send(res, enriched);
	} catch (error) {
		logger.error({ error }, 'Failed to get missions');
		res.status(500).json({ error: 'Failed to get missions' });
	}
});

// Get daily missions (with lazy assignment)
router.get('/daily', authenticate, async (req, res) => {
	try {
		const user = getAuthenticatedUser(req);
		if (!user) return res.status(401).json({ error: 'Unauthorized' });

		// Ensure user has daily missions assigned
		await missionService.ensureDailyMissions(user.id);

		const missions = await missionService.getDailyMissions(user.id);
		const transformed = missions.map(m => toAuthenticatedMission(m, m.progress));

		send(res, transformed);
	} catch (error) {
		logger.error({ error }, 'Failed to get daily missions');
		res.status(500).json({ error: 'Failed to get daily missions' });
	}
});

// Get weekly missions
router.get('/weekly', authenticate, async (req, res) => {
	try {
		const user = getAuthenticatedUser(req);
		if (!user) return res.status(401).json({ error: 'Unauthorized' });

		const missions = await missionService.getWeeklyMissions(user.id);
		const transformed = missions.map(m => toAuthenticatedMission(m, m.progress));

		send(res, transformed);
	} catch (error) {
		logger.error({ error }, 'Failed to get weekly missions');
		res.status(500).json({ error: 'Failed to get weekly missions' });
	}
});

// Update mission progress (for manual progress tracking)
router.post('/:missionId/progress', authenticate, validateRequest(ProgressUpdateSchema), async (req, res) => {
	try {
		const user = getAuthenticatedUser(req);
		if (!user) return res.status(401).json({ error: 'Unauthorized' });

		const { missionId } = req.params;
		const { increment } = req.body;

		const progress = await missionService.updateProgress(user.id, missionId, increment);
		
		send(res, {
			currentCount: progress.currentCount,
			isCompleted: progress.isCompleted,
			isRewardClaimed: progress.isRewardClaimed
		});
	} catch (error) {
		logger.error({ error }, 'Failed to update mission progress');
		res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update progress' });
	}
});

// Claim mission reward
router.post('/:missionId/claim', authenticate, async (req, res) => {
	try {
		const user = getAuthenticatedUser(req);
		if (!user) return res.status(401).json({ error: 'Unauthorized' });

		const { missionId } = req.params;
		
		const result = await missionService.claimReward(user.id, missionId);
		
		send(res, result);
	} catch (error) {
		logger.error({ error }, 'Failed to claim mission reward');
		res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to claim reward' });
	}
});

// Admin: Create event mission
router.post('/event', authenticate, requireAdmin, validateRequest(CreateEventMissionSchema), async (req, res) => {
	try {
		const mission = await missionService.createEventMission(req.body);
		send(res, toPublicMission(mission));
	} catch (error) {
		logger.error({ error }, 'Failed to create event mission');
		res.status(500).json({ error: 'Failed to create event mission' });
	}
});

// Admin: Get mission templates
router.get('/templates', authenticate, requireAdmin, async (req, res) => {
	try {
		const templates = missionService.getMissionTemplates();
		send(res, templates);
	} catch (error) {
		logger.error({ error }, 'Failed to get mission templates');
		res.status(500).json({ error: 'Failed to get templates' });
	}
});

// Admin: Create missions from templates
router.post('/templates/create', authenticate, requireAdmin, validateRequest(CreateFromTemplatesSchema), async (req, res) => {
	try {
		const { templateIds } = req.body;
		const missions = await missionService.createMissionsFromTemplates(templateIds);
		send(res, {
			created: missions.length,
			missions: missions.map(m => toPublicMission(m))
		});
	} catch (error) {
		logger.error({ error }, 'Failed to create missions from templates');
		res.status(500).json({ error: 'Failed to create missions' });
	}
});

// Admin: Reset missions (manual trigger)
router.post('/reset/:type', authenticate, requireAdmin, async (req, res) => {
	try {
		const { type } = req.params;
		
		if (type === 'daily') {
			await missionService.resetDailyMissions();
		} else if (type === 'weekly') {
			await missionService.resetWeeklyMissions();
		} else {
			return res.status(400).json({ error: 'Invalid reset type' });
		}

		send(res, { type });
	} catch (error) {
		logger.error({ error }, 'Failed to reset missions');
		res.status(500).json({ error: 'Failed to reset missions' });
	}
});

// Get user mission summary
router.get('/summary', authenticate, async (req, res) => {
	try {
		const user = getAuthenticatedUser(req);
		if (!user) return res.status(401).json({ error: 'Unauthorized' });

		const summary = await missionService.getUserMissionSummary(user.id);
		
		send(res, summary);
	} catch (error) {
		logger.error({ error }, 'Failed to get mission summary');
		res.status(500).json({ error: 'Failed to get mission summary' });
	}
});

export { router as missionRoutes };