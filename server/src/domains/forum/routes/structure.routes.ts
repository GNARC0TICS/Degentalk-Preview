/**
 * Forum Structure Routes
 */

import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { asyncHandler } from '@core/errors';
import { forumStructureController } from '../controllers/structure.controller';

const router: RouterType = Router();

router.get('/', asyncHandler(forumStructureController.getStructure.bind(forumStructureController)));

router.get(
	'/forum-stats',
	asyncHandler(forumStructureController.getForumStats.bind(forumStructureController))
);

// Legacy route for backward compatibility
router.get(
	'/zone-stats',
	asyncHandler(forumStructureController.getForumStats.bind(forumStructureController))
);

export default router;
