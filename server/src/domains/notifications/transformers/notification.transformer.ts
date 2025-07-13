/**
 * Notification Data Transformer - Security-First Implementation
 *
 * Transforms notification data, event logs, and user activity
 * into role-appropriate response objects with privacy controls.
 */

import type { UserId, NotificationId } from '@shared/types/ids';
import { logger } from '@core/logger';

// Notification Interfaces
export interface PublicNotification {
	id: NotificationId;
	type: string;
	title: string;
	body: string;
	isRead: boolean;
	createdAt: string;
	priority: 'low' | 'medium' | 'high';
	category: 'system' | 'social' | 'activity' | 'transaction';
}

export interface AuthenticatedNotification extends PublicNotification {
	data?: Record<string, any>;
	actionUrl?: string;
	expiresAt?: string;
	relatedEntities?: {
		type: string;
		id: string;
		name?: string;
	}[];
	metadata: {
		source: string;
		canDismiss: boolean;
		requiresAction: boolean;
		actionType?: string;
	};
}

export interface AdminNotification extends AuthenticatedNotification {
	adminMetadata: {
		eventLogId?: string;
		originalEventType: string;
		processingDelay?: number;
		deliveryAttempts: number;
		errorHistory: any[];
	};
	rawEventData?: Record<string, any>; // Only for debugging
}

// Notification Summary Interfaces
export interface NotificationSummary {
	total: number;
	unread: number;
	categories: {
		system: number;
		social: number;
		activity: number;
		transaction: number;
	};
	highPriority: number;
	requiresAction: number;
}

export interface AuthenticatedNotificationSummary extends NotificationSummary {
	recentTypes: string[];
	lastNotification?: string;
	preferences: {
		enablePush: boolean;
		enableEmail: boolean;
		quietHours: boolean;
		categories: string[];
	};
}

// Notification Preferences Interface
export interface NotificationPreferences {
	enabled: boolean;
	channels: {
		push: boolean;
		email: boolean;
		inApp: boolean;
		sms?: boolean;
	};
	frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
	categories: {
		system: boolean;
		social: boolean;
		activity: boolean;
		transaction: boolean;
		marketing: boolean;
	};
	quietHours: {
		enabled: boolean;
		start: string; // HH:MM format
		end: string; // HH:MM format
		timezone: string;
	};
	filters: {
		minLevel?: number;
		keywords?: string[];
		blockedUsers?: UserId[];
	};
}

export class NotificationTransformer {
	/**
	 * Transform notification for public consumption
	 */
	static toPublicNotification(dbNotification: any): PublicNotification {
		if (!dbNotification) {
			throw new Error('Invalid notification data provided to transformer');
		}

		return {
			id: dbNotification.id as NotificationId,
			type: this.normalizeNotificationType(dbNotification.eventType),
			title: this.sanitizeTitle(dbNotification.title),
			body: this.sanitizeBody(dbNotification.body),
			isRead: Boolean(dbNotification.isRead),
			createdAt: dbNotification.createdAt,
			priority: this.calculatePriority(dbNotification.eventType),
			category: this.categorizeNotification(dbNotification.eventType)
		};
	}

	/**
	 * Transform notification for authenticated user
	 */
	static toAuthenticatedNotification(
		dbNotification: any,
		requestingUser: any
	): AuthenticatedNotification {
		const publicData = this.toPublicNotification(dbNotification);

		return {
			...publicData,
			data: this.sanitizeNotificationData(dbNotification.data),
			actionUrl: this.generateActionUrl(dbNotification),
			expiresAt: this.calculateExpiryDate(dbNotification),
			relatedEntities: this.extractRelatedEntities(dbNotification),
			metadata: {
				source: this.determineSource(dbNotification),
				canDismiss: this.canDismissNotification(dbNotification),
				requiresAction: this.requiresUserAction(dbNotification),
				actionType: this.getActionType(dbNotification)
			}
		};
	}

	/**
	 * Transform notification for admin view
	 */
	static toAdminNotification(dbNotification: any, requestingAdmin: any): AdminNotification {
		const authenticatedData = this.toAuthenticatedNotification(dbNotification, requestingAdmin);

		return {
			...authenticatedData,
			adminMetadata: {
				eventLogId: dbNotification.eventLogId,
				originalEventType: dbNotification.eventType,
				processingDelay: this.calculateProcessingDelay(dbNotification),
				deliveryAttempts: dbNotification.deliveryAttempts || 1,
				errorHistory: dbNotification.errorHistory || []
			},
			rawEventData: this.sanitizeRawEventData(dbNotification.data)
		};
	}

	/**
	 * Transform notification summary for user
	 */
	static toNotificationSummary(notifications: any[], requestingUser?: any): NotificationSummary {
		const categories = this.categorizeNotifications(notifications);

		return {
			total: notifications.length,
			unread: notifications.filter((n) => !n.isRead).length,
			categories: {
				system: categories.system,
				social: categories.social,
				activity: categories.activity,
				transaction: categories.transaction
			},
			highPriority: notifications.filter((n) => this.calculatePriority(n.eventType) === 'high')
				.length,
			requiresAction: notifications.filter((n) => this.requiresUserAction(n)).length
		};
	}

