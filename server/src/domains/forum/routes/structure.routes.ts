/**
 * Forum Structure Routes
 */

import { Router } from 'express';
import { asyncHandler } from '@core/errors';
import { forumStructureController } from '../controllers/structure.controller';

const router = Router();

router.get('/', asyncHandler(forumStructureController.getStructure.bind(forumStructureController)));

router.get(
	'/zone-stats',
	asyncHandler(forumStructureController.getZoneStats.bind(forumStructureController))
);

export default router;
