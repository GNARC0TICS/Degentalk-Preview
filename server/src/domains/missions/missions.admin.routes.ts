// REFACTORED: Updated auth middleware imports to use canonical path
/**
 * Admin Missions Routes
 *
 * API endpoints for mission management in the admin panel
 */

import { Router, Request, Response, NextFunction } from 'express';
import * as missionsController from './missions.controller';
import { isAuthenticated, isAdmin } from '../auth/middleware/auth.middleware';

const router = Router();

// Create a simple asyncHandler utility
const asyncHandler = (fn) => (req, res, next) => {
	Promise.resolve(fn(req, res, next)).catch(next);
};

// Get all missions (admin view)
router.get('/all', asyncHandler(missionsController.getAllMissions));

// Create a new mission
router.post('/create', asyncHandler(missionsController.createMission));

// Update a mission
router.put('/:id', asyncHandler(missionsController.updateMission));

// Get a specific user's mission progress
router.get('/progress/:userId', asyncHandler(missionsController.getUserMissionProgressById));

// Initialize default missions
router.post('/initialize-defaults', asyncHandler(missionsController.initializeDefaultMissions));

// Reset missions
router.post('/reset-daily', asyncHandler(missionsController.resetDailyMissions));
router.post('/reset-weekly', asyncHandler(missionsController.resetWeeklyMissions));

export default router;
