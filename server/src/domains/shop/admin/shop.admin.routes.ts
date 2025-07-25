import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { shopAdminController } from './shop.admin.controller';
import { asyncHandler } from '../../admin.middleware'; // Adjust path if admin.middleware is elsewhere
import categoryRoutes from './shopCategory.routes';
import rarityRoutes from './rarity.routes';

const router: RouterType = Router();

// GET /api/admin/shop/items - List all products
router.get('/items', asyncHandler(shopAdminController.listProducts));

// GET /api/admin/shop/items/:id - Get single product by ID
router.get('/items/:productId', asyncHandler(shopAdminController.getProductById));

// POST /api/admin/shop/items - Create product
router.post('/items', asyncHandler(shopAdminController.createProduct));

// PUT /api/admin/shop/items/:id - Update product
router.put('/items/:productId', asyncHandler(shopAdminController.updateProduct));

// DELETE /api/admin/shop/items/:id - Soft delete product
router.delete('/items/:productId', asyncHandler(shopAdminController.deleteProduct));

// Nested routers
router.use('/categories', categoryRoutes);
router.use('/rarities', rarityRoutes);

export default router;
