/**
 * Social Data Transformer - Security-First Implementation
 *
 * Transforms social relationships, friend requests, and privacy settings
 * into role-appropriate response objects with strict privacy controls.
 */

import type { UserId, RequestId } from '@shared/types/ids';
import { logger } from '@core/logger';

// Social Relationship Interfaces
export interface PublicFriend {
	id: UserId;
	username: string;
	avatarUrl?: string;
	level: number;
	role?: string;
	isOnline?: boolean;
	friendedAt: string;
	mutualFriends?: number;
}

export interface AuthenticatedFriend extends PublicFriend {
	permissions: {
		allowWhispers: boolean;
		allowProfileView: boolean;
		allowActivityView: boolean;
	};
	lastActiveAt?: string;
	notes?: string; // Personal notes about friend
}

export interface AdminFriendDetail extends AuthenticatedFriend {
	adminMetadata: {
		requesterId: UserId;
		addresseeId: UserId;
		requestMessage?: string;
		friendshipHistory: any[];
		totalInteractions: number;
		lastInteraction?: string;
	};
}

// Friend Request Interfaces
export interface PublicFriendRequest {
	id: RequestId;
	from: {
		id: UserId;
		username: string;
		avatarUrl?: string;
		level: number;
	};
	sentAt: string;
	hasMessage: boolean;
}

export interface AuthenticatedFriendRequest extends PublicFriendRequest {
	message?: string;
	mutualFriends: number;
	canAccept: boolean;
	metadata: {
		requesterLevel: number;
		requesterJoinDate: string;
		requesterReputation: number;
	};
}

// Social Preferences Interfaces
export interface PublicSocialPreferences {
	allowFriendRequests: boolean;
	friendListVisibility: 'public' | 'friends' | 'private';
	onlineStatusVisible: boolean;
}

export interface AuthenticatedSocialPreferences extends PublicSocialPreferences {
	onlyMutualsCanRequest: boolean;
	requireMinLevel: boolean;
	minLevelRequired: number;
	autoAcceptFromFollowers: boolean;
	defaultPermissions: {
		allowWhispers: boolean;
		allowProfileView: boolean;
		allowActivityView: boolean;
	};
	notifications: {
		friendRequest: boolean;
		friendAccept: boolean;
		friendOnline: boolean;
		emailNotifications: boolean;
	};
}

// Social Stats Interfaces
export interface PublicSocialStats {
	friendCount: number;
	mutualFriends?: number;
	connectionScore?: number;
}

export interface AuthenticatedSocialStats extends PublicSocialStats {
	pendingIncoming: number;
	pendingOutgoing: number;
	blockedUsers: number;
	friendsSince?: string;
	totalInteractions: number;
}

// Social Search Result Interface
export interface SocialSearchResult {
	id: UserId;
	username: string;
	avatarUrl?: string;
	level: number;
	relationshipStatus: 'none' | 'friends' | 'request_sent' | 'request_received' | 'blocked';
	mutualFriends: number;
	canSendRequest: boolean;
}

export class SocialTransformer {
	/**
	 * Transform friend data for public consumption
	 */
	static toPublicFriend(dbFriend: any, requestingUser?: any): PublicFriend {
		if (!dbFriend || !dbFriend.friend) {
			throw new Error('Invalid friend data provided to transformer');
		}

		const friend = dbFriend.friend;

		return {
			id: friend.id as UserId,
			username: friend.username,
			avatarUrl: friend.avatarUrl || friend.activeAvatarUrl,
			level: friend.level || 1,
			role: this.shouldShowRole(friend.role) ? friend.role : undefined,
			isOnline: this.shouldShowOnlineStatus(friend, requestingUser),
			friendedAt: dbFriend.friendedAt || dbFriend.createdAt,
			mutualFriends: dbFriend.mutualFriends || 0
		};
	}

