/**
 * Admin User Groups Routes
 * 
 * Defines API routes for user group management.
 */

import { Router } from 'express';
import { adminUserGroupsController } from './user-groups.controller';
import { asyncHandler } from '../../admin.middleware';

const router = Router();

// Get all user groups (with user counts)
router.get('/', asyncHandler(adminUserGroupsController.getAllGroups.bind(adminUserGroupsController)));

// Create a new user group
router.post('/', asyncHandler(adminUserGroupsController.createGroup.bind(adminUserGroupsController)));

// Get a specific user group by ID (with user count)
router.get('/:id', asyncHandler(adminUserGroupsController.getGroupById.bind(adminUserGroupsController)));

// Update a user group
router.put('/:id', asyncHandler(adminUserGroupsController.updateGroup.bind(adminUserGroupsController)));

// Delete a user group (and reassign users if necessary)
router.delete('/:id', asyncHandler(adminUserGroupsController.deleteGroup.bind(adminUserGroupsController)));

// Get users in a specific group (paginated)
router.get('/:id/users', asyncHandler(adminUserGroupsController.getUsersInGroup.bind(adminUserGroupsController)));

export default router;
