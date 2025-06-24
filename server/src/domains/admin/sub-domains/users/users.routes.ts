/**
 * Admin Users Routes
 *
 * Define routes for user management in the admin panel
 */

import { Router } from 'express';
import { adminUsersController } from './users.controller';
import { asyncHandler } from '../../admin.middleware';

// Create router
const router = Router();

/**
 * @route GET /api/admin/users/search
 * @desc Search users for admin tools (includes clout/tier data)
 * @access Admin
 * @note This route must come before /:id to avoid conflicts
 */
router.get('/search', asyncHandler(adminUsersController.searchUsers.bind(adminUsersController)));

/**
 * @route GET /api/admin/users
 * @desc Get paginated users with filtering
 * @access Admin
 */
router.get('/', asyncHandler(adminUsersController.getUsers.bind(adminUsersController)));

/**
 * @route POST /api/admin/users
 * @desc Create a new user
 * @access Admin
 */
router.post('/', asyncHandler(adminUsersController.createUser.bind(adminUsersController)));

/**
 * @route GET /api/admin/users/:id
 * @desc Get detailed user information by ID
 * @access Admin
 */
router.get('/:id', asyncHandler(adminUsersController.getUserById.bind(adminUsersController)));

/**
 * @route PUT /api/admin/users/:id
 * @desc Update a user
 * @access Admin
 */
router.put('/:id', asyncHandler(adminUsersController.updateUser.bind(adminUsersController)));

/**
 * @route DELETE /api/admin/users/:id
 * @desc Delete a user
 * @access Admin
 */
router.delete('/:id', asyncHandler(adminUsersController.deleteUser.bind(adminUsersController)));

/**
 * @route POST /api/admin/users/:id/ban
 * @desc Ban a user
 * @access Admin
 */
router.post('/:id/ban', asyncHandler(adminUsersController.banUser.bind(adminUsersController)));

/**
 * @route POST /api/admin/users/:id/unban
 * @desc Unban a user
 * @access Admin
 */
router.post('/:id/unban', asyncHandler(adminUsersController.unbanUser.bind(adminUsersController)));

/**
 * @route PATCH /api/admin/users/:id/role
 * @desc Change user role
 * @access Admin
 */
router.patch(
	'/:id/role',
	asyncHandler(adminUsersController.changeUserRole.bind(adminUsersController))
);

export default router;