	/**
	 * Transform friend data for authenticated view
	 */
	static toAuthenticatedFriend(dbFriend: any, requestingUser: any): AuthenticatedFriend {
		const publicData = this.toPublicFriend(dbFriend, requestingUser);

		return {
			...publicData,
			permissions: {
				allowWhispers: dbFriend.permissions?.allowWhispers || false,
				allowProfileView: dbFriend.permissions?.allowProfileView || false,
				allowActivityView: dbFriend.permissions?.allowActivityView || false
			},
			lastActiveAt: this.canViewActivityData(dbFriend.permissions)
				? dbFriend.friend?.lastSeenAt
				: undefined,
			notes: dbFriend.userNotes || undefined
		};
	}

	/**
	 * Transform friend data for admin view
	 */
	static toAdminFriend(dbFriend: any, requestingAdmin: any): AdminFriendDetail {
		const authenticatedData = this.toAuthenticatedFriend(dbFriend, requestingAdmin);

		return {
			...authenticatedData,
			adminMetadata: {
				requesterId: dbFriend.requesterId as UserId,
				addresseeId: dbFriend.addresseeId as UserId,
				requestMessage: dbFriend.requestMessage,
				friendshipHistory: dbFriend.history || [],
				totalInteractions: dbFriend.totalInteractions || 0,
				lastInteraction: dbFriend.lastInteraction
			}
		};
	}

	/**
	 * Transform friend request for public view
	 */
	static toPublicFriendRequest(dbRequest: any): PublicFriendRequest {
		if (!dbRequest || !dbRequest.requester) {
			throw new Error('Invalid friend request data provided to transformer');
		}

		const requester = dbRequest.requester;

		return {
			id: dbRequest.id as RequestId,
			from: {
				id: requester.id as UserId,
				username: requester.username,
				avatarUrl: requester.avatarUrl || requester.activeAvatarUrl,
				level: requester.level || 1
			},
			sentAt: dbRequest.createdAt,
			hasMessage: Boolean(dbRequest.requestMessage)
		};
	}

	/**
	 * Transform friend request for authenticated view
	 */
	static toAuthenticatedFriendRequest(
		dbRequest: any,
		requestingUser: any,
		mutualFriends: number = 0
	): AuthenticatedFriendRequest {
		const publicData = this.toPublicFriendRequest(dbRequest);
		const requester = dbRequest.requester;

		return {
			...publicData,
			message: this.sanitizeRequestMessage(dbRequest.requestMessage),
			mutualFriends,
			canAccept: this.canAcceptRequest(dbRequest, requestingUser),
			metadata: {
				requesterLevel: requester.level || 1,
				requesterJoinDate: requester.createdAt,
				requesterReputation: requester.reputation || requester.clout || 0
			}
		};
	}

	/**
	 * Transform social preferences for public view
	 */
	static toPublicSocialPreferences(dbPreferences: any): PublicSocialPreferences {
		return {
			allowFriendRequests: dbPreferences?.allowAllFriendRequests !== false,
			friendListVisibility: this.determineFriendListVisibility(dbPreferences),
			onlineStatusVisible: dbPreferences?.showOnlineStatus !== false
		};
	}

	/**
	 * Transform social preferences for authenticated view
	 */
	static toAuthenticatedSocialPreferences(dbPreferences: any): AuthenticatedSocialPreferences {
		const publicData = this.toPublicSocialPreferences(dbPreferences);

		return {
			...publicData,
			onlyMutualsCanRequest: dbPreferences?.onlyMutualsCanRequest || false,
			requireMinLevel: dbPreferences?.requireMinLevel || false,
			minLevelRequired: dbPreferences?.minLevelRequired || 1,
			autoAcceptFromFollowers: dbPreferences?.autoAcceptFromFollowers || false,
			defaultPermissions: {
				allowWhispers: dbPreferences?.defaultAllowWhispers !== false,
				allowProfileView: dbPreferences?.defaultAllowProfileView !== false,
				allowActivityView: dbPreferences?.defaultAllowActivityView !== false
			},
			notifications: {
				friendRequest: dbPreferences?.notifyOnFriendRequest !== false,
				friendAccept: dbPreferences?.notifyOnFriendAccept !== false,
				friendOnline: dbPreferences?.notifyOnFriendOnline || false,
				emailNotifications: dbPreferences?.emailOnFriendRequest || false
			}
		};
	}

