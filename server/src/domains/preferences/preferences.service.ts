import { db } from '@degentalk/db';
import {
	users,
	userSettings as userPreferencesSchema,
	notificationSettings as notificationPreferencesSchema,
	displayPreferences as displayPreferencesSchema,
	userSettingsHistory,
	type User,
	type UserSetting as UserPreference,
	type NotificationSetting as NotificationPreference,
	type DisplayPreference
} from '@schema';
import { eq, and, sql } from 'drizzle-orm';
import { logger } from '@core/logger';
import { PreferencesRepository } from './repositories/preferences.repository';
import type {
	ProfileSettingsInput,
	AccountSettingsInput,
	NotificationSettingsInput,
	PasswordChangeInput,
	DisplayPreferencesInput
} from './preferences.validators';
import type { UserId } from '@shared/types/ids';
import bcrypt from 'bcrypt';

// Initialize repository instance
const preferencesRepo = new PreferencesRepository();

/**
 * Fetches all preferences for a user (profile, account, notifications, display)
 * @param userId The user ID
 */
export const getAllPreferences = async (userId: UserId) => {
	// Fetch the user's profile data (still need direct access for user table)
	const user = await db.query.users.findFirst({
		where: eq(users.id, userId),
		columns: {
			id: true,
			username: true,
			email: true,
			bio: true,
			signature: true,
			avatarUrl: true,
			profileBannerUrl: true,
			discordHandle: true,
			twitterHandle: true,
			website: true,
			telegramHandle: true,
			activeTitleId: true,
			activeBadgeId: true,
			activeFrameId: true
		}
	});

	if (!user) {
		throw new Error('User not found');
	}

	// Use repository to fetch all preference types
	const allPreferences = await preferencesRepo.findAllByUserId(userId);

	return {
		profile: user,
		preferences: allPreferences.userSettings || {},
		notifications: allPreferences.notificationSettings || {},
		display: allPreferences.displayPreferences || {}
	};
};

/**
 * Updates a user's profile preferences
 * @param userId The user ID
 * @param data Profile preferences to update
 * @param ipAddress The IP address of the requester
 */
export const updateProfilePreferences = async (
	userId: UserId,
	data: ProfileSettingsInput,
	ipAddress?: string
) => {
	// Get current profile data for change tracking
	const currentProfile = await db.query.users.findFirst({
		where: eq(users.id, userId)
	});

	if (!currentProfile) {
		throw new Error('User not found');
	}

	// Track changes in preferences history
	const trackedFields = [
		'bio',
		'signature',
		'avatarUrl',
		'profileBannerUrl',
		'discordHandle',
		'twitterHandle',
		'website',
		'telegramHandle',
		'activeTitleId',
		'activeBadgeId',
		'activeFrameId'
	];

	for (const field of trackedFields) {
		if (
			field in data &&
			data[field as keyof ProfileSettingsInput] !== currentProfile[field as keyof User]
		) {
			await db.insert(userSettingsHistory).values({
				userId,
				settingKey: `profile.${field}`,
				oldValue: currentProfile[field as keyof User]?.toString() || null,
				newValue: data[field as keyof ProfileSettingsInput]?.toString() || null,
				changedAt: new Date(),
				changedByIp: ipAddress
			});
		}
	}

	// Update the user's profile
	await db.update(users).set(data).where(eq(users.id, userId));

	return { success: true };
};

/**
 * Updates a user's account preferences
 * @param userId The user ID
 * @param data Account preferences to update
 * @param ipAddress The IP address of the requester
 */
export const updateAccountPreferences = async (
	userId: UserId,
	data: AccountSettingsInput,
	ipAddress?: string
) => {
	// Use repository to check if preferences exist
	const existingPreferences = await preferencesRepo.findUserSettingsByUserId(userId);

	// If no preferences exist yet, create them
	if (!existingPreferences) {
		await preferencesRepo.createUserSettings({
			userId,
			...data
		});
		return { success: true };
	}

	// Track changes in preferences history
	const trackedFields = ['theme', 'language', 'timezone', 'shoutboxPosition', 'profileVisibility'];

	for (const field of trackedFields) {
		if (
			field in data &&
			data[field as keyof AccountSettingsInput] !==
				existingPreferences[field as keyof UserPreference]
		) {
			await preferencesRepo.logPreferenceChange(
				userId,
				`account.${field}`,
				existingPreferences[field as keyof UserPreference]?.toString() || null,
				data[field as keyof AccountSettingsInput]?.toString() || null,
				ipAddress
			);
		}
	}

	// Handle the sidebarState separately as it's a JSON object
	if (
		data.sidebarState &&
		JSON.stringify(data.sidebarState) !== JSON.stringify(existingPreferences.sidebarState)
	) {
		await preferencesRepo.logPreferenceChange(
			userId,
			'account.sidebarState',
			JSON.stringify(existingPreferences.sidebarState),
			JSON.stringify(data.sidebarState),
			ipAddress
		);
	}

	// Use repository to update preferences
	await preferencesRepo.updateUserSettings(userId, data);

	return { success: true };
};

