/**
 * Settings Group Service
 *
 * Handles setting group management operations
 * Focused on organizing settings into logical groups for better admin UX
 */

import { db } from '@db';
import { siteSettings } from '@schema';
import { eq, sql, and, ne } from 'drizzle-orm';
import { logger } from '@server/src/core/logger';
import { AdminError, AdminErrorCodes } from '../../../admin.errors';
import type { SettingGroupInput } from '../settings.validators';

export class SettingsGroupService {
	/**
	 * Get all setting groups with their setting counts
	 */
	async getAllSettingGroups() {
		try {
			// Get groups with setting counts
			const groupStats = await db
				.select({
					group: siteSettings.group,
					count: sql<number>`count(*)::integer`,
					publicCount: sql<number>`sum(case when ${siteSettings.isPublic} then 1 else 0 end)::integer`
				})
				.from(siteSettings)
				.where(ne(siteSettings.group, null))
				.groupBy(siteSettings.group)
				.orderBy(siteSettings.group);

			// Format the results
			const groups = groupStats.map((stat) => ({
				key: stat.group,
				name: this.formatGroupName(stat.group),
				settingsCount: stat.count,
				publicSettingsCount: stat.publicCount,
				privateSettingsCount: stat.count - stat.publicCount
			}));

			// Add ungrouped settings count
			const [ungroupedCount] = await db
				.select({
					count: sql<number>`count(*)::integer`
				})
				.from(siteSettings)
				.where(eq(siteSettings.group, null));

			if (ungroupedCount.count > 0) {
				groups.push({
					key: null,
					name: 'Ungrouped',
					settingsCount: ungroupedCount.count,
					publicSettingsCount: 0,
					privateSettingsCount: ungroupedCount.count
				});
			}

			return groups;
		} catch (error) {
			logger.error('SettingsGroupService', 'Error fetching setting groups', {
				error: error.message
			});
			throw new AdminError('Failed to fetch setting groups', 500, AdminErrorCodes.DB_ERROR);
		}
	}

	/**
	 * Create a new setting group
	 */
	async createSettingGroup(data: SettingGroupInput) {
		try {
			const { groupKey, name, description } = data;

			// Validate group doesn't already exist
			await this.validateGroupNotExists(groupKey);

			// Validate group key format
			if (!/^[a-z0-9_]+$/.test(groupKey)) {
				throw new AdminError(
					'Group key must contain only lowercase letters, numbers, and underscores',
					400,
					AdminErrorCodes.VALIDATION_ERROR
				);
			}

			// Since we don't have a separate groups table, we create a placeholder setting
			// This is a design choice - groups are implicit based on settings that reference them
			const groupInfo = {
				group: groupKey,
				name: name || this.formatGroupName(groupKey),
				description,
				createdAt: new Date()
			};

			logger.info('SettingsGroupService', 'Setting group created', {
				groupKey,
				name: groupInfo.name
			});

			return groupInfo;
		} catch (error) {
			if (error instanceof AdminError) throw error;

			logger.error('SettingsGroupService', 'Error creating setting group', {
				error: error.message,
				groupKey: data.groupKey
			});
			throw new AdminError('Failed to create setting group', 500, AdminErrorCodes.DB_ERROR);
		}
	}

	/**
	 * Update a setting group (rename all settings in the group)
	 */
	async updateSettingGroup(oldGroupKey: string, data: SettingGroupInput) {
		try {
			const { groupKey: newGroupKey, name } = data;

			// Validate old group exists
			await this.validateGroupExists(oldGroupKey);

			// If changing group key, validate new key doesn't exist
			if (newGroupKey !== oldGroupKey) {
				await this.validateGroupNotExists(newGroupKey);

				// Update all settings in the group
				await db
					.update(siteSettings)
					.set({
						group: newGroupKey,
						updatedAt: new Date()
					})
					.where(eq(siteSettings.group, oldGroupKey));

				logger.info('SettingsGroupService', 'Setting group key updated', {
					oldGroupKey,
					newGroupKey,
					name
				});
			}

			return {
				group: newGroupKey,
				name: name || this.formatGroupName(newGroupKey),
				updatedAt: new Date()
			};
		} catch (error) {
			if (error instanceof AdminError) throw error;

			logger.error('SettingsGroupService', 'Error updating setting group', {
				error: error.message,
				oldGroupKey,
				newGroupKey: data.groupKey
			});
			throw new AdminError('Failed to update setting group', 500, AdminErrorCodes.DB_ERROR);
		}
	}