	/**
	 * Transform social stats for public view
	 */
	static toPublicSocialStats(
		dbStats: any,
		requestingUser?: any,
		mutualFriends?: number
	): PublicSocialStats {
		return {
			friendCount: this.shouldShowFriendCount(dbStats) ? dbStats.friends || 0 : -1,
			mutualFriends: mutualFriends || undefined,
			connectionScore: this.calculateConnectionScore(dbStats, requestingUser)
		};
	}

	/**
	 * Transform social stats for authenticated view
	 */
	static toAuthenticatedSocialStats(dbStats: any, interactions?: any): AuthenticatedSocialStats {
		const publicData = this.toPublicSocialStats(dbStats);

		return {
			...publicData,
			friendCount: dbStats.friends || 0, // Always show to authenticated user
			pendingIncoming: dbStats.incomingRequests || 0,
			pendingOutgoing: dbStats.outgoingRequests || 0,
			blockedUsers: dbStats.blockedUsers || 0,
			friendsSince: interactions?.firstFriendship,
			totalInteractions: interactions?.totalInteractions || 0
		};
	}

	/**
	 * Transform search results for friend search
	 */
	static toSocialSearchResult(
		dbSearchResult: any,
		requestingUser: any,
		mutualFriends: number = 0
	): SocialSearchResult {
		return {
			id: dbSearchResult.id as UserId,
			username: dbSearchResult.username,
			avatarUrl: dbSearchResult.avatarUrl || dbSearchResult.activeAvatarUrl,
			level: dbSearchResult.level || 1,
			relationshipStatus: this.normalizeRelationshipStatus(dbSearchResult.friendshipStatus),
			mutualFriends,
			canSendRequest: this.canSendFriendRequest(dbSearchResult, requestingUser)
		};
	}

	/**
	 * Transform friend lists for display
	 */
	static toFriendsList(
		dbFriends: any[],
		requestingUser: any,
		viewerIsOwner: boolean = false
	): (PublicFriend | AuthenticatedFriend)[] {
		return dbFriends.map((friend) => {
			return viewerIsOwner
				? this.toAuthenticatedFriend(friend, requestingUser)
				: this.toPublicFriend(friend, requestingUser);
		});
	}

	/**
	 * Transform friend request lists
	 */
	static toFriendRequestsList(
		dbRequests: any[],
		requestingUser: any,
		includeDetails: boolean = false
	): (PublicFriendRequest | AuthenticatedFriendRequest)[] {
		return dbRequests.map((request) => {
			return includeDetails
				? this.toAuthenticatedFriendRequest(request, requestingUser)
				: this.toPublicFriendRequest(request);
		});
	}

	/**
	 * Transform search results list
	 */
	static toSocialSearchResults(
		dbResults: any[],
		requestingUser: any,
		mutualFriendsMap?: Record<string, number>
	): SocialSearchResult[] {
		return dbResults.map((result) =>
			this.toSocialSearchResult(result, requestingUser, mutualFriendsMap?.[result.id] || 0)
		);
	}

	// Private helper methods
	private static shouldShowRole(role: string): boolean {
		// Hide sensitive admin roles from public view
		const publicRoles = ['member', 'verified', 'supporter', 'vip'];
		return publicRoles.includes(role?.toLowerCase() || '');
	}

	private static shouldShowOnlineStatus(friend: any, requestingUser?: any): boolean {
		if (!friend.lastSeenAt) return false;

		// Check if friend allows online status to be shown
		if (friend.privacySettings?.showOnlineStatus === false) return false;

		// Calculate if they're online (within last 5 minutes)
		const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
		return new Date(friend.lastSeenAt) > fiveMinutesAgo;
	}

