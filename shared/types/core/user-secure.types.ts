/**
 * Security-Enhanced User Types
 *
 * GDPR-compliant, audit-ready user type definitions with proper
 * separation between public, authenticated, and admin-only data.
 *
 * Re-exports from the user domain for cross-domain usage.
 */

// Import necessary types
import type { UserId } from '../ids.js';

// Security-enhanced user types
export type UserRole = 'admin' | 'moderator' | 'user' | 'banned';

export interface PublicUser {
	id: UserId;
	username: string;
	displayName?: string;
	avatarUrl?: string;
	role: UserRole;
	createdAt: Date;
}

export interface AuthenticatedUserSelf extends PublicUser {
	email: string;
	emailVerified: boolean;
	preferences: UserPreferences;
	notifications: NotificationSettings;
	privacy: PrivacySettings;
}

export interface AdminUserDetail extends AuthenticatedUserSelf {
	ipAddressHash?: string;
	registrationIp?: string;
	lastLoginIp?: string;
	moderationNotes?: string;
	warnings: UserWarning[];
	suspensions: UserSuspension[];
}

export type Permission = string;
export type PermissionScope = 'global' | 'forum' | 'thread' | 'user';

export interface SessionToken {
	token: string;
	userId: UserId;
	expiresAt: Date;
}

export interface UserPreferences {
	theme: 'light' | 'dark' | 'auto';
	language: string;
	timezone: string;
}

export interface NotificationSettings {
	mentions: boolean;
	replies: boolean;
	tips: boolean;
	achievements: boolean;
	moderation: boolean;
}

export interface PrivacySettings {
	profileVisibility: 'public' | 'members' | 'friends' | 'private';
	onlineStatus: boolean;
	lastSeen: boolean;
	emailVisible: boolean;
}

export interface UserWarning {
	id: string;
	reason: string;
	issuedBy: UserId;
	issuedAt: Date;
	expiresAt?: Date;
}

export interface UserSuspension {
	id: string;
	reason: string;
	issuedBy: UserId;
	issuedAt: Date;
	expiresAt: Date;
	appealable: boolean;
}

export interface GDPRDataExport {
	userId: UserId;
	requestedAt: Date;
	completedAt?: Date;
	downloadUrl?: string;
}

export interface LoginRecord {
	userId: UserId;
	timestamp: Date;
	ipAddress: string;
	userAgent: string;
	success: boolean;
}

export interface DataProcessingRecord {
	userId: UserId;
	processType: string;
	timestamp: Date;
	purpose: string;
	lawfulBasis: string;
}

export interface CreateUserRequest {
	username: string;
	email: string;
	password: string;
	displayName?: string;
}

export interface UpdateUserRequest {
	displayName?: string;
	bio?: string;
	avatarUrl?: string;
	preferences?: Partial<UserPreferences>;
}

export interface AdminUpdateUserRequest extends UpdateUserRequest {
	role?: UserRole;
	emailVerified?: boolean;
	moderationNotes?: string;
}

export interface UserContext {
	user: AuthenticatedUserSelf;
	permissions: Permission[];
	sessionToken: SessionToken;
}

// Type guards and utilities for secure user handling
export const isPublicUserSafe = (data: any): boolean => {
	return (
		data &&
		typeof data.id === 'string' &&
		typeof data.username === 'string' &&
		!data.email && // Ensure no email leaked
		!data.ipAddress && // Ensure no IP leaked
		!data.password
	); // Ensure no password leaked
};

export const hasAdminPermission = (user: any, permission: string): boolean => {
	return (
		user.role === 'admin' ||
		user.role === 'owner' ||
		(user.permissions && user.permissions.includes(permission))
	);
};

// Utility type for API responses that automatically use secure types
// export type SecureUserResponse<T extends 'public' | 'self' | 'admin'> =
//   T extends 'public' ? PublicUser :
//   T extends 'self' ? AuthenticatedUserSelf :
//   T extends 'admin' ? any : // TODO: Fix AdminUserDetail import
//   never;

// Context type for determining which user data to return
export type UserRequestContext = {
	requestingUser?: {
		id: string;
		role: string;
		permissions?: string[];
	};
	targetUserId: string;
	isSelf: boolean;
	isAdmin: boolean;
};
