import { db } from '@db';
import { userSocialPreferences } from '@schema';
import { eq } from 'drizzle-orm';

export interface SocialPreferences {
	// Mentions preferences
	allowMentions: boolean;
	mentionPermissions: 'everyone' | 'friends' | 'followers' | 'none';
	mentionNotifications: boolean;
	mentionEmailNotifications: boolean;

	// Following preferences
	allowFollowers: boolean;
	followerApprovalRequired: boolean;
	hideFollowerCount: boolean;
	hideFollowingCount: boolean;
	allowWhaleDesignation: boolean;

	// Friends preferences
	allowFriendRequests: boolean;
	friendRequestPermissions: 'everyone' | 'mutuals' | 'followers' | 'none';
	autoAcceptMutualFollows: boolean;
	hideOnlineStatus: boolean;
	hideFriendsList: boolean;

	// General privacy
	showSocialActivity: boolean;
	allowDirectMessages: 'friends' | 'followers' | 'everyone' | 'none';
	showProfileToPublic: boolean;
	allowSocialDiscovery: boolean;
}

export class UserPreferencesService {
	/**
	 * Default social preferences for new users
	 */
	private static readonly DEFAULT_SOCIAL_PREFERENCES: SocialPreferences = {
		allowMentions: true,
		mentionPermissions: 'everyone',
		mentionNotifications: true,
		mentionEmailNotifications: false,
		allowFollowers: true,
		followerApprovalRequired: false,
		hideFollowerCount: false,
		hideFollowingCount: false,
		allowWhaleDesignation: true,
		allowFriendRequests: true,
		friendRequestPermissions: 'everyone',
		autoAcceptMutualFollows: false,
		hideOnlineStatus: false,
		hideFriendsList: false,
		showSocialActivity: true,
		allowDirectMessages: 'friends',
		showProfileToPublic: true,
		allowSocialDiscovery: true
	};

	/**
	 * Get user's social preferences
	 */
	static async getSocialPreferences(userId: string): Promise<SocialPreferences> {
		try {
			const preferences = await db
				.select()
				.from(userSocialPreferences)
				.where(eq(userSocialPreferences.userId, userId))
				.limit(1);

			if (preferences.length === 0) {
				// Return defaults if no preferences exist
				return this.DEFAULT_SOCIAL_PREFERENCES;
			}

			const prefs = preferences[0];
			return {
				allowMentions: prefs.allowMentions,
				mentionPermissions: prefs.mentionPermissions as SocialPreferences['mentionPermissions'],
				mentionNotifications: prefs.mentionNotifications,
				mentionEmailNotifications: prefs.mentionEmailNotifications,
				allowFollowers: prefs.allowFollowers,
				followerApprovalRequired: prefs.followerApprovalRequired,
				hideFollowerCount: prefs.hideFollowerCount,
				hideFollowingCount: prefs.hideFollowingCount,
				allowWhaleDesignation: prefs.allowWhaleDesignation,
				allowFriendRequests: prefs.allowFriendRequests,
				friendRequestPermissions:
					prefs.friendRequestPermissions as SocialPreferences['friendRequestPermissions'],
				autoAcceptMutualFollows: prefs.autoAcceptMutualFollows,
				hideOnlineStatus: prefs.hideOnlineStatus,
				hideFriendsList: prefs.hideFriendsList,
				showSocialActivity: prefs.showSocialActivity,
				allowDirectMessages: prefs.allowDirectMessages as SocialPreferences['allowDirectMessages'],
				showProfileToPublic: prefs.showProfileToPublic,
				allowSocialDiscovery: prefs.allowSocialDiscovery
			};
		} catch (error) {
			console.error('Error fetching social preferences:', error);
			return this.DEFAULT_SOCIAL_PREFERENCES;
		}
	}

	/**
	 * Update user's social preferences
	 */
	static async updateSocialPreferences(
		userId: string,
		updates: Partial<SocialPreferences>
	): Promise<SocialPreferences> {
		try {
			// Get current preferences
			const currentPrefs = await this.getSocialPreferences(userId);

			// Merge with updates
			const newPrefs = { ...currentPrefs, ...updates };

			// Upsert to database
			await db
				.insert(userSocialPreferences)
				.values({
					userId,
					allowMentions: newPrefs.allowMentions,
					mentionPermissions: newPrefs.mentionPermissions,
					mentionNotifications: newPrefs.mentionNotifications,
					mentionEmailNotifications: newPrefs.mentionEmailNotifications,
					allowFollowers: newPrefs.allowFollowers,
					followerApprovalRequired: newPrefs.followerApprovalRequired,
					hideFollowerCount: newPrefs.hideFollowerCount,
					hideFollowingCount: newPrefs.hideFollowingCount,
					allowWhaleDesignation: newPrefs.allowWhaleDesignation,
					allowFriendRequests: newPrefs.allowFriendRequests,
					friendRequestPermissions: newPrefs.friendRequestPermissions,
					autoAcceptMutualFollows: newPrefs.autoAcceptMutualFollows,
					hideOnlineStatus: newPrefs.hideOnlineStatus,
					hideFriendsList: newPrefs.hideFriendsList,
					showSocialActivity: newPrefs.showSocialActivity,
					allowDirectMessages: newPrefs.allowDirectMessages,
					showProfileToPublic: newPrefs.showProfileToPublic,
					allowSocialDiscovery: newPrefs.allowSocialDiscovery
				})
				.onConflictDoUpdate({
					target: userSocialPreferences.userId,
					set: {
						allowMentions: newPrefs.allowMentions,
						mentionPermissions: newPrefs.mentionPermissions,
						mentionNotifications: newPrefs.mentionNotifications,
						mentionEmailNotifications: newPrefs.mentionEmailNotifications,
						allowFollowers: newPrefs.allowFollowers,
						followerApprovalRequired: newPrefs.followerApprovalRequired,
						hideFollowerCount: newPrefs.hideFollowerCount,
						hideFollowingCount: newPrefs.hideFollowingCount,
						allowWhaleDesignation: newPrefs.allowWhaleDesignation,
						allowFriendRequests: newPrefs.allowFriendRequests,
						friendRequestPermissions: newPrefs.friendRequestPermissions,
						autoAcceptMutualFollows: newPrefs.autoAcceptMutualFollows,
						hideOnlineStatus: newPrefs.hideOnlineStatus,
						hideFriendsList: newPrefs.hideFriendsList,
						showSocialActivity: newPrefs.showSocialActivity,
						allowDirectMessages: newPrefs.allowDirectMessages,
						showProfileToPublic: newPrefs.showProfileToPublic,
						allowSocialDiscovery: newPrefs.allowSocialDiscovery,
						updatedAt: new Date()
					}
				});

			return newPrefs;
		} catch (error) {
			console.error('Error updating social preferences:', error);
			throw new Error('Failed to update social preferences');
		}
	}

