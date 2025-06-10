import { db } from '@db';
import { notifications } from '@schema';
import { logger } from '@server/src/core/logger';
import { eq, desc } from 'drizzle-orm';

/**
 * Fetches all notifications for a user based on page size and page offset.
 * @param userId The user ID
 */
export const getNotifications = async (userId: number, pageSize: number, pageOffset: number) => {
	logger.info('NOTIFICATIONS', JSON.stringify({ userId, pageSize, pageOffset }));

	// Fetch the user's notifications
	const fetchedNotifications = await db.query.notifications.findMany({
		where: eq(notifications.userId, userId),
		limit: pageSize,
		offset: pageOffset,
		orderBy: desc(notifications.createdAt),
		columns: {
			id: true,
			body: true,
			createdAt: true,
			data: true,
			isRead: true,
			readAt: true,
			title: true,
			type: true,
			userId: true
		}
	});

	return fetchedNotifications;
};
