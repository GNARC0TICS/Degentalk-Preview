import { z } from 'zod';
import {
	profileSettingsSchema,
	accountSettingsSchema,
	notificationSettingsSchema,
	passwordChangeSchema,
	displayPreferencesSchema
} from '../preferences.validators';

/**
 * Preferences Validation Schemas
 *
 * Zod schemas for validating user preference updates using validateRequest middleware
 */

// Wrap existing schemas for validateRequest middleware (expects { body, query, params })
export const profileSettingsValidation = z.object({
	body: profileSettingsSchema
});

export const accountSettingsValidation = z.object({
	body: accountSettingsSchema
});

export const notificationSettingsValidation = z.object({
	body: notificationSettingsSchema
});

export const passwordChangeValidation = z.object({
	body: passwordChangeSchema
});

export const displayPreferencesValidation = z.object({
	body: displayPreferencesSchema
});

// Shoutbox position validation
export const updateShoutboxPositionSchema = z.object({
	body: z.object({
		position: z.enum(['sidebar-top', 'sidebar-bottom', 'floating', 'hidden'], {
			errorMap: () => ({
				message: 'Position must be one of: sidebar-top, sidebar-bottom, floating, hidden'
			})
		})
	})
});

// Social privacy preferences schema
export const socialPreferencesSchema = z.object({
	body: z.object({
		// Mentions preferences
		allowMentions: z.boolean().optional(),
		mentionPermissions: z.enum(['everyone', 'friends', 'followers', 'none']).optional(),
		mentionNotifications: z.boolean().optional(),
		mentionEmailNotifications: z.boolean().optional(),

		// Following preferences
		allowFollowers: z.boolean().optional(),
		followerApprovalRequired: z.boolean().optional(),
		hideFollowerCount: z.boolean().optional(),
		hideFollowingCount: z.boolean().optional(),
		allowWhaleDesignation: z.boolean().optional(),

		// Friends preferences
		allowFriendRequests: z.boolean().optional(),
		friendRequestPermissions: z.enum(['everyone', 'mutuals', 'followers', 'none']).optional(),
		autoAcceptMutualFollows: z.boolean().optional(),
		hideOnlineStatus: z.boolean().optional(),
		hideFriendsList: z.boolean().optional(),

		// General privacy
		showSocialActivity: z.boolean().optional(),
		allowDirectMessages: z.enum(['friends', 'followers', 'everyone', 'none']).optional(),
		showProfileToPublic: z.boolean().optional(),
		allowSocialDiscovery: z.boolean().optional()
	})
});

// Export for route usage
export const preferencesValidation = {
	profileSettings: profileSettingsValidation,
	accountSettings: accountSettingsValidation,
	notificationSettings: notificationSettingsValidation,
	passwordChange: passwordChangeValidation,
	displayPreferences: displayPreferencesValidation,
	updateShoutboxPosition: updateShoutboxPositionSchema,
	socialPreferences: socialPreferencesSchema
};