	/**
	 * Reset social preferences to defaults
	 */
	static async resetSocialPreferences(userId: string): Promise<SocialPreferences> {
		return await this.updateSocialPreferences(userId, this.DEFAULT_SOCIAL_PREFERENCES);
	}

	/**
	 * Get privacy summary for quick overview
	 */
	static async getPrivacySummary(userId: string) {
		const prefs = await this.getSocialPreferences(userId);

		return {
			privacyLevel: this.calculatePrivacyLevel(prefs),
			restrictedFeatures: this.getRestrictedFeatures(prefs),
			publicVisibility: prefs.showProfileToPublic && prefs.allowSocialDiscovery,
			socialInteraction: prefs.allowMentions && prefs.allowFollowers && prefs.allowFriendRequests,
			lastUpdated: new Date().toISOString()
		};
	}

	/**
	 * Check if a user allows a specific social interaction
	 */
	static async checkSocialPermission(
		userId: string,
		permission: 'mentions' | 'follows' | 'friends' | 'messages',
		fromUserId?: string
	): Promise<boolean> {
		const prefs = await this.getSocialPreferences(userId);

		switch (permission) {
			case 'mentions':
				if (!prefs.allowMentions) return false;
				return this.checkPermissionLevel(prefs.mentionPermissions, userId, fromUserId);

			case 'follows':
				return prefs.allowFollowers;

			case 'friends':
				if (!prefs.allowFriendRequests) return false;
				return this.checkPermissionLevel(prefs.friendRequestPermissions, userId, fromUserId);

			case 'messages':
				return this.checkPermissionLevel(prefs.allowDirectMessages, userId, fromUserId);

			default:
				return false;
		}
	}

	/**
	 * Calculate overall privacy level (low, medium, high)
	 */
	private static calculatePrivacyLevel(prefs: SocialPreferences): 'low' | 'medium' | 'high' {
		let privacyScore = 0;

		// Check restrictive settings
		if (!prefs.allowMentions || prefs.mentionPermissions === 'none') privacyScore += 2;
		if (!prefs.allowFollowers || prefs.followerApprovalRequired) privacyScore += 2;
		if (!prefs.allowFriendRequests || prefs.friendRequestPermissions === 'none') privacyScore += 2;
		if (prefs.allowDirectMessages === 'none' || prefs.allowDirectMessages === 'friends')
			privacyScore += 1;
		if (prefs.hideFollowerCount || prefs.hideFollowingCount) privacyScore += 1;
		if (!prefs.showProfileToPublic || !prefs.allowSocialDiscovery) privacyScore += 2;
		if (prefs.hideOnlineStatus || prefs.hideFriendsList) privacyScore += 1;

		if (privacyScore >= 7) return 'high';
		if (privacyScore >= 3) return 'medium';
		return 'low';
	}

	/**
	 * Get list of restricted features
	 */
	private static getRestrictedFeatures(prefs: SocialPreferences): string[] {
		const restricted: string[] = [];

		if (!prefs.allowMentions) restricted.push('Mentions disabled');
		if (!prefs.allowFollowers) restricted.push('Following disabled');
		if (!prefs.allowFriendRequests) restricted.push('Friend requests disabled');
		if (prefs.allowDirectMessages === 'none') restricted.push('Direct messages disabled');
		if (!prefs.showProfileToPublic) restricted.push('Private profile');
		if (!prefs.allowSocialDiscovery) restricted.push('Hidden from search');

		return restricted;
	}

	/**
	 * Check if permission level allows interaction from specific user
	 */
	private static async checkPermissionLevel(
		level: 'everyone' | 'friends' | 'followers' | 'mutuals' | 'none',
		userId: string,
		fromUserId?: string
	): Promise<boolean> {
		if (level === 'none') return false;
		if (level === 'everyone') return true;
		if (!fromUserId) return false;

		// For now, return true for friends/followers/mutuals
		// This would need to be implemented with actual relationship checking
		return true;
	}
}
