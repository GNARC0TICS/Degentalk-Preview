"use strict";
/**
 * Social Features Configuration
 * Centralized configuration for all social features in Degentalk
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFriendsConfig = exports.isWhaleWatchConfig = exports.isMentionsConfig = exports.SocialConfigHelper = exports.defaultSocialConfig = void 0;
/**
 * Default Social Configuration
 * These values can be overridden by admin settings or user preferences
 */
exports.defaultSocialConfig = {
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
var SocialConfigHelper = /** @class */ (function () {
    function SocialConfigHelper() {
    }
    /**
     * Check if a user can use a specific social feature
     */
    SocialConfigHelper.canUseFeature = function (feature, userLevel, userRoles, config) {
        if (config === void 0) { config = exports.defaultSocialConfig; }
        var featureConfig = config[feature];
        if (!featureConfig.enabled)
            return false;
        // Check role permissions
        if (featureConfig.allowedRoles &&
            !featureConfig.allowedRoles.some(function (role) { return userRoles.includes(role); })) {
            return false;
        }
        // Check level requirements
        if (featureConfig.minLevel && userLevel < featureConfig.minLevel) {
            // Check if user has override roles
            var overrideRoles = ['mod', 'admin'];
            if (!overrideRoles.some(function (role) { return userRoles.includes(role); })) {
                return false;
            }
        }
        return true;
    };
    /**
     * Check if a user qualifies as a whale
     */
    SocialConfigHelper.isWhale = function (user, config) {
        if (config === void 0) { config = exports.defaultSocialConfig; }
        var thresholds = config.whaleWatch.settings.whaleThresholds;
        return ((user.dgtBalance && user.dgtBalance >= thresholds.dgtBalance) ||
            (user.level && user.level >= thresholds.level) ||
            (user.postCount && user.postCount >= thresholds.postCount) ||
            (user.followerCount && user.followerCount >= thresholds.followerCount));
    };
    /**
     * Get effective rate limits for a user
     */
    SocialConfigHelper.getRateLimits = function (userRoles, config) {
        if (config === void 0) { config = exports.defaultSocialConfig; }
        var baseLimits = config.global.rateLimits;
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
    };
    return SocialConfigHelper;
}());
exports.SocialConfigHelper = SocialConfigHelper;
/**
 * Type guards for configuration validation
 */
var isMentionsConfig = function (config) {
    var _a;
    return config && typeof config.enabled === 'boolean' && ((_a = config.settings) === null || _a === void 0 ? void 0 : _a.mentionTrigger);
};
exports.isMentionsConfig = isMentionsConfig;
var isWhaleWatchConfig = function (config) {
    var _a;
    return config && typeof config.enabled === 'boolean' && ((_a = config.settings) === null || _a === void 0 ? void 0 : _a.whaleThresholds);
};
exports.isWhaleWatchConfig = isWhaleWatchConfig;
var isFriendsConfig = function (config) {
    var _a;
    return (config && typeof config.enabled === 'boolean' && typeof ((_a = config.settings) === null || _a === void 0 ? void 0 : _a.maxFriends) === 'number');
};
exports.isFriendsConfig = isFriendsConfig;
