/**
 * Prefixes Routes
 */

import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { asyncHandler } from '@core/errors';
import { prefixesController } from '../controllers/prefixes.controller';

const router: RouterType = Router();

router.get('/', asyncHandler(prefixesController.getPrefixes.bind(prefixesController)));

export default router;
