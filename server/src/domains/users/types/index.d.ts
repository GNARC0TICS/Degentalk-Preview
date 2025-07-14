/**
 * User Domain Types - Security-First Implementation
 *
 * GDPR-compliant, audit-ready user type definitions with proper
 * separation between public, authenticated, and admin-only data.
 */
import type { UserId } from '@shared/types/ids';
export interface PublicUser {
    id: UserId;
    username: string;
    displayName?: string;
    avatarUrl?: string;
    role: UserRole;
    isOnline: boolean;
    lastSeen?: Date;
    createdAt: Date;
    stats?: {
        postCount: number;
        threadCount: number;
        reputation: number;
    };
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
    internalNotes?: string;
    riskScore?: number;
}
export type UserRole = 'user' | 'vip' | 'moderator' | 'admin' | 'owner';
export interface Permission {
    id: string;
    name: string;
    description: string;
    scope: PermissionScope;
}
export type PermissionScope = 'forum.read' | 'forum.write' | 'forum.moderate' | 'admin.users' | 'admin.settings' | 'admin.system' | 'economy.view' | 'economy.admin';
export interface SessionToken {
    id: string;
    userId: UserId;
    token: string;
    expiresAt: Date;
    device?: string;
    ipHash?: string;
    lastUsed: Date;
}
export interface UserPreferences {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
    marketingEmails: boolean;
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
    allowDirectMessages: 'all' | 'friends' | 'none';
    dataProcessingConsent: boolean;
    analyticsConsent: boolean;
    marketingConsent: boolean;
    consentDate: Date;
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
    user: AuthenticatedUserSelf;
    posts: any[];
    transactions: any[];
    loginHistory: LoginRecord[];
    dataProcessingLog: DataProcessingRecord[];
}
export interface LoginRecord {
    timestamp: Date;
    ipHash: string;
    device?: string;
    success: boolean;
}
export interface DataProcessingRecord {
    action: string;
    timestamp: Date;
    purpose: string;
    legalBasis: string;
}
export interface CreateUserRequest {
    username: string;
    email: string;
    password: string;
    displayName?: string;
    gdprConsent: boolean;
    marketingConsent?: boolean;
}
export interface UpdateUserRequest {
    displayName?: string;
    avatarUrl?: string;
    preferences?: Partial<UserPreferences>;
    privacy?: Partial<PrivacySettings>;
}
export interface AdminUpdateUserRequest {
    role?: UserRole;
    suspended?: boolean;
    suspensionReason?: string;
    suspensionExpiresAt?: Date;
    moderationNotes?: string;
    internalNotes?: string;
}
export declare const isPublicUserSafe: (data: any) => data is PublicUser;
export declare const hasAdminPermission: (user: any, permission: PermissionScope) => boolean;
