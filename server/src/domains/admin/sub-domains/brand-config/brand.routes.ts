import { Router } from 'express';
import { brandController } from './brand.controller.ts';
import { isAdmin } from '../../admin.middleware.ts';
import { asyncHandler } from '../../admin.middleware.ts';

const router = Router();

// All routes require admin auth
router.use(isAdmin);

// GET /api/admin/brand-config
router.get('/', asyncHandler(brandController.getBrandConfig.bind(brandController)));

// PUT /api/admin/brand-config/:id (placeholder)
router.put('/:id', asyncHandler(brandController.updateBrandConfig.bind(brandController)));

export default router;
