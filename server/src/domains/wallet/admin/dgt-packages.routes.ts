import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { asyncHandler } from '../../admin/admin.middleware';
import {
	listPackages,
	getPackageById,
	createPackage,
	updatePackage,
	deletePackage
} from './dgt-packages.controller';

const router: RouterType = Router();

router.get('/', asyncHandler(listPackages));
router.get('/:packageId', asyncHandler(getPackageById));
router.post('/', asyncHandler(createPackage));
router.put('/:packageId', asyncHandler(updatePackage));
router.delete('/:packageId', asyncHandler(deletePackage));

export default router;
