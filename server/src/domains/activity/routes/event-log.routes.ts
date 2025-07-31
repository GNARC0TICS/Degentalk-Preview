import express from 'express';
import { eventLogController } from '../controllers/event-log.controller';
import { luciaAuth } from '@middleware/lucia-auth.middleware';

import { Router } from 'express'
import type { Router as RouterType } from 'express';
const router: Router = express.Router();

// Public routes - none for event logs

// Protected routes - require authentication
router.get('/user/:userId', luciaAuth.require, eventLogController.getUserEventLogs);

// Admin routes - require admin permissions
router.get('/', luciaAuth.require, luciaAuth.requireAdmin, eventLogController.getEventLogs);
router.post('/', luciaAuth.require, luciaAuth.requireAdmin, eventLogController.createEventLog);
router.get('/:id', luciaAuth.require, luciaAuth.requireAdmin, eventLogController.getEventLogById);
router.delete('/:id', luciaAuth.require, luciaAuth.requireAdmin, eventLogController.deleteEventLog);

export default router;
