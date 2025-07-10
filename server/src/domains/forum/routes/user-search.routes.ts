/**
 * User Search Routes
 */

import { Router } from 'express';
import { asyncHandler } from '@core/errors';
import { userSearchController } from '../controllers/user-search.controller';

const router = Router();

router.get(
	'/',
	asyncHandler(userSearchController.searchUsers.bind(userSearchController))
);

export default router; 