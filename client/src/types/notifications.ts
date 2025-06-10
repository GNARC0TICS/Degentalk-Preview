/**
 * Notifications
 */
export interface Notification {
	id: number;
	userId: number;
	type: string;
	title: string;
	body: string;
	data: any;
	isRead: boolean;
	readAt: string;
	createdAt: string;
}

export interface NotificationsParams {
	pageOffset?: number;
}
