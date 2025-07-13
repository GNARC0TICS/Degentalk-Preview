/**
 * Prefixes Routes
 */

import { Router } from 'express';
import { asyncHandler } from '@core/errors';
import { prefixesController } from '../controllers/prefixes.controller';

const router = Router();

router.get('/', asyncHandler(prefixesController.getPrefixes.bind(prefixesController)));

export default router;