	/**
	 * Delete a setting group (move all settings to another group or ungrouped)
	 */
	async deleteSettingGroup(groupKey: string, newGroupKey?: string) {
		try {
			// Validate group exists
			await this.validateGroupExists(groupKey);

			// If moving to another group, validate it exists
			if (newGroupKey) {
				await this.validateGroupExists(newGroupKey);
			}

			// Update all settings in the group
			await db
				.update(siteSettings)
				.set({
					group: newGroupKey || null,
					updatedAt: new Date()
				})
				.where(eq(siteSettings.group, groupKey));

			logger.info('SettingsGroupService', 'Setting group deleted', {
				deletedGroup: groupKey,
				movedToGroup: newGroupKey || 'ungrouped'
			});

			return {
				success: true,
				deletedGroup: groupKey,
				movedToGroup: newGroupKey || null
			};
		} catch (error) {
			if (error instanceof AdminError) throw error;

			logger.error('SettingsGroupService', 'Error deleting setting group', {
				error: error.message,
				groupKey,
				newGroupKey
			});
			throw new AdminError('Failed to delete setting group', 500, AdminErrorCodes.DB_ERROR);
		}
	}

	/**
	 * Move settings between groups
	 */
	async moveSettingsToGroup(settingKeys: string[], targetGroupKey: string | null) {
		try {
			if (!settingKeys || settingKeys.length === 0) {
				throw new AdminError('No settings provided for move', 400, AdminErrorCodes.INVALID_REQUEST);
			}

			// Validate target group exists (if not null)
			if (targetGroupKey) {
				await this.validateGroupExists(targetGroupKey);
			}

			// Update the settings
			const results = await db
				.update(siteSettings)
				.set({
					group: targetGroupKey,
					updatedAt: new Date()
				})
				.where(sql`${siteSettings.key} = ANY(${settingKeys})`)
				.returning({ key: siteSettings.key });

			if (results.length !== settingKeys.length) {
				logger.warn('SettingsGroupService', 'Not all settings were found for group move', {
					requested: settingKeys.length,
					moved: results.length
				});
			}

			logger.info('SettingsGroupService', 'Settings moved to group', {
				settingsCount: results.length,
				targetGroup: targetGroupKey || 'ungrouped'
			});

			return {
				success: true,
				movedCount: results.length,
				targetGroup: targetGroupKey
			};
		} catch (error) {
			if (error instanceof AdminError) throw error;

			logger.error('SettingsGroupService', 'Error moving settings to group', {
				error: error.message,
				settingsCount: settingKeys?.length,
				targetGroupKey
			});
			throw new AdminError('Failed to move settings to group', 500, AdminErrorCodes.DB_ERROR);
		}
	}

	/**
	 * Get settings for a specific group
	 */
	async getSettingsInGroup(groupKey: string | null) {
		try {
			const settings = await db
				.select()
				.from(siteSettings)
				.where(groupKey ? eq(siteSettings.group, groupKey) : eq(siteSettings.group, null))
				.orderBy(siteSettings.key);

			return settings;
		} catch (error) {
			logger.error('SettingsGroupService', 'Error fetching settings in group', {
				error: error.message,
				groupKey
			});
			throw new AdminError('Failed to fetch group settings', 500, AdminErrorCodes.DB_ERROR);
		}
	}

	/**
	 * Validate that a group exists
	 */
	private async validateGroupExists(groupKey: string) {
		const [setting] = await db
			.select({ group: siteSettings.group })
			.from(siteSettings)
			.where(eq(siteSettings.group, groupKey))
			.limit(1);

		if (!setting) {
			throw new AdminError(`Setting group "${groupKey}" not found`, 404, AdminErrorCodes.NOT_FOUND);
		}
	}

	/**
	 * Validate that a group does not exist
	 */
	private async validateGroupNotExists(groupKey: string) {
		const [setting] = await db
			.select({ group: siteSettings.group })
			.from(siteSettings)
			.where(eq(siteSettings.group, groupKey))
			.limit(1);

		if (setting) {
			throw new AdminError(
				`Setting group "${groupKey}" already exists`,
				409,
				AdminErrorCodes.DUPLICATE_ENTRY
			);
		}
	}

	/**
	 * Format group key into a display name
	 */
	private formatGroupName(groupKey: string): string {
		return groupKey
			.split('_')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}
}

// Export singleton instance
export const settingsGroupService = new SettingsGroupService();