	/**
	 * Transform notification summary for authenticated user
	 */
	static toAuthenticatedNotificationSummary(
		notifications: any[],
		preferences: any,
		requestingUser: any
	): AuthenticatedNotificationSummary {
		const baseSummary = this.toNotificationSummary(notifications, requestingUser);

		const recentTypes = notifications
			.slice(0, 10)
			.map((n) => n.eventType)
			.filter((type, index, arr) => arr.indexOf(type) === index)
			.slice(0, 5);

		return {
			...baseSummary,
			recentTypes,
			lastNotification: notifications[0]?.createdAt,
			preferences: {
				enablePush: preferences?.channels?.push !== false,
				enableEmail: preferences?.channels?.email !== false,
				quietHours: preferences?.quietHours?.enabled || false,
				categories: Object.keys(preferences?.categories || {}).filter(
					(key) => preferences.categories[key]
				)
			}
		};
	}

	/**
	 * Transform notification preferences
	 */
	static toNotificationPreferences(dbPreferences: any): NotificationPreferences {
		return {
			enabled: dbPreferences?.enabled !== false,
			channels: {
				push: dbPreferences?.channels?.push !== false,
				email: dbPreferences?.channels?.email !== false,
				inApp: dbPreferences?.channels?.inApp !== false,
				sms: dbPreferences?.channels?.sms || false
			},
			frequency: dbPreferences?.frequency || 'immediate',
			categories: {
				system: dbPreferences?.categories?.system !== false,
				social: dbPreferences?.categories?.social !== false,
				activity: dbPreferences?.categories?.activity !== false,
				transaction: dbPreferences?.categories?.transaction !== false,
				marketing: dbPreferences?.categories?.marketing || false
			},
			quietHours: {
				enabled: dbPreferences?.quietHours?.enabled || false,
				start: dbPreferences?.quietHours?.start || '22:00',
				end: dbPreferences?.quietHours?.end || '08:00',
				timezone: dbPreferences?.quietHours?.timezone || 'UTC'
			},
			filters: {
				minLevel: dbPreferences?.filters?.minLevel,
				keywords: dbPreferences?.filters?.keywords || [],
				blockedUsers: dbPreferences?.filters?.blockedUsers || []
			}
		};
	}

	/**
	 * Transform notification list for display
	 */
	static toNotificationList(
		dbNotifications: any[],
		requestingUser: any,
		includeDetails: boolean = false
	): (PublicNotification | AuthenticatedNotification)[] {
		return dbNotifications.map((notification) => {
			return includeDetails
				? this.toAuthenticatedNotification(notification, requestingUser)
				: this.toPublicNotification(notification);
		});
	}

	// Private helper methods
	private static normalizeNotificationType(eventType: string): string {
		const typeMap: Record<string, string> = {
			rain_received: 'rain',
			tip_received: 'tip',
			level_up: 'achievement',
			badge_awarded: 'achievement',
			airdrop_received: 'reward',
			referral_complete: 'referral',
			cosmetic_unlocked: 'cosmetic',
			mission_complete: 'mission',
			thread_reply: 'reply',
			transaction: 'payment',
			system: 'system'
		};

		return typeMap[eventType] || 'notification';
	}

	private static sanitizeTitle(title: string): string {
		if (!title) return 'Notification';

		return title
			.trim()
			.substring(0, 100)
			.replace(/<[^>]*>/g, '') // Remove HTML
			.replace(/[^\w\s\.,!?-]/g, ''); // Remove special chars
	}

	private static sanitizeBody(body: string): string {
		if (!body) return '';

		return body
			.trim()
			.substring(0, 500)
			.replace(/<[^>]*>/g, '') // Remove HTML
			.replace(/[^\w\s\.,!?-]/g, ''); // Remove special chars
	}

	private static calculatePriority(eventType: string): 'low' | 'medium' | 'high' {
		const highPriorityTypes = ['transaction', 'system', 'security'];
		const mediumPriorityTypes = ['tip_received', 'rain_received', 'level_up'];

		if (highPriorityTypes.some((type) => eventType.includes(type))) return 'high';
		if (mediumPriorityTypes.includes(eventType)) return 'medium';
		return 'low';
	}

	private static categorizeNotification(
		eventType: string
	): 'system' | 'social' | 'activity' | 'transaction' {
		if (
			eventType.includes('transaction') ||
			eventType.includes('tip') ||
			eventType.includes('rain') ||
			eventType.includes('airdrop')
		) {
			return 'transaction';
		}

		if (
			eventType.includes('reply') ||
			eventType.includes('mention') ||
			eventType.includes('friend') ||
			eventType.includes('follow')
		) {
			return 'social';
		}

		if (
			eventType.includes('level') ||
			eventType.includes('badge') ||
			eventType.includes('mission') ||
			eventType.includes('achievement')
		) {
			return 'activity';
		}

		return 'system';
	}

