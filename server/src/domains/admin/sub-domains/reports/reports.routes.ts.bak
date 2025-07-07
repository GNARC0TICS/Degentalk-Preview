/**
 * Admin Reports Routes
 *
 * Defines API routes for reports and content moderation.
 */

import { Router } from 'express';
import { adminReportsController } from './reports.controller';
import { asyncHandler } from '../../admin.middleware';

const router = Router();

// Get all reports (with filters and pagination)
router.get('/', asyncHandler(adminReportsController.getReports.bind(adminReportsController)));

// Get a single report by ID
router.get('/:id', asyncHandler(adminReportsController.getReportById.bind(adminReportsController)));

// Resolve a report
router.post(
	'/:id/resolve',
	asyncHandler(adminReportsController.resolveReport.bind(adminReportsController))
);

// Dismiss a report
router.post(
	'/:id/dismiss',
	asyncHandler(adminReportsController.dismissReport.bind(adminReportsController))
);

// Ban a user (Note: This route might be better under a /users/:userId/ban structure, but following admin-reports.ts for now)
router.post(
	'/users/:userId/ban',
	asyncHandler(adminReportsController.banUser.bind(adminReportsController))
);

// Delete content (post, thread, or message)
// Example: DELETE /api/admin/reports/content/post/123
router.delete(
	'/content/:contentType/:contentId',
	asyncHandler(adminReportsController.deleteContent.bind(adminReportsController))
);

export default router;
