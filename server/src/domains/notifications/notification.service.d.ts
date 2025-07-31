import type { EventLog } from '@schema';
/**
 * Fetches all notifications for a user based on page size and page offset.
 * @param userId The user ID
 */
export declare const getNotifications: (userId: string, pageSize: number, pageOffset: number) => Promise<any>;
/**
 * Creates a notification from an event log
 * @param eventLog The event log to create a notification from
 * @param title The notification title
 * @param body The notification body
 */
export declare const createNotificationFromEvent: (eventLog: EventLog, title: string, body: string) => Promise<{
    id: string;
}>;
/**
 * Marks a notification as read
 * @param notificationId The notification ID
 * @param userId The user ID (for security check)
 */
export declare const markNotificationAsRead: (notificationId: string, userId: string) => Promise<boolean>;
/**
 * Marks all notifications as read for a user
 * @param userId The user ID
 */
export declare const markAllNotificationsAsRead: (userId: string) => Promise<number>;
/**
 * Gets the count of unread notifications for a user
 * @param userId The user ID
 */
export declare const getUnreadNotificationCount: (userId: string) => Promise<number>;
