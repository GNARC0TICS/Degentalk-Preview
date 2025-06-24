/**
 * Admin Settings Service (Refactored)
 *
 * Main orchestrator service that delegates to specialized services
 * This replaces the original monolithic AdminSettingsService
 *
 * Architecture:
 * - SettingsQueryService: All read operations
 * - SettingsCommandService: All write operations
 * - SettingsValidationService: Business logic validation
 * - SettingsGroupService: Group management operations
 */

import { logger } from '@server/src/core/logger';
import { AdminError, AdminErrorCodes } from '../../admin.errors';

// Import specialized services
import { settingsQueryService } from './services/settings-query.service';
import { settingsCommandService } from './services/settings-command.service';
import { settingsValidationService } from './services/settings-validation.service';
import { settingsGroupService } from './services/settings-group.service';

// Import types
import type {
	UpdateSettingInput,
	UpdateSettingsInput,
	SettingGroupInput,
	CreateSettingInput,
	UpdateSettingMetadataInput,
	FilterSettingsInput
} from './settings.validators';
import type { ToggleFeatureFlagInput } from './services/settings-command.service';

export class AdminSettingsService {
	// =================================
	// READ OPERATIONS (Query Service)
	// =================================

	/**
	 * Get all settings with optional filtering
	 */
	async getAllSettings(filters?: FilterSettingsInput) {
		return settingsQueryService.getAllSettings(filters);
	}

	/**
	 * Get a single setting by key
	 */
	async getSettingByKey(key: string) {
		return settingsQueryService.getSettingByKey(key);
	}

	/**
	 * Get all feature flags
	 */
	async getAllFeatureFlags() {
		return settingsQueryService.getAllFeatureFlags();
	}

	/**
	 * Search settings by text
	 */
	async searchSettings(searchTerm: string, limit?: number) {
		return settingsQueryService.searchSettings(searchTerm, limit);
	}

	/**
	 * Get settings grouped by their group field
	 */
	async getSettingsByGroups() {
		return settingsQueryService.getSettingsByGroups();
	}

	// =================================
	// WRITE OPERATIONS (Command Service)
	// =================================

	/**
	 * Update a single setting
	 */
	async updateSetting(data: UpdateSettingInput) {
		return settingsCommandService.updateSetting(data);
	}

	/**
	 * Update multiple settings in a transaction
	 */
	async updateSettings(data: UpdateSettingsInput) {
		return settingsCommandService.updateSettings(data);
	}

	/**
	 * Create a new setting
	 */
	async createSetting(data: CreateSettingInput) {
		return settingsCommandService.createSetting(data);
	}

	/**
	 * Update setting metadata
	 */
	async updateSettingMetadata(key: string, data: UpdateSettingMetadataInput) {
		return settingsCommandService.updateSettingMetadata(key, data);
	}

	/**
	 * Delete a setting
	 */
	async deleteSetting(key: string) {
		return settingsCommandService.deleteSetting(key);
	}

	/**
	 * Update feature flag
	 */
	async updateFeatureFlag(data: ToggleFeatureFlagInput) {
		return settingsCommandService.updateFeatureFlag(data);
	}

	// =================================
	// GROUP OPERATIONS (Group Service)
	// =================================

	/**
	 * Get all setting groups
	 */
	async getAllSettingGroups() {
		return settingsGroupService.getAllSettingGroups();
	}

	/**
	 * Create a setting group
	 */
	async createSettingGroup(data: SettingGroupInput) {
		return settingsGroupService.createSettingGroup(data);
	}

	/**
	 * Update a setting group
	 */
	async updateSettingGroup(key: string, data: SettingGroupInput) {
		return settingsGroupService.updateSettingGroup(key, data);
	}

	/**
	 * Delete a setting group
	 */
	async deleteSettingGroup(key: string, newGroupKey?: string) {
		return settingsGroupService.deleteSettingGroup(key, newGroupKey);
	}

