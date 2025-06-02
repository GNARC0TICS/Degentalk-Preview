import { z } from 'zod';

/**
 * Profile preferences validation schema
 * Used for updating user profile data
 */
export const profileSettingsSchema = z.object({
  bio: z.string().optional(),
  signature: z.string().optional(),
  avatarUrl: z.string().url().optional().nullable(),
  profileBannerUrl: z.string().url().optional().nullable(),
  discordHandle: z.string().optional().nullable(),
  twitterHandle: z.string().optional().nullable(),
  website: z.string().url().optional().nullable(),
  telegramHandle: z.string().optional().nullable(),
  activeTitleId: z.number().int().positive().optional().nullable(),
  activeBadgeId: z.number().int().positive().optional().nullable(),
  activeFrameId: z.number().int().positive().optional().nullable(),
});

/**
 * Account preferences validation schema
 * Used for updating user display and accessibility preferences
 */
export const accountSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  language: z.string().min(2).max(20).optional(),
  timezone: z.string().optional(),
  shoutboxPosition: z.enum(['sidebar-top', 'sidebar-bottom', 'floating']).optional(),
  profileVisibility: z.enum(['public', 'friends', 'private']).optional(),
  sidebarState: z.record(z.any()).optional(),
});

/**
 * Notification preferences validation schema
 * Used for updating user notification preferences
 */
export const notificationSettingsSchema = z.object({
  receiveEmailNotifications: z.boolean().optional(),
  notifyOnMentions: z.boolean().optional(),
  notifyOnNewReplies: z.boolean().optional(),
  notifyOnLevelUp: z.boolean().optional(),
  notifyOnMissionUpdates: z.boolean().optional(),
  notifyOnWalletTransactions: z.boolean().optional(),
});

/**
 * Password change validation schema
 */
export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export type ProfileSettingsInput = z.infer<typeof profileSettingsSchema>;
export type AccountSettingsInput = z.infer<typeof accountSettingsSchema>;
export type NotificationSettingsInput = z.infer<typeof notificationSettingsSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>; 