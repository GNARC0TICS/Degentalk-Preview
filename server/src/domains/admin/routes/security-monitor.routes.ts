/**
 * Security Monitoring Routes
 * Admin-only routes for security monitoring and metrics
 */

import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { 
	getSecurityMetrics, 
	getRecentSecurityEvents,
	triggerTestSecurityEvent 
} from '../controllers/security-monitor.controller';
import { isAuthenticated, isAdmin } from '../../auth/middleware/auth.middleware';

const router: RouterType = Router();

// All security monitoring routes require admin access
router.use(isAuthenticated);
router.use(isAdmin);

/**
 * GET /api/admin/security/metrics
 * Get security metrics for dashboard
 * Query params: timeWindow (milliseconds, max 24h)
 */
router.get('/metrics', getSecurityMetrics);

/**
 * GET /api/admin/security/events
 * Get recent security events
 * Query params: limit, severity, eventType
 */
router.get('/events', getRecentSecurityEvents);

/**
 * POST /api/admin/security/test-event
 * Trigger test security event (dev/staging only)
 */
router.post('/test-event', triggerTestSecurityEvent);

export default router;