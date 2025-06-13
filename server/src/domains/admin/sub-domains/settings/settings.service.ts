/**
 * Admin Settings Service
 *
 * Handles business logic for platform settings management.
 */

import { db } from '@db';
import { siteSettings } from '@schema';
import { eq, and, sql, or, like, ilike, asc, desc } from 'drizzle-orm';
import { AdminError, AdminErrorCodes } from '../../admin.errors';
import type {
	UpdateSettingInput,
	UpdateSettingsInput,
	SettingGroupInput,
	CreateSettingInput,
	UpdateSettingMetadataInput,
	FilterSettingsInput
} from './settings.validators';

export class AdminSettingsService {
	/**
	 * Get all settings with optional filtering
	 */
	async getAllSettings(filters?: FilterSettingsInput) {
		try {
			let query = db.select().from(siteSettings);

			// Apply filters if provided
			if (filters) {
				let conditions = [];

				if (filters.group) {
					conditions.push(eq(siteSettings.group, filters.group));
				}

				if (filters.isPublic !== undefined) {
					conditions.push(eq(siteSettings.isPublic, filters.isPublic));
				}

				if (filters.search) {
					conditions.push(
						or(
							ilike(siteSettings.key, `%${filters.search}%`),
							ilike(siteSettings.name, `%${filters.search}%`),
							ilike(siteSettings.description, `%${filters.search}%`)
						)
					);
				}

				if (conditions.length > 0) {
					query = query.where(and(...conditions));
				}
			}

			// Get settings with groups
			const allSettings = await query.orderBy(asc(siteSettings.group), asc(siteSettings.key));

			// Return settings directly as we don't need to fetch groups separately
			return allSettings.map((setting) => ({
				...setting,
				group: setting.group || null
			}));
		} catch (error) {
			console.error('Error fetching settings:', error);
			throw new AdminError('Failed to fetch settings', 500, AdminErrorCodes.DB_ERROR);
		}
	}

	/**
	 * Get a single setting by key
	 */
	async getSettingByKey(key: string) {
		try {
			const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));

			if (!setting) {
				throw new AdminError(`Setting with key "${key}" not found`, 404, AdminErrorCodes.NOT_FOUND);
			}

