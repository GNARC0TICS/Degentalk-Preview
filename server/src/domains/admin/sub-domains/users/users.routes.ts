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
 * @route GET /api/admin/users
 * @desc Get paginated users with filtering
 * @access Admin
 */
router.get('/', asyncHandler(adminUsersController.getUsers.bind(adminUsersController)));

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
 * @route GET /api/admin/users/search
 * @desc Search users for admin tools (includes clout/tier data)
 * @access Admin
 */
router.get('/search', asyncHandler(adminUsersController.searchUsers.bind(adminUsersController)));

export default router;
