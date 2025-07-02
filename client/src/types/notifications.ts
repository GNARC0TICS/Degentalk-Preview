/**
 * Notifications
 */

import type { UserId, ThreadId, PostId } from '@db/types';
export interface Notification {
	id: UserId;
	userId: UserId;
	type: 'mention' | 'like' | 'reply' | 'tip' | 'achievement' | 'system' | 'admin';
	title: string;
	body: string;
	data: NotificationData;
	isRead: boolean;
	readAt: string;
	createdAt: string;
}

export interface NotificationData {
	threadId?: ThreadId;
	postId?: PostId;
	userId?: UserId;
	amount?: number;
	achievementId?: string;
	metadata?: Record<string, unknown>;
}

export interface NotificationsParams {
	pageOffset?: number;
}
