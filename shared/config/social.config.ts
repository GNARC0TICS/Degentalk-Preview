/**
 * Social Features Configuration
 * Centralized configuration for all social features in DegenTalk
 */

export interface SocialFeatureConfig {
	enabled: boolean;
	minLevel?: number;
	allowedRoles?: string[];
	settings?: Record<string, any>;
}

export interface MentionsConfig extends SocialFeatureConfig {
	settings: {
		// Mention detection
		mentionTrigger: string;
		maxMentionsPerPost: number;

		// Autocomplete
		minQueryLength: number;
		maxSuggestions: number;
		searchDelay: number;

		// Notifications
		defaultEmailNotifications: boolean;
		defaultPushNotifications: boolean;

		// Privacy
		allowPublicMentions: boolean;
		requireMutualFollow: boolean;
		requireFriendship: boolean;
	};
}

export interface WhaleWatchConfig extends SocialFeatureConfig {
	settings: {
		// Following limits
		maxFollowing: number;
		maxFollowers: number;

		// Notification thresholds
		minStakeForNotification: number;
		minPostLikesForNotification: number;

		// Privacy
		allowPublicFollowList: boolean;
		requireFollowApproval: boolean;

		// Whale detection
		whaleThresholds: {
			dgtBalance: number;
			level: number;
			postCount: number;
			followerCount: number;
		};
	};
}

export interface FriendsConfig extends SocialFeatureConfig {
	settings: {
		// Friend limits
		maxFriends: number;

		// Request settings
		maxPendingRequests: number;
		requestExpireDays: number;

		// Auto-accept rules
		autoAcceptFromFollowers: boolean;
		autoAcceptFromWhales: boolean;
		autoAcceptSameLevelRange: number;

		// Privacy
		defaultAllowWhispers: boolean;
		defaultAllowProfileView: boolean;
		defaultAllowActivityView: boolean;

		// Friend groups
		enableFriendGroups: boolean;
		maxFriendGroups: number;
	};
}

export interface SocialConfig {
	mentions: MentionsConfig;
	whaleWatch: WhaleWatchConfig;
	friends: FriendsConfig;

	// Global settings
	global: {
		// Cross-feature settings
		enableActivityFeed: boolean;
		enableNotificationCenter: boolean;
		enablePrivacyControls: boolean;

		// Rate limiting
		rateLimits: {
			mentionsPerHour: number;
			followsPerHour: number;
			friendRequestsPerDay: number;
		};

		// Admin controls
		adminCanOverridePrivacy: boolean;
		moderatorCanViewAll: boolean;
	};
}

/**
 * Default Social Configuration
 * These values can be overridden by admin settings or user preferences
 */
export const defaultSocialConfig: SocialConfig = {
	mentions: {
		enabled: true,
		minLevel: 2,
		allowedRoles: ['user', 'mod', 'admin'],
		settings: {
			// Mention detection
			mentionTrigger: '@',
			maxMentionsPerPost: 10,

			// Autocomplete
			minQueryLength: 1,
			maxSuggestions: 10,
			searchDelay: 300,

			// Notifications
			defaultEmailNotifications: false,
			defaultPushNotifications: true,

			// Privacy
			allowPublicMentions: true,
			requireMutualFollow: false,
			requireFriendship: false
		}
	},

	whaleWatch: {
		enabled: true,
		minLevel: 1,
		allowedRoles: ['user', 'mod', 'admin'],
		settings: {
			// Following limits
			maxFollowing: 1000,
			maxFollowers: -1, // Unlimited

			// Notification thresholds
			minStakeForNotification: 1000,
			minPostLikesForNotification: 10,

			// Privacy
			allowPublicFollowList: true,
			requireFollowApproval: false,

			// Whale detection
			whaleThresholds: {
				dgtBalance: 100000,
				level: 25,
				postCount: 500,
				followerCount: 100
			}
		}
	},

	friends: {
		enabled: true,
		minLevel: 1,
		allowedRoles: ['user', 'mod', 'admin'],
		settings: {
			// Friend limits
			maxFriends: 500,

			// Request settings
			maxPendingRequests: 50,
			requestExpireDays: 30,

			// Auto-accept rules
			autoAcceptFromFollowers: false,
			autoAcceptFromWhales: false,
			autoAcceptSameLevelRange: 0,

			// Privacy
			defaultAllowWhispers: true,
			defaultAllowProfileView: true,
			defaultAllowActivityView: true,

			// Friend groups
			enableFriendGroups: true,
			maxFriendGroups: 10
		}
	},

	global: {
		// Cross-feature settings
		enableActivityFeed: true,
		enableNotificationCenter: true,
		enablePrivacyControls: true,

		// Rate limiting
		rateLimits: {
			mentionsPerHour: 100,
			followsPerHour: 50,
			friendRequestsPerDay: 20
		},

		// Admin controls
		adminCanOverridePrivacy: true,
		moderatorCanViewAll: false
	}
};

