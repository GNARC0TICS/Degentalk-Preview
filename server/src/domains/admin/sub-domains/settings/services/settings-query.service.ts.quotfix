/**
 * Settings Query Service
 *
 * Handles all read operations for settings management
 * Focused on data retrieval with filtering, search, and formatting
 */

import { db } from '@db';
import { siteSettings, featureFlags } from '@schema';
import { eq, and, or, ilike, asc } from 'drizzle-orm';
import { logger } from '@core/logger';
import { AdminError, AdminErrorCodes } from '../../../admin.errors';
import {
	adminCacheService,
	AdminCacheKeys,
	CacheResult
} from '../../../shared/admin-cache.service';
import type { FilterSettingsInput } from '../settings.validators';

export class SettingsQueryService {
	/**
	 * Get all settings with optional filtering and search
	 */
	async getAllSettings(filters?: FilterSettingsInput) {
		try {
			// Use cache for unfiltered settings queries
			if (!filters) {
				return await adminCacheService.getOrSet(AdminCacheKeys.settings(), async () => {
					return await this.fetchSettingsFromDB();
				});
			}

			// For filtered queries, bypass cache to ensure accuracy
			return await this.fetchSettingsFromDB(filters);
		} catch (error) {
			logger.error('Failed to get settings:', error);
			throw new AdminError('Failed to retrieve settings', 500, AdminErrorCodes.DB_ERROR, {
				originalError: error.message,
				filters
			});
		}
	}

	/**
	 * Fetch settings from database with optional filtering
	 */
	private async fetchSettingsFromDB(filters?: FilterSettingsInput) {
		let query = db.select().from(siteSettings);

		// Apply filters if provided
		if (filters) {
			const conditions = this.buildFilterConditions(filters);
			if (conditions.length > 0) {
				query = query.where(and(...conditions));
			}
		}

		// Get settings ordered by group and key
		const allSettings = await query.orderBy(asc(siteSettings.group), asc(siteSettings.key));

		// Format results with consistent structure
		return allSettings.map((setting) => ({
			...setting,
			group: setting.group || null
		}));
	}

	/**
	 * Get a single setting by key
	 */
	async getSettingByKey(key: string) {
		try {
			if (!key || typeof key !== 'string') {
				throw new AdminError('Setting key is required', 400, AdminErrorCodes.INVALID_REQUEST);
			}

			const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));

			if (!setting) {
				throw new AdminError(`Setting with key "${key}" not found`, 404, AdminErrorCodes.NOT_FOUND);
			}

			return setting;
		} catch (error) {
			if (error instanceof AdminError) throw error;

			logger.error('SettingsQueryService', 'Error fetching setting by key', {
				error: error.message,
				key
			});
			throw new AdminError('Failed to fetch setting', 500, AdminErrorCodes.DB_ERROR);
		}
	}

	/**
	 * Get all feature flags with their status
	 */
	async getAllFeatureFlags() {
		try {
			const flags = await db.select().from(featureFlags).orderBy(asc(featureFlags.key));

			// Format feature flags with computed status
			return flags.map((flag) => ({
				...flag,
				isFullyRolledOut: flag.rolloutPercentage >= 100,
				isDisabled: !flag.enabled,
				effectiveStatus: flag.enabled
					? flag.rolloutPercentage >= 100
						? 'enabled'
						: 'partial'
					: 'disabled'
			}));
		} catch (error) {
			logger.error('SettingsQueryService', 'Error fetching feature flags', {
				error: error.message
			});
			throw new AdminError('Failed to fetch feature flags', 500, AdminErrorCodes.DB_ERROR);
		}
	}

	/**
	 * Search settings by text across key, name, and description
	 */
	async searchSettings(searchTerm: string, limit: number = 50) {
		try {
			if (!searchTerm || searchTerm.length < 2) {
				return [];
			}

			const results = await db
				.select()
				.from(siteSettings)
				.where(
					or(
						ilike(siteSettings.key, `%${searchTerm}%`),
						ilike(siteSettings.name, `%${searchTerm}%`),
						ilike(siteSettings.description, `%${searchTerm}%`)
					)
				)
				.limit(limit)
				.orderBy(asc(siteSettings.key));

			return results;
		} catch (error) {
			logger.error('SettingsQueryService', 'Error searching settings', {
				error: error.message,
				searchTerm
			});
			throw new AdminError('Failed to search settings', 500, AdminErrorCodes.DB_ERROR);
		}
	}

	/**
	 * Get settings grouped by their group field
	 */
	async getSettingsByGroups() {
		try {
			const settings = await this.getAllSettings();

			// Group settings by their group field
			const grouped = settings.reduce(
				(acc, setting) => {
					const group = setting.group || 'ungrouped';
					if (!acc[group]) {
						acc[group] = [];
					}
					acc[group].push(setting);
					return acc;
				},
				{} as Record<string, typeof settings>
			);

			return grouped;
		} catch (error) {
			logger.error('SettingsQueryService', 'Error grouping settings', {
				error: error.message
			});
			throw new AdminError('Failed to group settings', 500, AdminErrorCodes.DB_ERROR);
		}
	}

	/**
	 * Check if a setting exists by key
	 */
	async settingExists(key: string): Promise<boolean> {
		try {
			const [setting] = await db
				.select({ key: siteSettings.key })
				.from(siteSettings)
				.where(eq(siteSettings.key, key))
				.limit(1);

			return !!setting;
		} catch (error) {
			logger.error('SettingsQueryService', 'Error checking setting existence', {
				error: error.message,
				key
			});
			return false;
		}
	}

	/**
	 * Private helper to build filter conditions for queries
	 */
	private buildFilterConditions(filters: FilterSettingsInput) {
		const conditions = [];

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

		return conditions;
	}
}

// Export singleton instance
export const settingsQueryService = new SettingsQueryService();
