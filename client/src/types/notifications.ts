/**
 * Notifications
 */
export interface Notification {
	id: number;
	userId: number;
	type: 'mention' | 'like' | 'reply' | 'tip' | 'achievement' | 'system' | 'admin';
	title: string;
	body: string;
	data: NotificationData;
	isRead: boolean;
	readAt: string;
	createdAt: string;
}

export interface NotificationData {
	threadId?: number;
	postId?: number;
	userId?: number;
	amount?: number;
	achievementId?: string;
	metadata?: Record<string, unknown>;
}

export interface NotificationsParams {
	pageOffset?: number;
}
