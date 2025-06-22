/**
 * User-facing Reports Routes
 *
 * Defines API routes for users to report content.
 */

import { Router } from 'express';
import { reportsController } from './reports.controller';

const router = Router();

// Create a report (user-facing)
router.post('/', reportsController.createReport.bind(reportsController));

export default router;