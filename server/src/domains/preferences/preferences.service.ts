import { db } from '../../../db';
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
import { logger } from '../../../src/core/logger';
import { 
  ProfileSettingsInput, 
  AccountSettingsInput, 
  NotificationSettingsInput, 
  PasswordChangeInput,
  DisplayPreferencesInput
} from './preferences.validators';
import bcrypt from 'bcrypt';

/**
 * Fetches all preferences for a user (profile, account, notifications, display)
 * @param userId The user ID
 */
export const getAllPreferences = async (userId: number) => {
  // Fetch the user's profile data
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
      activeFrameId: true,
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Fetch the user's preferences (account settings)
  const preferences = await db.query.userPreferencesSchema.findFirst({
    where: eq(userPreferencesSchema.userId, userId)
  });

  // Fetch the user's notification preferences
  const notifPreferences = await db.query.notificationPreferencesSchema.findFirst({
    where: eq(notificationPreferencesSchema.userId, userId)
  });

  // Fetch the user's display preferences
  const displayPreferences = await db.query.displayPreferencesSchema.findFirst({
    where: eq(displayPreferencesSchema.userId, userId)
  });

  return {
    profile: user,
    preferences: preferences || {},
    notifications: notifPreferences || {},
    display: displayPreferences || {}
  };
};

/**
 * Updates a user's profile preferences
 * @param userId The user ID
 * @param data Profile preferences to update
 * @param ipAddress The IP address of the requester
 */
