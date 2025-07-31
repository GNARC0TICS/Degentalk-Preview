import { db } from '@degentalk/db';
import { notifications } from '@schema';
import { logger } from '@core/logger';
import { eq, desc, and } from 'drizzle-orm';
/**
 * Fetches all notifications for a user based on page size and page offset.
 * @param userId The user ID
 */
export const getNotifications = async (userId, pageSize, pageOffset) => {
    logger.info('NOTIFICATIONS', JSON.stringify({ userId, pageSize, pageOffset }));
    // Fetch the user's notifications
    const fetchedNotifications = await db.query.notifications.findMany({
        where: eq(notifications.userId, userId),
        limit: pageSize,
        offset: pageOffset,
        orderBy: desc(notifications.createdAt)
    });
    return fetchedNotifications;
};
/**
 * Creates a notification from an event log
 * @param eventLog The event log to create a notification from
 * @param title The notification title
 * @param body The notification body
 */
export const createNotificationFromEvent = async (eventLog, title, body) => {
    // Map event type to notification type
    const eventTypeToNotificationType = {
        rain_claimed: 'rain_received',
        level_up: 'level_up',
        badge_earned: 'badge_awarded',
        tip_received: 'tip_received',
        airdrop_claimed: 'airdrop_received',
        referral_completed: 'referral_complete',
        cosmetic_unlocked: 'cosmetic_unlocked',
        mission_completed: 'mission_complete',
        thread_created: 'system',
        post_created: 'thread_reply',
        xp_earned: 'system',
        product_purchased: 'transaction'
    };
    const notificationType = eventTypeToNotificationType[eventLog.eventType] || 'system';
    // Create the notification
    const [result] = await db
        .insert(notifications)
        .values({
        userId: eventLog.userId,
        eventType: notificationType,
        eventLogId: eventLog.id,
        title,
        body,
        data: eventLog.meta,
        isRead: false
    })
        .returning({ id: notifications.id });
    return { id: result.id };
};
/**
 * Marks a notification as read
 * @param notificationId The notification ID
 * @param userId The user ID (for security check)
 */
export const markNotificationAsRead = async (notificationId, userId) => {
    const result = await db
        .update(notifications)
        .set({ isRead: true })
        .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
        .returning({ id: notifications.id });
    return result.length > 0;
};
/**
 * Marks all notifications as read for a user
 * @param userId The user ID
 */
export const markAllNotificationsAsRead = async (userId) => {
    const result = await db
        .update(notifications)
        .set({ isRead: true })
        .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
        .returning({ id: notifications.id });
    return result.length;
};
/**
 * Gets the count of unread notifications for a user
 * @param userId The user ID
 */
export const getUnreadNotificationCount = async (userId) => {
    const result = await db
        .select({ count: notifications.id })
        .from(notifications)
        .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
        .count();
    return Number(result[0]?.count || 0);
};
