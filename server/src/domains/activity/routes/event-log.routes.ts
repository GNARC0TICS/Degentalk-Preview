import express from 'express';
import { eventLogController } from '../controllers/event-log.controller';
import { isAuthenticated } from '../../auth/middleware/auth.middleware';
import { isAdmin } from '../../auth/middleware/admin.middleware';

import { Router } from 'express';
const router: Router = express.Router();

// Public routes - none for event logs

// Protected routes - require authentication
router.get('/user/:userId', isAuthenticated, eventLogController.getUserEventLogs);

// Admin routes - require admin permissions
router.get('/', isAuthenticated, isAdmin, eventLogController.getEventLogs);
router.post('/', isAuthenticated, isAdmin, eventLogController.createEventLog);
router.get('/:id', isAuthenticated, isAdmin, eventLogController.getEventLogById);
router.delete('/:id', isAuthenticated, isAdmin, eventLogController.deleteEventLog);

export default router;
