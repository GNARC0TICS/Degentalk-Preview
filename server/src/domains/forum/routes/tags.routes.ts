/**
 * Tags Routes
 */

import { Router } from 'express';
import { asyncHandler } from '@core/errors';
import { tagsController } from '../controllers/tags.controller';

const router = Router();

router.get('/', asyncHandler(tagsController.getTags.bind(tagsController)));

export default router;