	private static canViewActivityData(permissions: any): boolean {
		return permissions?.allowActivityView === true;
	}

	private static sanitizeRequestMessage(message?: string): string | undefined {
		if (!message) return undefined;

		// Basic sanitization - remove potentially harmful content
		return message
			.trim()
			.substring(0, 500) // Limit length
			.replace(/<[^>]*>/g, '') // Remove HTML tags
			.replace(/[^\w\s\.,!?-]/g, ''); // Remove special characters except basic punctuation
	}

	private static canAcceptRequest(dbRequest: any, requestingUser: any): boolean {
		// Check if the requesting user is the addressee of the request
		return dbRequest.addresseeId === requestingUser?.id;
	}

	private static determineFriendListVisibility(preferences: any): 'public' | 'friends' | 'private' {
		if (preferences?.hideFriendsList) return 'private';
		if (preferences?.friendsOnlyList) return 'friends';
		return 'public';
	}

	private static shouldShowFriendCount(dbStats: any): boolean {
		return !dbStats?.hideFriendCount;
	}

	private static calculateConnectionScore(dbStats: any, requestingUser?: any): number | undefined {
		if (!requestingUser || !dbStats) return undefined;

		// Simple connection score based on mutual friends, interactions, etc.
		const mutualFriends = dbStats.mutualFriends || 0;
		const interactions = dbStats.totalInteractions || 0;

		return Math.min(100, mutualFriends * 10 + interactions * 2);
	}

	private static normalizeRelationshipStatus(
		status: string | null
	): 'none' | 'friends' | 'request_sent' | 'request_received' | 'blocked' {
		switch (status) {
			case 'friends':
				return 'friends';
			case 'request_sent':
				return 'request_sent';
			case 'request_received':
				return 'request_received';
			case 'blocked':
				return 'blocked';
			default:
				return 'none';
		}
	}

	private static canSendFriendRequest(dbUser: any, requestingUser: any): boolean {
		// Can't send request to self
		if (dbUser.id === requestingUser?.id) return false;

		// Can't send if already have relationship
		if (dbUser.friendshipStatus) return false;

		// Check user's preferences (simplified)
		return dbUser.allowFriendRequests !== false;
	}

	/**
	 * Transform social operation result
	 */
	static toSocialOperationResult(
		operation: string,
		success: boolean,
		message: string,
		entityType: string,
		entityId: string,
		metadata?: any
	) {
		return {
			success,
			message,
			operation,
			entityType,
			entityId,
			timestamp: new Date().toISOString(),
			result: metadata?.result,
			affectedUsers: metadata?.affectedUsers || []
		};
	}

	/**
	 * Transform social error responses (security-conscious)
	 */
	static toSocialError(error: string, operation: string, details?: any) {
		// Sanitize error messages to prevent information disclosure
		const safeErrors: Record<string, string> = {
			user_not_found: 'User not found',
			already_friends: 'Already friends with this user',
			request_pending: 'Friend request already pending',
			request_blocked: 'Cannot send friend request to this user',
			insufficient_level: 'Insufficient level to send friend request',
			privacy_blocked: 'User privacy settings prevent this action',
			rate_limited: 'Too many requests',
			invalid_request: 'Invalid request parameters'
		};

		return {
			success: false,
			message: safeErrors[error] || 'Social operation failed',
			operation,
			timestamp: new Date().toISOString()
			// Never expose: internal user data, relationship details, etc.
		};
	}

	/**
	 * Transform mutual friends data
	 */
	static toMutualFriends(
		dbMutualFriends: any[],
		requestingUser: any,
		canViewDetails: boolean = false
	) {
		return {
			count: dbMutualFriends.length,
			friends: canViewDetails
				? dbMutualFriends.map((friend) => this.toPublicFriend({ friend }, requestingUser))
				: undefined,
			preview: dbMutualFriends.slice(0, 3).map((friend) => ({
				id: friend.id as UserId,
				username: friend.username,
				avatarUrl: friend.avatarUrl
			}))
		};
	}
}
