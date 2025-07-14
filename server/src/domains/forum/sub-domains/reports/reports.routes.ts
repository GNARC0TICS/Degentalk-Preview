/**
 * User-facing Reports Routes
 *
 * Defines API routes for users to report content.
 */

import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { reportsController } from './reports.controller';

const router: RouterType = Router();

// Create a report (user-facing)
router.post('/', reportsController.createReport.bind(reportsController));

export default router;