			return setting;
		} catch (error) {
			if (error instanceof AdminError) throw error;
			console.error('Error fetching setting:', error);
			throw new AdminError('Failed to fetch setting', 500, AdminErrorCodes.DB_ERROR);
		}
	}

	/**
	 * Update a single setting
	 */
	async updateSetting(data: UpdateSettingInput) {
		try {
			const { key, value, description } = data;

			// Check if setting exists
			const [existingSetting] = await db
				.select()
				.from(siteSettings)
				.where(eq(siteSettings.key, key));

			if (!existingSetting) {
				throw new AdminError(`Setting with key "${key}" not found`, 404, AdminErrorCodes.NOT_FOUND);
			}

			// Validate value type matches setting type
			this.validateSettingValue(existingSetting.type, value);

			// Create update data
			const updateData: any = {
				value: typeof value === 'object' ? JSON.stringify(value) : String(value),
				updatedAt: new Date()
			};

			if (description !== undefined) {
				updateData.description = description;
			}

			// Update the setting
			const [updatedSetting] = await db
				.update(siteSettings)
				.set(updateData)
				.where(eq(siteSettings.key, key))
				.returning();

			return updatedSetting;
		} catch (error) {
			if (error instanceof AdminError) throw error;
			console.error('Error updating setting:', error);
			throw new AdminError('Failed to update setting', 500, AdminErrorCodes.DB_ERROR);
		}
	}

	/**
	 * Update multiple settings at once
	 */
	async updateSettings(data: UpdateSettingsInput) {
		try {
			const results = [];

			for (const setting of data.settings) {
				const result = await this.updateSetting(setting);
				results.push(result);
			}

			return results;
		} catch (error) {
			if (error instanceof AdminError) throw error;
			console.error('Error updating settings:', error);
			throw new AdminError('Failed to update settings', 500, AdminErrorCodes.DB_ERROR);
		}
	}

	/**
	 * Get all setting groups
	 */
	async getAllSettingGroups() {
		try {
			// Get unique groups from siteSettings
			const groups = await db
				.select({
					group: siteSettings.group
				})
				.from(siteSettings)
				.groupBy(siteSettings.group)
				.orderBy(asc(siteSettings.group));

			// Transform to expected format
			return groups.map((g) => ({
				key: g.group,
				name: g.group,
				description: null,
				sortOrder: 0
			}));
		} catch (error) {
			console.error('Error fetching setting groups:', error);
			throw new AdminError('Failed to fetch setting groups', 500, AdminErrorCodes.DB_ERROR);
		}
	}

	/**
	 * Create a new setting group
	 */
	async createSettingGroup(data: SettingGroupInput) {
		// Since we don't have a separate settingGroups table, this is a no-op
		// We'll just return the input data as if it was created
		return {
			key: data.key,
			name: data.name,
			description: data.description,
			sortOrder: data.sortOrder,
			createdAt: new Date(),
			updatedAt: new Date()
		};
	}

	/**
	 * Update a setting group
	 */
	async updateSettingGroup(key: string, data: SettingGroupInput) {
		try {
			// Check if any settings use this group
			const [settingCount] = await db
				.select({
					count: sql`count(*)`
				})
				.from(siteSettings)
				.where(eq(siteSettings.group, key));

			// If settings exist with this group, update them
			if (Number(settingCount?.count) > 0) {
				// Update all settings that use the old group key
				await db.update(siteSettings).set({ group: data.key }).where(eq(siteSettings.group, key));
			}

			// Return the updated group data
			return {
				key: data.key,
				name: data.name,
				description: data.description,
				sortOrder: data.sortOrder,
				updatedAt: new Date()
			};
		} catch (error) {
			console.error('Error updating setting group:', error);
			throw new AdminError('Failed to update setting group', 500, AdminErrorCodes.DB_ERROR);
		}
	}

	/**
	 * Delete a setting group and optionally reassign settings
	 */
	async deleteSettingGroup(key: string, newGroupKey?: string) {
		try {
			// Check if there are settings in this group
			const [settingCount] = await db
				.select({
					count: sql`count(*)`
				})
				.from(siteSettings)
				.where(eq(siteSettings.group, key));

			// If settings exist and no new group is provided, raise error
			if (Number(settingCount?.count) > 0 && !newGroupKey) {
				throw new AdminError(
					'This group contains settings. Provide a new group key to reassign them before deleting.',
					400,
					AdminErrorCodes.OPERATION_FAILED
				);
			}

			// If new group key is provided and settings exist, reassign them
			if (newGroupKey && Number(settingCount?.count) > 0) {
				// Reassign settings to the new group
				await db
					.update(siteSettings)
					.set({ group: newGroupKey })
					.where(eq(siteSettings.group, key));
			}

			return {
				success: true,
				message: 'Setting group deleted successfully',
				reassignedSettings: Number(settingCount?.count) > 0
			};
		} catch (error) {
			if (error instanceof AdminError) throw error;
			console.error('Error deleting setting group:', error);
			throw new AdminError('Failed to delete setting group', 500, AdminErrorCodes.DB_ERROR);
		}
	}

	/**
	 * Create a new platform setting
	 */
	async createSetting(data: CreateSettingInput) {
		try {
			// Check for duplicate key
			const [existingSetting] = await db
				.select({ key: siteSettings.key })
				.from(siteSettings)
				.where(eq(siteSettings.key, data.key));

			if (existingSetting) {
				throw new AdminError(
					`Setting with key "${data.key}" already exists`,
					400,
					AdminErrorCodes.DUPLICATE_ENTRY
				);
			}

			// If group is provided, verify it exists
			if (data.group) {
				const [group] = await db
					.select({ key: siteSettings.group })
					.from(siteSettings)
					.where(eq(siteSettings.group, data.group));

				if (!group) {
					throw new AdminError(
						`Group with key "${data.group}" not found`,
						400,
						AdminErrorCodes.NOT_FOUND
					);
				}
			}

			// Validate initial value if provided
			if (data.value !== undefined) {
				this.validateSettingValue(data.type, data.value);
			}

			// Use default value if no value is provided
			const value = data.value !== undefined ? data.value : data.defaultValue;

			const [newSetting] = await db
				.insert(siteSettings)
				.values({
					key: data.key,
					name: data.name,
					description: data.description,
					type: data.type,
					defaultValue:
						typeof data.defaultValue === 'object'
							? JSON.stringify(data.defaultValue)
							: data.defaultValue !== undefined
								? String(data.defaultValue)
								: null,
					value:
						typeof value === 'object'
							? JSON.stringify(value)
							: value !== undefined
								? String(value)
								: null,
					group: data.group,
					isPublic: data.isPublic,
					isRequired: data.isRequired,
					validationRules: data.validationRules ? JSON.stringify(data.validationRules) : null,
					options: data.options ? JSON.stringify(data.options) : null,
					sortOrder: data.sortOrder,
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.returning();

			return newSetting;
		} catch (error) {
			if (error instanceof AdminError) throw error;
			console.error('Error creating setting:', error);
			throw new AdminError('Failed to create setting', 500, AdminErrorCodes.DB_ERROR);
		}
	}

	/**
	 * Update setting metadata (not the value)
	 */
	async updateSettingMetadata(key: string, data: UpdateSettingMetadataInput) {
		try {
			// Check if setting exists
			const [existingSetting] = await db
				.select()
				.from(siteSettings)
				.where(eq(siteSettings.key, key));

			if (!existingSetting) {
				throw new AdminError(`Setting with key "${key}" not found`, 404, AdminErrorCodes.NOT_FOUND);
			}

			// If group is provided, verify it exists
			if (data.group) {
				const [group] = await db
					.select({ key: siteSettings.group })
					.from(siteSettings)
					.where(eq(siteSettings.group, data.group));

				if (!group) {
					throw new AdminError(
						`Group with key "${data.group}" not found`,
						400,
						AdminErrorCodes.NOT_FOUND
					);
				}
			}

			const [updatedSetting] = await db
				.update(siteSettings)
				.set({
					name: data.name !== undefined ? data.name : existingSetting.name,
					description:
						data.description !== undefined ? data.description : existingSetting.description,
					isPublic: data.isPublic !== undefined ? data.isPublic : existingSetting.isPublic,
					isRequired: data.isRequired !== undefined ? data.isRequired : existingSetting.isRequired,
					group: data.group !== undefined ? data.group : existingSetting.group,
					validationRules:
						data.validationRules !== undefined
							? JSON.stringify(data.validationRules)
							: existingSetting.validationRules,
					options:
						data.options !== undefined ? JSON.stringify(data.options) : existingSetting.options,
					sortOrder: data.sortOrder !== undefined ? data.sortOrder : existingSetting.sortOrder,
					updatedAt: new Date()
				})
				.where(eq(siteSettings.key, key))
				.returning();

			return updatedSetting;
		} catch (error) {
			if (error instanceof AdminError) throw error;
			console.error('Error updating setting metadata:', error);
			throw new AdminError('Failed to update setting metadata', 500, AdminErrorCodes.DB_ERROR);
		}
	}

	/**
	 * Delete a setting
	 */
	async deleteSetting(key: string) {
		try {
			// Check if setting exists
			const [existingSetting] = await db
				.select()
				.from(siteSettings)
				.where(eq(siteSettings.key, key));

			if (!existingSetting) {
				throw new AdminError(`Setting with key "${key}" not found`, 404, AdminErrorCodes.NOT_FOUND);
			}

			await db.delete(siteSettings).where(eq(siteSettings.key, key));

			return { success: true, message: 'Setting deleted successfully' };
		} catch (error) {
			if (error instanceof AdminError) throw error;
			console.error('Error deleting setting:', error);
			throw new AdminError('Failed to delete setting', 500, AdminErrorCodes.DB_ERROR);
		}
	}

	/**
	 * Helper to validate setting value type
	 */
	private validateSettingValue(type: string, value: any) {
		switch (type) {
			case 'string':
				if (typeof value !== 'string') {
					throw new AdminError(
						`Value must be a string for setting type "string"`,
						400,
						AdminErrorCodes.VALIDATION_ERROR
					);
				}
				break;
			case 'number':
				if (typeof value !== 'number' && (typeof value !== 'string' || isNaN(Number(value)))) {
					throw new AdminError(
						`Value must be a number for setting type "number"`,
						400,
						AdminErrorCodes.VALIDATION_ERROR
					);
				}
				break;
			case 'boolean':
				if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
					throw new AdminError(
						`Value must be a boolean for setting type "boolean"`,
						400,
						AdminErrorCodes.VALIDATION_ERROR
					);
				}
				break;
			case 'json':
				try {
					if (typeof value === 'string') {
						JSON.parse(value);
					} else if (typeof value !== 'object') {
						throw new Error('Not an object');
					}
				} catch (e) {
					throw new AdminError(
						`Value must be valid JSON for setting type "json"`,
						400,
						AdminErrorCodes.VALIDATION_ERROR
					);
				}
				break;
			case 'array':
				if (
					!Array.isArray(value) &&
					(typeof value !== 'string' || !value.startsWith('[') || !value.endsWith(']'))
				) {
					throw new AdminError(
						`Value must be an array for setting type "array"`,
						400,
						AdminErrorCodes.VALIDATION_ERROR
					);
				}
				break;
		}
		return true;
	}
}

export const adminSettingsService = new AdminSettingsService();