	private static categorizeNotifications(notifications: any[]) {
		return {
			system: notifications.filter((n) => this.categorizeNotification(n.eventType) === 'system')
				.length,
			social: notifications.filter((n) => this.categorizeNotification(n.eventType) === 'social')
				.length,
			activity: notifications.filter((n) => this.categorizeNotification(n.eventType) === 'activity')
				.length,
			transaction: notifications.filter(
				(n) => this.categorizeNotification(n.eventType) === 'transaction'
			).length
		};
	}

	private static sanitizeNotificationData(data: any): Record<string, any> | undefined {
		if (!data) return undefined;

		const sanitized = { ...data };

		// Remove sensitive fields
		const sensitiveKeys = ['password', 'token', 'secret', 'ip', 'email'];
		sensitiveKeys.forEach((key) => {
			if (sanitized[key]) {
				delete sanitized[key];
			}
		});

		return sanitized;
	}

	private static generateActionUrl(notification: any): string | undefined {
		const urlMap: Record<string, (data: any) => string> = {
			thread_reply: (data) => `/threads/${data?.threadId}#post-${data?.postId}`,
			tip_received: (data) => `/wallet/transactions/${data?.transactionId}`,
			friend_request: (data) => `/profile/friends/requests`,
			mention: (data) => `/posts/${data?.postId}`,
			level_up: () => `/profile/achievements`,
			badge_awarded: () => `/profile/badges`
		};

		const generator = urlMap[notification.eventType];
		return generator ? generator(notification.data) : undefined;
	}

	private static calculateExpiryDate(notification: any): string | undefined {
		// Some notifications expire (like friend requests, limited-time offers)
		const expiringTypes = ['friend_request', 'limited_offer', 'temporary_boost'];

		if (!expiringTypes.includes(notification.eventType)) return undefined;

		const daysToExpire = notification.eventType === 'friend_request' ? 30 : 7;
		const expiryDate = new Date(notification.createdAt);
		expiryDate.setDate(expiryDate.getDate() + daysToExpire);

		return expiryDate.toISOString();
	}

	private static extractRelatedEntities(
		notification: any
	): Array<{ type: string; id: string; name?: string }> {
		const entities: Array<{ type: string; id: string; name?: string }> = [];
		const data = notification.data || {};

		if (data.userId) entities.push({ type: 'user', id: data.userId, name: data.username });
		if (data.threadId) entities.push({ type: 'thread', id: data.threadId, name: data.threadTitle });
		if (data.postId) entities.push({ type: 'post', id: data.postId });
		if (data.transactionId) entities.push({ type: 'transaction', id: data.transactionId });

		return entities;
	}

	private static determineSource(notification: any): string {
		return notification.source || 'system';
	}

	private static canDismissNotification(notification: any): boolean {
		const nonDismissibleTypes = ['system_maintenance', 'security_alert', 'account_suspended'];
		return !nonDismissibleTypes.includes(notification.eventType);
	}

	private static requiresUserAction(notification: any): boolean {
		const actionTypes = ['friend_request', 'trade_offer', 'verification_required'];
		return actionTypes.includes(notification.eventType);
	}

	private static getActionType(notification: any): string | undefined {
		const actionMap: Record<string, string> = {
			friend_request: 'accept_decline',
			trade_offer: 'accept_decline',
			verification_required: 'verify',
			survey: 'complete'
		};

		return actionMap[notification.eventType];
	}

	private static calculateProcessingDelay(notification: any): number | undefined {
		if (!notification.eventLogCreatedAt) return undefined;

		const eventTime = new Date(notification.eventLogCreatedAt);
		const notificationTime = new Date(notification.createdAt);

		return notificationTime.getTime() - eventTime.getTime();
	}

	private static sanitizeRawEventData(data: any): Record<string, any> | undefined {
		if (!data) return undefined;

		// For admin view, provide more detail but still sanitize passwords/tokens
		const sanitized = { ...data };

		const sensitiveKeys = ['password', 'passwordHash', 'token', 'secret', 'apiKey'];
		sensitiveKeys.forEach((key) => {
			if (sanitized[key]) {
				sanitized[key] = '[REDACTED]';
			}
		});

		return sanitized;
	}

	/**
	 * Transform notification operation result
	 */
	static toNotificationOperationResult(
		operation: string,
		success: boolean,
		message: string,
		notificationId?: NotificationId,
		metadata?: any
	) {
		return {
			success,
			message,
			operation,
			notificationId,
			timestamp: new Date().toISOString(),
			affected: metadata?.affected || 1,
			details: metadata?.details
		};
	}

	/**
	 * Transform notification error responses (security-conscious)
	 */
	static toNotificationError(error: string, operation: string) {
		const safeErrors: Record<string, string> = {
			notification_not_found: 'Notification not found',
			unauthorized_access: 'Unauthorized access to notification',
			already_read: 'Notification already marked as read',
			already_dismissed: 'Notification already dismissed',
			invalid_preferences: 'Invalid notification preferences',
			rate_limited: 'Too many notification requests'
		};

		return {
			success: false,
			message: safeErrors[error] || 'Notification operation failed',
			operation,
			timestamp: new Date().toISOString()
		};
	}
}
