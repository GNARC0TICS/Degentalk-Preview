import { Router } from 'express';
import { asyncHandler } from '../../admin.middleware';
import {
	listPackages,
	getPackageById,
	createPackage,
	updatePackage,
	deletePackage
} from './dgt-packages.controller';

const router = Router();

router.get('/', asyncHandler(listPackages));
router.get('/:packageId', asyncHandler(getPackageById));
router.post('/', asyncHandler(createPackage));
router.put('/:packageId', asyncHandler(updatePackage));
router.delete('/:packageId', asyncHandler(deletePackage));

export default router;
