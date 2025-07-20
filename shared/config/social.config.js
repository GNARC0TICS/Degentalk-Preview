/**
 * Social Features Configuration
 * Centralized configuration for all social features in Degentalk
 */
/**
 * Default Social Configuration
 * These values can be overridden by admin settings or user preferences
 */
export const defaultSocialConfig = {
    mentions: {
        enabled: true,
        minLevel: 2,
        allowedRoles: ['user', 'moderator', 'admin'],
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
        allowedRoles: ['user', 'moderator', 'admin'],
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
        allowedRoles: ['user', 'moderator', 'admin'],
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
    static canUseFeature(feature, userLevel, userRoles, config = defaultSocialConfig) {
        const featureConfig = config[feature];
        if (!featureConfig.enabled)
            return false;
        // Check role permissions
        if (featureConfig.allowedRoles &&
            !featureConfig.allowedRoles.some((role) => userRoles.includes(role))) {
            return false;
        }
        // Check level requirements
        if (featureConfig.minLevel && userLevel < featureConfig.minLevel) {
            // Check if user has override roles
            const overrideRoles = ['moderator', 'admin'];
            if (!overrideRoles.some((role) => userRoles.includes(role))) {
                return false;
            }
        }
        return true;
    }
    /**
     * Check if a user qualifies as a whale
     */
    static isWhale(user, config = defaultSocialConfig) {
        const thresholds = config.whaleWatch.settings.whaleThresholds;
        return !!((user.dgtBalance && user.dgtBalance >= thresholds.dgtBalance) ||
            (user.level && user.level >= thresholds.level) ||
            (user.postCount && user.postCount >= thresholds.postCount) ||
            (user.followerCount && user.followerCount >= thresholds.followerCount));
    }
    /**
     * Get effective rate limits for a user
     */
    static getRateLimits(userRoles, config = defaultSocialConfig) {
        const baseLimits = config.global.rateLimits;
        // Mods and admins get higher limits
        if (userRoles.includes('admin')) {
            return {
                mentionsPerHour: baseLimits.mentionsPerHour * 5,
                followsPerHour: baseLimits.followsPerHour * 5,
                friendRequestsPerDay: baseLimits.friendRequestsPerDay * 5
            };
        }
        if (userRoles.includes('moderator')) {
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
export const isMentionsConfig = (config) => {
    return config && typeof config.enabled === 'boolean' && config.settings?.mentionTrigger;
};
export const isWhaleWatchConfig = (config) => {
    return config && typeof config.enabled === 'boolean' && config.settings?.whaleThresholds;
};
export const isFriendsConfig = (config) => {
    return (config && typeof config.enabled === 'boolean' && typeof config.settings?.maxFriends === 'number');
};
