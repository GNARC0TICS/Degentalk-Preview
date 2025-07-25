/**
 * Settings Command Service
 *
 * Handles all write operations for settings management
 * Focused on create, update, delete operations with proper validation
 */

import { db } from '@db';
import { siteSettings, featureFlags } from '@schema';
import { eq } from 'drizzle-orm';
import { logger } from '@core/logger';
import { AdminError, AdminErrorCodes } from '../../admin.errors';
import { adminCacheService } from '../../shared';
import { settingsQueryService } from './settings-query.service';
import { settingsValidationService } from './settings-validation.service';
import type {
	UpdateSettingInput,
	UpdateSettingsInput,
	CreateSettingInput,
	UpdateSettingMetadataInput
} from '../settings.validators';

// For the feature flag input type
export type ToggleFeatureFlagInput = {
	key: string;
	enabled?: boolean;
	rolloutPercentage?: number;
};

export class SettingsCommandService {
	/**
	 * Update a single setting value
	 */
	async updateSetting(data: UpdateSettingInput) {
		try {
			const { key, value, description } = data;

			// Validate setting exists
			await settingsValidationService.validateSettingExists(key);

			// Validate the new value
			await settingsValidationService.validateSettingValue(key, value);

			// Prepare update data
			const updateData: any = {
				value: String(value),
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

			// Invalidate cache after successful update
			await adminCacheService.invalidateEntity('setting', key);

			logger.info('SettingsCommandService', 'Setting updated successfully', {
				key,
				oldValue: 'redacted',
				newValue: 'redacted'
			});

			return updatedSetting;
		} catch (error) {
			if (error instanceof AdminError) throw error;

			logger.error('SettingsCommandService', 'Error updating setting', {
				error: error.message,
				key: data.key
			});
			throw new AdminError('Failed to update setting', 500, AdminErrorCodes.DB_ERROR);
		}
	}

	/**
	 * Update multiple settings in a transaction
	 */
	async updateSettings(data: UpdateSettingsInput) {
		try {
			const { settings } = data;

			if (!settings || settings.length === 0) {
				throw new AdminError(
					'No settings provided for update',
					400,
					AdminErrorCodes.INVALID_REQUEST
				);
			}

			// Validate all settings before updating
			for (const setting of settings) {
				await settingsValidationService.validateSettingExists(setting.key);
				await settingsValidationService.validateSettingValue(setting.key, setting.value);
			}

			const updatedSettings = [];

			// Use transaction for multiple updates
			await db.transaction(async (tx) => {
				for (const setting of settings) {
					const [updated] = await tx
						.update(siteSettings)
						.set({
							value: String(setting.value),
							updatedAt: new Date()
						})
						.where(eq(siteSettings.key, setting.key))
						.returning();

					updatedSettings.push(updated);
				}
			});

			logger.info('SettingsCommandService', 'Bulk settings update completed', {
				settingsCount: settings.length,
				keys: settings.map((s) => s.key)
			});

			return updatedSettings;
		} catch (error) {
			if (error instanceof AdminError) throw error;

			logger.error('SettingsCommandService', 'Error updating multiple settings', {
				error: error.message,
				settingsCount: data.settings?.length
			});
			throw new AdminError('Failed to update settings', 500, AdminErrorCodes.DB_ERROR);
		}
	}

	/**
	 * Create a new setting
	 */
	async createSetting(data: CreateSettingInput) {
		try {
			const { key, name, value, type, group, description, isPublic } = data;

			// Validate setting doesn't already exist
			await settingsValidationService.validateSettingNotExists(key);

			// Validate the setting data
			await settingsValidationService.validateNewSettingData(data);

			// Create the setting
			const [newSetting] = await db
				.insert(siteSettings)
				.values({
					key,
					name,
					value: String(value),
					type: type || 'string',
					group: group || null,
					description: description || null,
					isPublic: isPublic ?? false,
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.returning();

			logger.info('SettingsCommandService', 'Setting created successfully', {
				key,
				type: type || 'string',
				group: group || 'none'
			});

			return newSetting;
		} catch (error) {
			if (error instanceof AdminError) throw error;

			logger.error('SettingsCommandService', 'Error creating setting', {
				error: error.message,
				key: data.key
			});
			throw new AdminError('Failed to create setting', 500, AdminErrorCodes.DB_ERROR);
		}
	}

	/**
	 * Update setting metadata (name, description, type, etc.)
	 */
	async updateSettingMetadata(key: string, data: UpdateSettingMetadataInput) {
		try {
			// Validate setting exists
			await settingsValidationService.validateSettingExists(key);

			// Validate metadata
			await settingsValidationService.validateSettingMetadata(data);

			// Prepare update data
			const updateData: any = {
				updatedAt: new Date()
			};

			if (data.name !== undefined) updateData.name = data.name;
			if (data.description !== undefined) updateData.description = data.description;
			if (data.type !== undefined) updateData.type = data.type;
			if (data.group !== undefined) updateData.group = data.group;
			if (data.isPublic !== undefined) updateData.isPublic = data.isPublic;

			// Update metadata
			const [updatedSetting] = await db
				.update(siteSettings)
				.set(updateData)
				.where(eq(siteSettings.key, key))
				.returning();

			logger.info('SettingsCommandService', 'Setting metadata updated', {
				key,
				updatedFields: Object.keys(updateData).filter((k) => k !== 'updatedAt')
			});

			return updatedSetting;
		} catch (error) {
			if (error instanceof AdminError) throw error;

			logger.error('SettingsCommandService', 'Error updating setting metadata', {
				error: error.message,
				key
			});
			throw new AdminError('Failed to update setting metadata', 500, AdminErrorCodes.DB_ERROR);
		}
	}

	/**
	 * Delete a setting
	 */
	async deleteSetting(key: string) {
		try {
			// Validate setting exists and can be deleted
			await settingsValidationService.validateSettingCanBeDeleted(key);

			// Delete the setting
			const [deletedSetting] = await db
				.delete(siteSettings)
				.where(eq(siteSettings.key, key))
				.returning();

			if (!deletedSetting) {
				throw new AdminError(`Setting with key "${key}" not found`, 404, AdminErrorCodes.NOT_FOUND);
			}

			logger.info('SettingsCommandService', 'Setting deleted successfully', { key });

			return { success: true, deletedSetting };
		} catch (error) {
			if (error instanceof AdminError) throw error;

			logger.error('SettingsCommandService', 'Error deleting setting', {
				error: error.message,
				key
			});
			throw new AdminError('Failed to delete setting', 500, AdminErrorCodes.DB_ERROR);
		}
	}

	/**
	 * Toggle feature flag status
	 */
	async updateFeatureFlag({ key, enabled, rolloutPercentage }: ToggleFeatureFlagInput) {
		try {
			// Validate feature flag exists
			const existingFlag = await this.getFeatureFlag(key);

			// Validate rollout percentage
			if (rolloutPercentage !== undefined && (rolloutPercentage < 0 || rolloutPercentage > 100)) {
				throw new AdminError(
					'Rollout percentage must be between 0 and 100',
					400,
					AdminErrorCodes.INVALID_REQUEST
				);
			}

			// Prepare update data
			const updateData: any = {
				updatedAt: new Date()
			};

			if (enabled !== undefined) updateData.enabled = enabled;
			if (rolloutPercentage !== undefined) updateData.rolloutPercentage = rolloutPercentage;

			// Update feature flag
			const [updatedFlag] = await db
				.update(featureFlags)
				.set(updateData)
				.where(eq(featureFlags.key, key))
				.returning();

			logger.info('SettingsCommandService', 'Feature flag updated', {
				key,
				enabled: updateData.enabled,
				rolloutPercentage: updateData.rolloutPercentage
			});

			return updatedFlag;
		} catch (error) {
			if (error instanceof AdminError) throw error;

			logger.error('SettingsCommandService', 'Error updating feature flag', {
				error: error.message,
				key
			});
			throw new AdminError('Failed to update feature flag', 500, AdminErrorCodes.DB_ERROR);
		}
	}

	/**
	 * Private helper to get feature flag
	 */
	private async getFeatureFlag(key: string) {
		const [flag] = await db.select().from(featureFlags).where(eq(featureFlags.key, key));

		if (!flag) {
			throw new AdminError(`Feature flag "${key}" not found`, 404, AdminErrorCodes.NOT_FOUND);
		}

		return flag;
	}
}

// Export singleton instance
export const settingsCommandService = new SettingsCommandService();
