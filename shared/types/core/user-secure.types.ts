/**
 * Security-Enhanced User Types
 * 
 * GDPR-compliant, audit-ready user type definitions with proper
 * separation between public, authenticated, and admin-only data.
 * 
 * Re-exports from the user domain for cross-domain usage.
 */

// Import the security-enhanced types from the user domain
export type {
  PublicUser,
  AuthenticatedUserSelf,
  AdminUserDetail,
  UserRole,
  Permission,
  PermissionScope,
  SessionToken,
  UserPreferences,
  NotificationSettings,
  PrivacySettings,
  UserWarning,
  UserSuspension,
  GDPRDataExport,
  LoginRecord,
  DataProcessingRecord,
  CreateUserRequest,
  UpdateUserRequest,
  AdminUpdateUserRequest
} from '../../../server/src/domains/users/types';

// Type guards and utilities for secure user handling
export const isPublicUserSafe = (data: any): boolean => {
  return data && 
    typeof data.id === 'string' &&
    typeof data.username === 'string' &&
    !data.email && // Ensure no email leaked
    !data.ipAddress && // Ensure no IP leaked
    !data.password; // Ensure no password leaked
};

export const hasAdminPermission = (user: any, permission: string): boolean => {
  return user.role === 'admin' || user.role === 'owner' || 
         (user.permissions && user.permissions.includes(permission));
};

// Utility type for API responses that automatically use secure types
// export type SecureUserResponse<T extends 'public' | 'self' | 'admin'> = 
//   T extends 'public' ? PublicUser :
//   T extends 'self' ? AuthenticatedUserSelf :
//   T extends 'admin' ? any : // TODO: Fix AdminUserDetail import
//   never;

// Context type for determining which user data to return
export type UserContext = {
  requestingUser?: {
    id: string;
    role: string;
    permissions?: string[];
  };
  targetUserId: string;
  isSelf: boolean;
  isAdmin: boolean;
};