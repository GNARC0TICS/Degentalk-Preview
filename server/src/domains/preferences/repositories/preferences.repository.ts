import { eq, and, desc } from 'drizzle-orm';
import { db } from '@db';
import { 
  userSettings,
  notificationSettings,
  displayPreferences
} from '@db/schema/user/preferences';
import type { UserId } from '@shared/types/ids';

/**
 * Repository for preferences domain
 * All database operations for preferences should go through this repository
 */
export class PreferencesRepository {
  /**
   * Find all preferences for a user (combined view)
   */
  async findAllByUserId(userId: UserId) {
    const userPrefs = await db.query.userSettings.findFirst({
      where: eq(userSettings.userId, userId)
    });

    const notifPrefs = await db.query.notificationSettings.findFirst({
      where: eq(notificationSettings.userId, userId)
    });

    const displayPrefs = await db.query.displayPreferences.findFirst({
      where: eq(displayPreferences.userId, userId)
    });

    return {
      userSettings: userPrefs || null,
      notificationSettings: notifPrefs || null,
      displayPreferences: displayPrefs || null
    };
  }

  /**
   * Find user settings by user ID
   */
  async findUserSettingsByUserId(userId: UserId) {
    const [result] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);
    
    return result || null;
  }

  /**
   * Find notification settings by user ID
   */
  async findNotificationSettingsByUserId(userId: UserId) {
    const [result] = await db
      .select()
      .from(notificationSettings)
      .where(eq(notificationSettings.userId, userId))
      .limit(1);
    
    return result || null;
  }

  /**
   * Find display preferences by user ID
   */
  async findDisplayPreferencesByUserId(userId: UserId) {
    const [result] = await db
      .select()
      .from(displayPreferences)
      .where(eq(displayPreferences.userId, userId))
      .limit(1);
    
    return result || null;
  }

  /**
   * Create user settings
   */
  async createUserSettings(data: any) {
    const [created] = await db
      .insert(userSettings)
      .values({
        ...data,
        updatedAt: new Date()
      })
      .returning();
    
    return created;
  }

  /**
   * Create notification settings
   */
  async createNotificationSettings(data: any) {
    const [created] = await db
      .insert(notificationSettings)
      .values({
        ...data,
        updatedAt: new Date()
      })
      .returning();
    
    return created;
  }

  /**
   * Create display preferences
   */
  async createDisplayPreferences(data: any) {
    const [created] = await db
      .insert(displayPreferences)
      .values({
        ...data,
        updatedAt: new Date()
      })
      .returning();
    
    return created;
  }

  /**
   * Update user settings
   */
  async updateUserSettings(userId: UserId, data: any) {
    const [updated] = await db
      .update(userSettings)
      .set({ 
        ...data, 
        updatedAt: new Date() 
      })
      .where(eq(userSettings.userId, userId))
      .returning();
    
    return updated;
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(userId: UserId, data: any) {
    const [updated] = await db
      .update(notificationSettings)
      .set({ 
        ...data, 
        updatedAt: new Date() 
      })
      .where(eq(notificationSettings.userId, userId))
      .returning();
    
    return updated;
  }

  /**
   * Update display preferences
   */
  async updateDisplayPreferences(userId: UserId, data: any) {
    const [updated] = await db
      .update(displayPreferences)
      .set({ 
        ...data, 
        updatedAt: new Date() 
      })
      .where(eq(displayPreferences.userId, userId))
      .returning();
    
    return updated;
  }

  /**
   * Create default preferences for a new user
   */
  async createDefaultPreferences(userId: UserId) {
    const defaultUserSettings = {
      userId,
      theme: 'auto',
      shoutboxPosition: 'sidebar-top',
      sidebarState: {},
      profileVisibility: 'public',
      language: 'en',
      timezone: 'UTC'
    };

    const defaultNotificationSettings = {
      userId,
      receiveMentionNotifications: true,
      receiveReplyNotifications: true,
      receivePmNotifications: true,
      receiveFriendNotifications: true,
      receiveFollowNotifications: true,
      receiveShopNotifications: true,
      receiveSystemNotifications: true,
      receiveEmailNotifications: false
    };

    const defaultDisplayPreferences = {
      userId,
      theme: 'system',
      fontSize: 'medium',
      threadDisplayMode: 'card',
      reducedMotion: false,
      hideNsfw: true,
      showMatureContent: false,
      showOfflineUsers: true
    };

    await db.transaction(async (tx) => {
      await tx.insert(userSettings).values(defaultUserSettings);
      await tx.insert(notificationSettings).values(defaultNotificationSettings);
      await tx.insert(displayPreferences).values(defaultDisplayPreferences);
    });

    return {
      userSettings: defaultUserSettings,
      notificationSettings: defaultNotificationSettings,
      displayPreferences: defaultDisplayPreferences
    };
  }
}

// Export singleton instance
export const preferencesRepository = new PreferencesRepository();