export const updateProfilePreferences = async (
  userId: number, 
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
    'bio', 'signature', 'avatarUrl', 'profileBannerUrl', 
    'discordHandle', 'twitterHandle', 'website', 'telegramHandle',
    'activeTitleId', 'activeBadgeId', 'activeFrameId'
  ];

  for (const field of trackedFields) {
    if (field in data && data[field as keyof ProfileSettingsInput] !== currentProfile[field as keyof User]) {
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
  await db.update(users)
    .set(data)
    .where(eq(users.id, userId));

  return { success: true };
};

/**
 * Updates a user's account preferences
 * @param userId The user ID
 * @param data Account preferences to update
 * @param ipAddress The IP address of the requester
 */
export const updateAccountPreferences = async (
  userId: number, 
  data: AccountSettingsInput, 
  ipAddress?: string
) => {
  // Check if preferences exist
  const existingPreferences = await db.query.userPreferencesSchema.findFirst({
    where: eq(userPreferencesSchema.userId, userId)
  });

  // If no preferences exist yet, create them
  if (!existingPreferences) {
    await db.insert(userPreferencesSchema).values({
      userId,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { success: true };
  }

  // Track changes in preferences history
  const trackedFields = [
    'theme', 'language', 'timezone', 'shoutboxPosition', 'profileVisibility'
  ];

  for (const field of trackedFields) {
    if (field in data && data[field as keyof AccountSettingsInput] !== existingPreferences[field as keyof UserPreference]) {
      await db.insert(userSettingsHistory).values({
        userId,
        settingKey: `account.${field}`,
        oldValue: existingPreferences[field as keyof UserPreference]?.toString() || null,
        newValue: data[field as keyof AccountSettingsInput]?.toString() || null,
        changedAt: new Date(),
        changedByIp: ipAddress
      });
    }
  }

  // Handle the sidebarState separately as it's a JSON object
  if (data.sidebarState && JSON.stringify(data.sidebarState) !== JSON.stringify(existingPreferences.sidebarState)) {
    await db.insert(userSettingsHistory).values({
      userId,
      settingKey: 'account.sidebarState',
      oldValue: JSON.stringify(existingPreferences.sidebarState),
      newValue: JSON.stringify(data.sidebarState),
      changedAt: new Date(),
      changedByIp: ipAddress
    });
  }

  // Update the preferences
  await db.update(userPreferencesSchema)
    .set({
      ...data,
      updatedAt: new Date()
    })
    .where(eq(userPreferencesSchema.userId, userId));

  return { success: true };
};

/**
 * Updates a user's notification preferences
 * @param userId The user ID
 * @param data Notification preferences to update
 * @param ipAddress The IP address of the requester
 */
export const updateNotificationPreferences = async (
  userId: number, 
  data: NotificationSettingsInput, 
  ipAddress?: string
) => {
  // Check if notification preferences exist
  const existingPreferences = await db.query.notificationPreferencesSchema.findFirst({
    where: eq(notificationPreferencesSchema.userId, userId)
  });

  // If no preferences exist yet, create them
  if (!existingPreferences) {
    await db.insert(notificationPreferencesSchema).values({
      userId,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { success: true };
  }

  // Track changes in preferences history
  const trackedFields = [
    'receiveEmailNotifications', 'notifyOnMentions', 'notifyOnNewReplies',
    'notifyOnLevelUp', 'notifyOnMissionUpdates', 'notifyOnWalletTransactions'
  ];

  for (const field of trackedFields) {
    if (field in data && data[field as keyof NotificationSettingsInput] !== existingPreferences[field as keyof NotificationPreference]) {
      await db.insert(userSettingsHistory).values({
        userId,
        settingKey: `notifications.${field}`,
        oldValue: existingPreferences[field as keyof NotificationPreference]?.toString() || null,
        newValue: data[field as keyof NotificationSettingsInput]?.toString() || null,
        changedAt: new Date(),
        changedByIp: ipAddress
      });
    }
  }

  // Update the notification preferences
  await db.update(notificationPreferencesSchema)
    .set({
      ...data,
      updatedAt: new Date()
    })
    .where(eq(notificationPreferencesSchema.userId, userId));

  return { success: true };
};

/**
 * Updates a user's display preferences
 * @param userId The user ID
 * @param data Display preferences to update
 * @param ipAddress The IP address of the requester
 */
export const updateDisplayPreferences = async (
  userId: number, 
  data: DisplayPreferencesInput, 
  ipAddress?: string
) => {
  // Check if display preferences exist
  const existingPreferences = await db.query.displayPreferencesSchema.findFirst({
    where: eq(displayPreferencesSchema.userId, userId)
  });

  // If no preferences exist yet, create them
  if (!existingPreferences) {
    await db.insert(displayPreferencesSchema).values({
      userId,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { success: true };
  }

  // Track changes in preferences history
  const trackedFields: Array<keyof DisplayPreferencesInput> = [
    'theme', 'fontSize', 'threadDisplayMode', 'reducedMotion', 
    'hideNsfw', 'showMatureContent', 'showOfflineUsers'
  ];

  for (const field of trackedFields) {
    if (field in data && data[field] !== existingPreferences[field as keyof DisplayPreference]) {
      await db.insert(userSettingsHistory).values({
        userId,
        settingKey: `display.${field}`,
        oldValue: existingPreferences[field as keyof DisplayPreference]?.toString() || null,
        newValue: data[field]?.toString() || null,
        changedAt: new Date(),
        changedByIp: ipAddress
      });
    }
  }

  // Update the display preferences
  await db.update(displayPreferencesSchema)
    .set({
      ...data,
      updatedAt: new Date()
    })
    .where(eq(displayPreferencesSchema.userId, userId));

  return { success: true };
};

/**
 * Changes a user's password
 * @param userId The user ID
 * @param data Password change input
 * @param ipAddress The IP address of the requester
 */
export const changePassword = async (
  userId: number, 
  data: PasswordChangeInput, 
  ipAddress?: string
) => {
  // Get the user
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      password: true,
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
  await db.update(users)
    .set({ password: hashedPassword })
    .where(eq(users.id, userId));

  // Log the password change (without storing the actual passwords)
  await db.insert(userSettingsHistory).values({
    userId,
    settingKey: 'account.password',
    oldValue: '[redacted]',
    newValue: '[redacted]',
    changedAt: new Date(),
    changedByIp: ipAddress,
  });

  return { success: true, message: 'Password updated successfully' };
};

/**
 * Creates default preferences for a new user
 * @param userId The ID of the user to create preferences for
 */
export const createDefaultPreferences = async (userId: number) => {
  const defaultProfilePreferences = {
    userId,
    bio: null,
    signature: null,
    avatarUrl: null,
    profileBannerUrl: null,
    discordHandle: null,
    twitterHandle: null,
    website: null,
    telegramHandle: null,
    activeTitleId: null,
    activeBadgeId: null,
    activeFrameId: null,
  };

  const defaultUserPreferences = {
    userId,
    theme: 'auto',
    shoutboxPosition: 'sidebar-top',
    sidebarState: {},
    profileVisibility: 'public',
    language: 'en',
    timezone: 'UTC',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const defaultNotificationPreferences = {
    userId,
    receiveEmailNotifications: true,
    notifyOnMentions: true,
    notifyOnNewReplies: true,
    notifyOnLevelUp: true,
    notifyOnMissionUpdates: true,
    notifyOnWalletTransactions: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const defaultDisplayPreferences = {
    userId,
    theme: 'system',
    fontSize: 'medium',
    threadDisplayMode: 'card',
    reducedMotion: false,
    hideNsfw: true,
    showMatureContent: false,
    showOfflineUsers: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.transaction(async (tx) => {
    await tx.insert(users).values(defaultProfilePreferences); // Assuming users table is for profile preferences
    await tx.insert(userPreferencesSchema).values(defaultUserPreferences);
    await tx.insert(notificationPreferencesSchema).values(defaultNotificationPreferences);
    await tx.insert(displayPreferencesSchema).values(defaultDisplayPreferences);
  });
}; 