/**
 * Utility functions for social configuration
 */
export class SocialConfigHelper {
	/**
	 * Check if a user can use a specific social feature
	 */
	static canUseFeature(
		feature: keyof SocialConfig,
		userLevel: number,
		userRoles: string[],
		config: SocialConfig = defaultSocialConfig
	): boolean {
		const featureConfig = config[feature] as SocialFeatureConfig;

		if (!featureConfig.enabled) return false;

		// Check role permissions
		if (
			featureConfig.allowedRoles &&
			!featureConfig.allowedRoles.some((role) => userRoles.includes(role))
		) {
			return false;
		}

		// Check level requirements
		if (featureConfig.minLevel && userLevel < featureConfig.minLevel) {
			// Check if user has override roles
			const overrideRoles = ['mod', 'admin'];
			if (!overrideRoles.some((role) => userRoles.includes(role))) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Check if a user qualifies as a whale
	 */
	static isWhale(
		user: {
			dgtBalance?: number;
			level?: number;
			postCount?: number;
			followerCount?: number;
		},
		config: SocialConfig = defaultSocialConfig
	): boolean {
		const thresholds = config.whaleWatch.settings.whaleThresholds;

		return (
			(user.dgtBalance && user.dgtBalance >= thresholds.dgtBalance) ||
			(user.level && user.level >= thresholds.level) ||
			(user.postCount && user.postCount >= thresholds.postCount) ||
			(user.followerCount && user.followerCount >= thresholds.followerCount)
		);
	}

	/**
	 * Get effective rate limits for a user
	 */
	static getRateLimits(userRoles: string[], config: SocialConfig = defaultSocialConfig) {
		const baseLimits = config.global.rateLimits;

		// Mods and admins get higher limits
		if (userRoles.includes('admin')) {
			return {
				mentionsPerHour: baseLimits.mentionsPerHour * 5,
				followsPerHour: baseLimits.followsPerHour * 5,
				friendRequestsPerDay: baseLimits.friendRequestsPerDay * 5
			};
		}

		if (userRoles.includes('mod')) {
			return {
				mentionsPerHour: baseLimits.mentionsPerHour * 3,
				followsPerHour: baseLimits.followsPerHour * 3,
				friendRequestsPerDay: baseLimits.friendRequestsPerDay * 3
			};
		}

		return baseLimits;
	}
}

/**
 * Type guards for configuration validation
 */
export const isMentionsConfig = (config: any): config is MentionsConfig => {
	return config && typeof config.enabled === 'boolean' && config.settings?.mentionTrigger;
};

export const isWhaleWatchConfig = (config: any): config is WhaleWatchConfig => {
	return config && typeof config.enabled === 'boolean' && config.settings?.whaleThresholds;
};

export const isFriendsConfig = (config: any): config is FriendsConfig => {
	return (
		config && typeof config.enabled === 'boolean' && typeof config.settings?.maxFriends === 'number'
	);
};
