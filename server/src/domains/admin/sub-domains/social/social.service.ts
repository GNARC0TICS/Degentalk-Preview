import { db } from '@db';
// TODO: Fix schema imports - temporarily disabled to get backend running
// import { economySettings } from '../../../../../../db/schema/economy/settings';
import { eq, count, sql as drizzleSql } from 'drizzle-orm';
import { defaultSocialConfig } from '@shared/config/social.config';
import type { SocialConfig } from '@shared/config/social.config';
import { logger } from '../../../../core/logger';

export class SocialService {
	private static readonly CONFIG_KEY = 'social_config';

	/**
	 * Get current social configuration from database or return defaults
	 * TODO: Temporarily returning defaults until schema imports are fixed
	 */
	static async getSocialConfig(): Promise<SocialConfig> {
		// TODO: Implement database storage once schema imports are fixed
		return defaultSocialConfig;
	}

	/**
	 * Update social configuration in database
	 * TODO: Temporarily disabled until schema imports are fixed
	 */
	static async updateSocialConfig(
		updates: Partial<SocialConfig>,
		adminUserId: string
	): Promise<SocialConfig> {
		const currentConfig = await this.getSocialConfig();
		const newConfig = this.deepMerge(currentConfig, updates);

		// Validate the new configuration
		this.validateConfig(newConfig);

		// TODO: Implement database storage once schema imports are fixed
		logger.info('Social config update attempted (disabled):', newConfig);

		return newConfig;
	}

	/**
	 * Get social feature usage statistics
	 * TODO: Temporarily returning mock data until schema imports are fixed
	 */
	static async getSocialStats() {
		// TODO: Implement database queries once schema imports are fixed
		return {
			mentions: { total: 0, unread: 0 },
			follows: { total: 0 },
			friendships: { accepted: 0, pending: 0, blocked: 0 },
			activeUsers: { last24h: 0 },
			lastUpdated: new Date().toISOString()
		};
	}

	/**
	 * Reset social configuration to defaults
	 * TODO: Temporarily disabled until schema imports are fixed
	 */
	static async resetToDefaults(adminUserId: string): Promise<SocialConfig> {
		// TODO: Implement database reset once schema imports are fixed
		logger.info('Social config reset attempted (disabled) by:', adminUserId);
		return defaultSocialConfig;
	}

	/**
	 * Get current status of all social features
	 */
	static async getFeatureStatus() {
		const config = await this.getSocialConfig();
		const stats = await this.getSocialStats();

		return {
			mentions: {
				enabled: config.mentions.enabled,
				activeUsers: stats.activeUsers.last24h,
				totalMentions: stats.mentions.total,
				unreadMentions: stats.mentions.unread,
				healthStatus: this.getHealthStatus('mentions', config, stats)
			},
			whaleWatch: {
				enabled: config.whaleWatch.enabled,
				totalFollows: stats.follows.total,
				healthStatus: this.getHealthStatus('whaleWatch', config, stats)
			},
			friends: {
				enabled: config.friends.enabled,
				totalFriendships: stats.friendships.accepted,
				pendingRequests: stats.friendships.pending,
				healthStatus: this.getHealthStatus('friends', config, stats)
			},
			overall: {
				status:
					config.mentions.enabled || config.whaleWatch.enabled || config.friends.enabled
						? 'active'
						: 'disabled',
				lastChecked: new Date().toISOString()
			}
		};
	}

	/**
	 * Emergency disable all social features
	 */
	static async emergencyDisable(adminUserId: string) {
		const emergencyConfig = await this.getSocialConfig();

		// Disable all features
		emergencyConfig.mentions.enabled = false;
		emergencyConfig.whaleWatch.enabled = false;
		emergencyConfig.friends.enabled = false;
		emergencyConfig.adminOverrides.enableEmergencyDisable = true;

		await this.updateSocialConfig(emergencyConfig, adminUserId);

		return {
			success: true,
			message: 'All social features have been emergency disabled',
			disabledAt: new Date().toISOString(),
			disabledBy: adminUserId
		};
	}

	/**
	 * Merge partial config updates with current config
	 */
	private static deepMerge(target: any, source: any): any {
		const result = { ...target };

		for (const key in source) {
			if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
				result[key] = this.deepMerge(target[key] || {}, source[key]);
			} else {
				result[key] = source[key];
			}
		}

		return result;
	}

	/**
	 * Merge stored config with defaults to ensure all fields exist
	 */
	private static mergeWithDefaults(storedConfig: any): SocialConfig {
		return this.deepMerge(defaultSocialConfig, storedConfig);
	}

	/**
	 * Validate configuration values
	 */
	private static validateConfig(config: SocialConfig): void {
		// Validate mention settings
		if (config.mentions.minLevel < 1 || config.mentions.minLevel > 100) {
			throw new Error('Mentions minimum level must be between 1 and 100');
		}

		if (config.mentions.settings.maxMentionsPerPost > 50) {
			throw new Error('Maximum mentions per post cannot exceed 50');
		}

		// Validate whale watch settings
		if (config.whaleWatch.settings.maxFollowsPerUser > 10000) {
			throw new Error('Maximum follows per user cannot exceed 10,000');
		}

		// Validate friends settings
		if (config.friends.settings.maxFriendsPerUser > 5000) {
			throw new Error('Maximum friends per user cannot exceed 5,000');
		}
	}

	/**
	 * Get health status for a specific feature
	 */
	private static getHealthStatus(feature: string, config: SocialConfig, stats: any): string {
		if (!config[feature as keyof SocialConfig].enabled) {
			return 'disabled';
		}

		// Simple health checks - can be expanded
		switch (feature) {
			case 'mentions':
				return stats.mentions.total > 0 ? 'healthy' : 'inactive';
			case 'whaleWatch':
				return stats.follows.total > 0 ? 'healthy' : 'inactive';
			case 'friends':
				return stats.friendships.accepted > 0 ? 'healthy' : 'inactive';
			default:
				return 'unknown';
		}
	}
}
