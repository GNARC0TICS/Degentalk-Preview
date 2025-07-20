/**
 * Social Features Configuration
 * Centralized configuration for all social features in Degentalk
 */
export interface SocialFeatureConfig {
    enabled: boolean;
    minLevel?: number;
    allowedRoles?: string[];
    settings?: Record<string, any>;
}
export interface MentionsConfig extends SocialFeatureConfig {
    settings: {
        mentionTrigger: string;
        maxMentionsPerPost: number;
        minQueryLength: number;
        maxSuggestions: number;
        searchDelay: number;
        defaultEmailNotifications: boolean;
        defaultPushNotifications: boolean;
        allowPublicMentions: boolean;
        requireMutualFollow: boolean;
        requireFriendship: boolean;
    };
}
export interface WhaleWatchConfig extends SocialFeatureConfig {
    settings: {
        maxFollowing: number;
        maxFollowers: number;
        minStakeForNotification: number;
        minPostLikesForNotification: number;
        allowPublicFollowList: boolean;
        requireFollowApproval: boolean;
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
        maxFriends: number;
        maxPendingRequests: number;
        requestExpireDays: number;
        autoAcceptFromFollowers: boolean;
        autoAcceptFromWhales: boolean;
        autoAcceptSameLevelRange: number;
        defaultAllowWhispers: boolean;
        defaultAllowProfileView: boolean;
        defaultAllowActivityView: boolean;
        enableFriendGroups: boolean;
        maxFriendGroups: number;
    };
}
export interface SocialConfig {
    mentions: MentionsConfig;
    whaleWatch: WhaleWatchConfig;
    friends: FriendsConfig;
    global: {
        enableActivityFeed: boolean;
        enableNotificationCenter: boolean;
        enablePrivacyControls: boolean;
        rateLimits: {
            mentionsPerHour: number;
            followsPerHour: number;
            friendRequestsPerDay: number;
        };
        adminCanOverridePrivacy: boolean;
        moderatorCanViewAll: boolean;
    };
}
/**
 * Default Social Configuration
 * These values can be overridden by admin settings or user preferences
 */
export declare const defaultSocialConfig: SocialConfig;
/**
 * Utility functions for social configuration
 */
export declare class SocialConfigHelper {
    /**
     * Check if a user can use a specific social feature
     */
    static canUseFeature(feature: keyof SocialConfig, userLevel: number, userRoles: string[], config?: SocialConfig): boolean;
    /**
     * Check if a user qualifies as a whale
     */
    static isWhale(user: {
        dgtBalance?: number;
        level?: number;
        postCount?: number;
        followerCount?: number;
    }, config?: SocialConfig): boolean;
    /**
     * Get effective rate limits for a user
     */
    static getRateLimits(userRoles: string[], config?: SocialConfig): {
        mentionsPerHour: number;
        followsPerHour: number;
        friendRequestsPerDay: number;
    };
}
/**
 * Type guards for configuration validation
 */
export declare const isMentionsConfig: (config: any) => config is MentionsConfig;
export declare const isWhaleWatchConfig: (config: any) => config is WhaleWatchConfig;
export declare const isFriendsConfig: (config: any) => config is FriendsConfig;