	/**
	 * Move settings to a group
	 */
	async moveSettingsToGroup(settingKeys: string[], targetGroupKey: string | null) {
		return settingsGroupService.moveSettingsToGroup(settingKeys, targetGroupKey);
	}

	/**
	 * Get settings in a specific group
	 */
	async getSettingsInGroup(groupKey: string | null) {
		return settingsGroupService.getSettingsInGroup(groupKey);
	}

	// =================================
	// VALIDATION OPERATIONS (Validation Service)
	// =================================

	/**
	 * Validate setting exists
	 */
	async validateSettingExists(key: string) {
		return settingsValidationService.validateSettingExists(key);
	}

	/**
	 * Validate setting value
	 */
	async validateSettingValue(key: string, value: any) {
		return settingsValidationService.validateSettingValue(key, value);
	}

	/**
	 * Validate new setting data
	 */
	async validateNewSettingData(data: CreateSettingInput) {
		return settingsValidationService.validateNewSettingData(data);
	}

	// =================================
	// UTILITY & CONVENIENCE METHODS
	// =================================

	/**
	 * Bulk operation: Create multiple settings
	 */
	async createMultipleSettings(settings: CreateSettingInput[]) {
		try {
			const results = [];
			for (const setting of settings) {
				const result = await this.createSetting(setting);
				results.push(result);
			}
			return results;
		} catch (error) {
			logger.error('AdminSettingsService', 'Error creating multiple settings', {
				error: error.message,
				settingsCount: settings.length
			});
			throw new AdminError('Failed to create multiple settings', 500, AdminErrorCodes.DB_ERROR);
		}
	}

	/**
	 * Reset setting to default value (if available)
	 */
	async resetSettingToDefault(key: string) {
		try {
			// This would require a default_value column in the schema
			// For now, throw an error indicating the feature needs implementation
			throw new AdminError(
				'Reset to default not implemented - requires schema update',
				501,
				AdminErrorCodes.NOT_IMPLEMENTED
			);
		} catch (error) {
			if (error instanceof AdminError) throw error;

			logger.error('AdminSettingsService', 'Error resetting setting to default', {
				error: error.message,
				key
			});
			throw new AdminError('Failed to reset setting', 500, AdminErrorCodes.DB_ERROR);
		}
	}

	/**
	 * Export settings configuration
	 */
	async exportSettings(includePrivate: boolean = false) {
		try {
			const filters: FilterSettingsInput = {};
			if (!includePrivate) {
				filters.isPublic = true;
			}

			const settings = await this.getAllSettings(filters);

			return {
				exportedAt: new Date().toISOString(),
				settingsCount: settings.length,
				includePrivate,
				settings: settings.map((setting) => ({
					key: setting.key,
					name: setting.name,
					value: setting.value,
					type: setting.type,
					group: setting.group,
					description: setting.description,
					isPublic: setting.isPublic
				}))
			};
		} catch (error) {
			logger.error('AdminSettingsService', 'Error exporting settings', {
				error: error.message,
				includePrivate
			});
			throw new AdminError('Failed to export settings', 500, AdminErrorCodes.DB_ERROR);
		}
	}

	/**
	 * Get service health status
	 */
	async getServiceHealth() {
		try {
			const totalSettings = await this.getAllSettings();
			const groups = await this.getAllSettingGroups();
			const featureFlags = await this.getAllFeatureFlags();

			return {
				status: 'healthy',
				timestamp: new Date().toISOString(),
				metrics: {
					totalSettings: totalSettings.length,
					totalGroups: groups.length,
					totalFeatureFlags: featureFlags.length,
					services: {
						query: 'operational',
						command: 'operational',
						validation: 'operational',
						group: 'operational'
					}
				}
			};
		} catch (error) {
			logger.error('AdminSettingsService', 'Service health check failed', {
				error: error.message
			});
			return {
				status: 'unhealthy',
				timestamp: new Date().toISOString(),
				error: error.message
			};
		}
	}
}

// Export singleton instance (maintains backward compatibility)
export const adminSettingsService = new AdminSettingsService();

// Also export the class for dependency injection or testing
export { AdminSettingsService };
