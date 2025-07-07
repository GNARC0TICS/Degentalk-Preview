/**
 * User Domain Types - Security-First Implementation
 * 
 * GDPR-compliant, audit-ready user type definitions with proper
 * separation between public, authenticated, and admin-only data.
 */

import type { UserId } from '@shared/types/ids';

// Base user data that's safe for public consumption
export interface PublicUser {
  id: UserId;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  role: UserRole;
  isOnline: boolean;
  lastSeen?: Date;
  createdAt: Date;
  // Statistics safe for public view
  stats?: {
    postCount: number;
    threadCount: number;
    reputation: number;
  };
}

// Additional data for authenticated user viewing their own profile
export interface AuthenticatedUserSelf extends PublicUser {
  email: string;
  emailVerified: boolean;
  preferences: UserPreferences;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  // No sensitive admin data
}

// Admin-only user details (GDPR-sensitive)
export interface AdminUserDetail extends AuthenticatedUserSelf {
  // GDPR-sensitive fields - admin only
  ipAddressHash?: string; // Never store raw IPs
  registrationIp?: string; // Anonymized after 30 days
  lastLoginIp?: string; // Anonymized after 30 days
  // Moderation data
  moderationNotes?: string;
  warnings: UserWarning[];
  suspensions: UserSuspension[];
  // Internal tracking
  internalNotes?: string;
  riskScore?: number;
}

// User roles with proper hierarchy
export type UserRole = 'user' | 'vip' | 'moderator' | 'admin' | 'owner';

// Permission system
export interface Permission {
  id: string;
  name: string;
  description: string;
  scope: PermissionScope;
}

export type PermissionScope = 
  | 'forum.read' 
  | 'forum.write' 
  | 'forum.moderate'
  | 'admin.users'
  | 'admin.settings'
  | 'admin.system'
  | 'economy.view'
  | 'economy.admin';

// Session management
export interface SessionToken {
  id: string;
  userId: UserId;
  token: string;
  expiresAt: Date;
  device?: string;
  ipHash?: string; // Always hashed, never raw
  lastUsed: Date;
}

// User preferences with privacy controls
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean; // GDPR consent required
}

// Notification settings
export interface NotificationSettings {
  mentions: boolean;
  replies: boolean;
  tips: boolean;
  achievements: boolean;
  moderation: boolean;
}

// Privacy settings with GDPR controls
export interface PrivacySettings {
  profileVisibility: 'public' | 'members' | 'friends' | 'private';
  onlineStatus: boolean;
  lastSeen: boolean;
  emailVisible: boolean;
  allowDirectMessages: 'all' | 'friends' | 'none';
  // GDPR controls
  dataProcessingConsent: boolean;
  analyticsConsent: boolean;
  marketingConsent: boolean;
  consentDate: Date;
}

// Moderation types
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

// GDPR compliance types
export interface GDPRDataExport {
  user: AuthenticatedUserSelf;
  posts: any[]; // Domain-specific data
  transactions: any[]; // Domain-specific data
  loginHistory: LoginRecord[];
  dataProcessingLog: DataProcessingRecord[];
}

export interface LoginRecord {
  timestamp: Date;
  ipHash: string; // Never raw IP
  device?: string;
  success: boolean;
}

export interface DataProcessingRecord {
  action: string;
  timestamp: Date;
  purpose: string;
  legalBasis: string;
}

// Request/Response types for API
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

// Type guards for runtime validation
export const isPublicUserSafe = (data: any): data is PublicUser => {
  return data && 
    typeof data.id === 'string' &&
    typeof data.username === 'string' &&
    !data.email && // Ensure no email leaked
    !data.ipAddress && // Ensure no IP leaked
    !data.password; // Ensure no password leaked
};

export const hasAdminPermission = (user: any, permission: PermissionScope): boolean => {
  // Implementation for role-based permission checking
  return user.role === 'admin' || user.role === 'owner' || 
         (user.permissions && user.permissions.includes(permission));
};