/**
 * Updates a user's notification preferences
 * @param userId The user ID
 * @param data Notification preferences to update
 * @param ipAddress The IP address of the requester
 */
export const updateNotificationPreferences = async (
	userId: UserId,
	data: NotificationSettingsInput,
	ipAddress?: string
) => {
	// Use repository to check if notification preferences exist
	const existingPreferences = await preferencesRepo.findNotificationSettingsByUserId(userId);

	// If no preferences exist yet, create them
	if (!existingPreferences) {
		await preferencesRepo.createNotificationSettings({
			userId,
			...data
		});
		return { success: true };
	}

	// Track changes in preferences history
	const trackedFields = [
		'receiveEmailNotifications',
		'notifyOnMentions',
		'notifyOnNewReplies',
		'notifyOnLevelUp',
		'notifyOnMissionUpdates',
		'notifyOnWalletTransactions'
	];

	for (const field of trackedFields) {
		if (
			field in data &&
			data[field as keyof NotificationSettingsInput] !==
				existingPreferences[field as keyof NotificationPreference]
		) {
			await preferencesRepo.logPreferenceChange(
				userId,
				`notifications.${field}`,
				existingPreferences[field as keyof NotificationPreference]?.toString() || null,
				data[field as keyof NotificationSettingsInput]?.toString() || null,
				ipAddress
			);
		}
	}

	// Use repository to update notification preferences
	await preferencesRepo.updateNotificationSettings(userId, data);

	return { success: true };
};

/**
 * Updates a user's display preferences
 * @param userId The user ID
 * @param data Display preferences to update
 * @param ipAddress The IP address of the requester
 */
export const updateDisplayPreferences = async (
	userId: UserId,
	data: DisplayPreferencesInput,
	ipAddress?: string
) => {
	// Use repository to check if display preferences exist
	const existingPreferences = await preferencesRepo.findDisplayPreferencesByUserId(userId);

	// If no preferences exist yet, create them
	if (!existingPreferences) {
		await preferencesRepo.createDisplayPreferences({
			userId,
			...data
		});
		return { success: true };
	}

	// Track changes in preferences history
	const trackedFields: Array<keyof DisplayPreferencesInput> = [
		'theme',
		'fontSize',
		'threadDisplayMode',
		'reducedMotion',
		'hideNsfw',
		'showMatureContent',
		'showOfflineUsers'
	];

	for (const field of trackedFields) {
		if (field in data && data[field] !== existingPreferences[field as keyof DisplayPreference]) {
			await preferencesRepo.logPreferenceChange(
				userId,
				`display.${field}`,
				existingPreferences[field as keyof DisplayPreference]?.toString() || null,
				data[field]?.toString() || null,
				ipAddress
			);
		}
	}

	// Use repository to update display preferences
	await preferencesRepo.updateDisplayPreferences(userId, data);

	return { success: true };
};

/**
 * Changes a user's password
 * @param userId The user ID
 * @param data Password change input
 * @param ipAddress The IP address of the requester
 */
export const changePassword = async (
	userId: UserId,
	data: PasswordChangeInput,
	ipAddress?: string
) => {
	// Get the user
	const user = await db.query.users.findFirst({
		where: eq(users.id, userId),
		columns: {
			id: true,
			password: true
		}
	});

	if (!user) {
		throw new Error('User not found');
	}

	// Verify current password
	const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password || '');
	if (!isPasswordValid) {
		throw new Error('Invalid current password');
	}

	// Hash new password
	const hashedPassword = await bcrypt.hash(data.newPassword, 10); // 10 is the salt rounds

	// Update the password
	await db.update(users).set({ password: hashedPassword }).where(eq(users.id, userId));

	// Log the password change (without storing the actual passwords)
	await db.insert(userSettingsHistory).values({
		userId,
		settingKey: 'account.password',
		oldValue: '[redacted]',
		newValue: '[redacted]',
		changedAt: new Date(),
		changedByIp: ipAddress
	});

	return { success: true, message: 'Password updated successfully' };
};

/**
 * Creates default preferences for a new user
 * @param userId The ID of the user to create preferences for
 */
export const createDefaultPreferences = async (userId: UserId) => {
	// Use repository to create default preferences
	return await preferencesRepo.createDefaultPreferences(userId);
};
