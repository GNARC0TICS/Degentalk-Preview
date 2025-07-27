import express from 'express';
import { eventLogController } from '../controllers/event-log.controller';
import { requireAuth, requireAdmin } from '@middleware/auth.unified';

import { Router } from 'express'
import type { Router as RouterType } from 'express';
const router: Router = express.Router();

// Public routes - none for event logs

// Protected routes - require authentication
router.get('/user/:userId', requireAuth, eventLogController.getUserEventLogs);

// Admin routes - require admin permissions
router.get('/', requireAuth, requireAdmin, eventLogController.getEventLogs);
router.post('/', requireAuth, requireAdmin, eventLogController.createEventLog);
router.get('/:id', requireAuth, requireAdmin, eventLogController.getEventLogById);
router.delete('/:id', requireAuth, requireAdmin, eventLogController.deleteEventLog);

export default router;
