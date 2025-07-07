import { Router } from 'express';
import { userInventoryAdminController } from './inventory.admin.controller';
import { asyncHandler } from '../../admin.middleware'; // Adjust path

const router = Router();

// GET /api/admin/user-inventory/:userId - View user inventory
router.get('/:userId', asyncHandler(userInventoryAdminController.viewInventory));

// POST /api/admin/user-inventory/:userId/grant - Grant item to user
router.post('/:userId/grant', asyncHandler(userInventoryAdminController.grantItem));

// POST /api/admin/user-inventory/:userId/:inventoryItemId/equip - Force equip item
router.post(
	'/:userId/:inventoryItemId/equip',
	asyncHandler(userInventoryAdminController.equipItem)
);

// POST /api/admin/user-inventory/:userId/:inventoryItemId/unequip - Force unequip item
router.post(
	'/:userId/:inventoryItemId/unequip',
	asyncHandler(userInventoryAdminController.unequipItem)
);

export default router;
