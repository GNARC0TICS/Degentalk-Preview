import { db } from '../../core/db';
import { settings as settingsTable, users as usersTable } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { logger } from '../../core/logger';
import { 
  userSettings, 
  notificationSettings, 
  userSettingsHistory,
  type User,
  type UserSetting,
  type NotificationSetting
} from '@shared/schema';
import { 
  ProfileSettingsInput, 
  AccountSettingsInput, 
  NotificationSettingsInput, 
  PasswordChangeInput 
} from './settings.validators';
import bcrypt from 'bcrypt';

/**
 * Fetches all settings for a user (profile, account, notifications)
 * @param userId The user ID
 */
export const getAllSettings = async (userId: number) => {
  // Fetch the user's profile data
  const user = await db.query.users.findFirst({
    where: eq(usersTable.id, userId),
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

  // Fetch the user's settings
  const settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, userId)
  });

  // Fetch the user's notification settings
  const notifSettings = await db.query.notificationSettings.findFirst({
    where: eq(notificationSettings.userId, userId)
  });

  return {
    profile: user,
    settings: settings || {},
    notifications: notifSettings || {}
  };
};

/**
 * Updates a user's profile settings
 * @param userId The user ID
 * @param data Profile settings to update
 * @param ipAddress The IP address of the requester
 */
export const updateProfileSettings = async (
  userId: number, 
  data: ProfileSettingsInput, 
  ipAddress?: string
) => {
  // Get current profile data for change tracking
  const currentProfile = await db.query.users.findFirst({
    where: eq(usersTable.id, userId)
  });

  if (!currentProfile) {
    throw new Error('User not found');
  }

  // Track changes in settings history
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
  await db.update(usersTable)
    .set(data)
    .where(eq(usersTable.id, userId));

  return { success: true };
};

/**
 * Updates a user's account settings
 * @param userId The user ID
 * @param data Account settings to update
 * @param ipAddress The IP address of the requester
 */
export const updateAccountSettings = async (
  userId: number, 
  data: AccountSettingsInput, 
  ipAddress?: string
) => {
  // Check if settings exist
  const existingSettings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, userId)
  });

  // If no settings exist yet, create them
  if (!existingSettings) {
    await db.insert(userSettings).values({
      userId,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { success: true };
  }

  // Track changes in settings history
  const trackedFields = [
    'theme', 'language', 'timezone', 'shoutboxPosition', 'profileVisibility'
  ];

  for (const field of trackedFields) {
    if (field in data && data[field as keyof AccountSettingsInput] !== existingSettings[field as keyof UserSetting]) {
      await db.insert(userSettingsHistory).values({
        userId,
        settingKey: `account.${field}`,
        oldValue: existingSettings[field as keyof UserSetting]?.toString() || null,
        newValue: data[field as keyof AccountSettingsInput]?.toString() || null,
        changedAt: new Date(),
        changedByIp: ipAddress
      });
    }
  }

  // Handle the sidebarState separately as it's a JSON object
  if (data.sidebarState && JSON.stringify(data.sidebarState) !== JSON.stringify(existingSettings.sidebarState)) {
    await db.insert(userSettingsHistory).values({
      userId,
      settingKey: 'account.sidebarState',
      oldValue: JSON.stringify(existingSettings.sidebarState),
      newValue: JSON.stringify(data.sidebarState),
      changedAt: new Date(),
      changedByIp: ipAddress
    });
  }

  // Update the settings
  await db.update(userSettings)
    .set({
      ...data,
      updatedAt: new Date()
    })
    .where(eq(userSettings.userId, userId));

  return { success: true };
};

/**
 * Updates a user's notification settings
 * @param userId The user ID
 * @param data Notification settings to update
 * @param ipAddress The IP address of the requester
 */
export const updateNotificationSettings = async (
  userId: number, 
  data: NotificationSettingsInput, 
  ipAddress?: string
) => {
  // Check if notification settings exist
  const existingSettings = await db.query.notificationSettings.findFirst({
    where: eq(notificationSettings.userId, userId)
  });

  // If no settings exist yet, create them
  if (!existingSettings) {
    await db.insert(notificationSettings).values({
      userId,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { success: true };
  }

  // Track changes in settings history
  const trackedFields = [
    'receiveEmailNotifications', 'notifyOnMentions', 'notifyOnNewReplies',
    'notifyOnLevelUp', 'notifyOnMissionUpdates', 'notifyOnWalletTransactions'
  ];

  for (const field of trackedFields) {
    if (field in data && data[field as keyof NotificationSettingsInput] !== existingSettings[field as keyof NotificationSetting]) {
      await db.insert(userSettingsHistory).values({
        userId,
        settingKey: `notifications.${field}`,
        oldValue: existingSettings[field as keyof NotificationSetting]?.toString() || null,
        newValue: data[field as keyof NotificationSettingsInput]?.toString() || null,
        changedAt: new Date(),
        changedByIp: ipAddress
      });
    }
  }

  // Update the notification settings
  await db.update(notificationSettings)
    .set({
      ...data,
      updatedAt: new Date()
    })
    .where(eq(notificationSettings.userId, userId));

  return { success: true };
};

/**
 * Changes a user's password
 * @param userId The user ID
 * @param data Password change data
 * @param ipAddress The IP address of the requester
 */
export const changePassword = async (
  userId: number, 
  data: PasswordChangeInput, 
  ipAddress?: string
) => {
  // Get the user
  const user = await db.query.users.findFirst({
    where: eq(usersTable.id, userId),
    columns: {
      id: true,
      password: true
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Verify current password
  const isValidPassword = await bcrypt.compare(data.currentPassword, user.password);
  if (!isValidPassword) {
    throw new Error('Current password is incorrect');
  }

  // Hash the new password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(data.newPassword, saltRounds);

  // Update the password
  await db.update(usersTable)
    .set({ password: hashedPassword })
    .where(eq(usersTable.id, userId));

  // Log the password change (without storing the actual passwords)
  await db.insert(userSettingsHistory).values({
    userId,
    settingKey: 'security.passwordChanged',
    oldValue: null, // Don't store old password
    newValue: null, // Don't store new password
    changedAt: new Date(),
    changedByIp: ipAddress
  });

  return { success: true };
};

/**
 * Create default settings for a new user
 * @param userId The user ID
 */
export const createDefaultSettings = async (userId: number) => {
  // Create default user settings
  await db.insert(userSettings).values({
    userId,
    theme: 'auto',
    language: 'en',
    shoutboxPosition: 'sidebar-top',
    profileVisibility: 'public',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Create default notification settings
  await db.insert(notificationSettings).values({
    userId,
    receiveEmailNotifications: false,
    notifyOnMentions: true,
    notifyOnNewReplies: true,
    notifyOnLevelUp: true,
    notifyOnMissionUpdates: true,
    notifyOnWalletTransactions: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  return { success: true };
}; 