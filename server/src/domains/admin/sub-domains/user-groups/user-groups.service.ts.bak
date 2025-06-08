/**
 * Admin User Groups Service
 * 
 * Handles business logic for user group management.
 */

import { db } from '@db';
import { userGroups, users } from '@schema';
import { eq, and, sql, count, desc, ne } from 'drizzle-orm';
import { AdminError, AdminErrorCodes } from '../../admin.errors';
import type { UserGroupInput, ListGroupUsersQueryInput } from './user-groups.validators';

export class AdminUserGroupsService {
  async getAllGroupsWithCounts() {
    const allGroups = await db.select()
      .from(userGroups)
      .orderBy(desc(userGroups.isAdmin), desc(userGroups.isModerator), desc(userGroups.isStaff), userGroups.id);
    
    const userCountsResult = await db
      .select({
        groupId: users.groupId,
        userCount: count(), // Drizzle will count non-null groupId occurrences
      })
      .from(users)
      .where(sql`${users.groupId} IS NOT NULL`)
      .groupBy(users.groupId);

    const countMap = new Map<number, number>();
    userCountsResult.forEach(row => {
      if (row.groupId !== null) { // Ensure groupId is not null before setting
        countMap.set(row.groupId, Number(row.userCount));
      }
    });

    return allGroups.map(group => ({
      ...group,
      userCount: countMap.get(group.id) || 0,
    }));
  }

  async getGroupById(groupId: number) {
    const [group] = await db.select().from(userGroups).where(eq(userGroups.id, groupId));
    if (!group) {
      throw new AdminError('User group not found', 404, AdminErrorCodes.NOT_FOUND);
    }
    const [userCountResult] = await db.select({ count: count() }).from(users).where(eq(users.groupId, groupId));
    return {
      ...group,
      userCount: Number(userCountResult?.count) || 0,
    };
  }

  async createGroup(data: UserGroupInput) {
    const [existingGroup] = await db.select().from(userGroups).where(eq(userGroups.name, data.name));
    if (existingGroup) {
      throw new AdminError('A group with this name already exists', 400, AdminErrorCodes.DUPLICATE_ENTRY);
    }

    if (data.isDefault) {
      await db.update(userGroups).set({ isDefault: false }).where(eq(userGroups.isDefault, true));
    }

    const [newGroup] = await db.insert(userGroups).values({
      name: data.name,
      description: data.description,
      color: data.color,
      icon: data.icon,
      badge: data.badge,
      isStaff: data.isStaff,
      staffPriority: data.staffPriority,
      isDefault: data.isDefault,
      isModerator: data.isModerator,
      isAdmin: data.isAdmin,
      canManageUsers: data.canManageUsers,
      canManageContent: data.canManageContent,
      canManageSettings: data.canManageSettings,
      // permissions: data.permissions, // Add if/when granular permissions are implemented
      createdAt: new Date(), // Drizzle/DB handles default for createdAt/updatedAt if defined in schema
      updatedAt: new Date(),
    }).returning();
    return newGroup;
  }

  async updateGroup(groupId: number, data: UserGroupInput) {
    const [existingGroup] = await db.select().from(userGroups).where(eq(userGroups.id, groupId));
    if (!existingGroup) {
      throw new AdminError('User group not found to update', 404, AdminErrorCodes.NOT_FOUND);
    }

    if (data.name && data.name !== existingGroup.name) {
      const [nameConflict] = await db.select().from(userGroups).where(and(eq(userGroups.name, data.name), ne(userGroups.id, groupId)));
      if (nameConflict) {
        throw new AdminError('Another group with this name already exists', 400, AdminErrorCodes.DUPLICATE_ENTRY);
      }
    }

    if (data.isDefault && !existingGroup.isDefault) {
      await db.update(userGroups).set({ isDefault: false }).where(eq(userGroups.isDefault, true));
    }

    const [updatedGroup] = await db.update(userGroups).set({
      ...data, // Spread validated and potentially defaulted data
      updatedAt: new Date(),
    }).where(eq(userGroups.id, groupId)).returning();
    return updatedGroup;
  }

  async deleteGroup(groupId: number) {
    const [existingGroup] = await db.select().from(userGroups).where(eq(userGroups.id, groupId));
    if (!existingGroup) {
      throw new AdminError('User group not found to delete', 404, AdminErrorCodes.NOT_FOUND);
    }
    if (existingGroup.isDefault) {
      throw new AdminError('Cannot delete the default user group. Set another group as default first.', 400, AdminErrorCodes.OPERATION_FAILED);
    }

    const [userCountResult] = await db.select({ count: count() }).from(users).where(eq(users.groupId, groupId));
    const usersInGroupCount = Number(userCountResult?.count) || 0;

    if (usersInGroupCount > 0) {
      const [defaultGroup] = await db.select({id: userGroups.id}).from(userGroups).where(eq(userGroups.isDefault, true));
      if (!defaultGroup) {
        throw new AdminError('Cannot delete group with users if no other default group exists to reassign them.', 400, AdminErrorCodes.OPERATION_FAILED);
      }
      await db.update(users).set({ groupId: defaultGroup.id }).where(eq(users.groupId, groupId));
    }

    await db.delete(userGroups).where(eq(userGroups.id, groupId));
    return { success: true, message: 'User group deleted successfully.', reassignedUsers: usersInGroupCount > 0 };
  }

  async getUsersInGroup(groupId: number, params: ListGroupUsersQueryInput) {
    const { page, limit } = params;
    const offset = (page - 1) * limit;

    const [groupExists] = await db.select({id: userGroups.id}).from(userGroups).where(eq(userGroups.id, groupId));
    if (!groupExists) {
      throw new AdminError('User group not found', 404, AdminErrorCodes.NOT_FOUND);
    }

    const usersInGroupList = await db.select({
        id: users.id,
        username: users.username,
        avatarUrl: users.avatarUrl,
        isActive: users.isActive,
        isBanned: users.isBanned,
        createdAt: users.createdAt,
        lastLogin: users.lastLogin,
      })
      .from(users)
      .where(eq(users.groupId, groupId))
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalResult] = await db.select({ count: count() }).from(users).where(eq(users.groupId, groupId));
    const totalUsersInGroup = Number(totalResult?.count) || 0;

    return {
      data: usersInGroupList,
      pagination: {
        total: totalUsersInGroup,
        page,
        limit,
        totalPages: Math.ceil(totalUsersInGroup / limit),
      },
    };
  }
}

export const adminUserGroupsService = new AdminUserGroupsService();
