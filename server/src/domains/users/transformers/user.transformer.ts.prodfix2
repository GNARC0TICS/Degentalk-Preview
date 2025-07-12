/**
 * User Data Transformer - Security-First Implementation
 * 
 * Transforms raw database user records into role-appropriate
 * response objects with GDPR compliance and audit trail.
 */

// STREAM-LOCK: B
import type { 
  PublicUser, 
  AuthenticatedUserSelf, 
  AdminUserDetail,
  UserRole 
} from '../types';
import type { DisplaySettings } from '../../../../../shared/types/core/user.types';
import type { 
  PublicUserDTO,
  AuthenticatedUserSelfDTO,
  UserProfileDTO
} from '../../../../../shared/dto/user';
import type { UserId } from '../../../../../shared/types/ids';
import { createHash } from 'crypto';

export class UserTransformer {
  /**
   * Transform user data for public consumption
   * Strips all sensitive information (email, IP, admin data)
   */
  static toPublicUser(dbUser: any): PublicUser {
    if (!dbUser) {
      throw new Error('Invalid user data provided to transformer');
    }

    return {
      id: dbUser.id as UserId,
      username: dbUser.username,
      displayName: dbUser.displayName || undefined,
      avatarUrl: dbUser.avatarUrl || undefined,
      role: dbUser.role as UserRole,
      isOnline: this.calculateOnlineStatus(dbUser.lastSeen),
      lastSeen: this.shouldShowLastSeen(dbUser) ? dbUser.lastSeen : undefined,
      createdAt: dbUser.createdAt,
      stats: dbUser.stats ? {
        postCount: dbUser.stats.postCount || 0,
        threadCount: dbUser.stats.threadCount || 0,
        reputation: dbUser.stats.reputation || dbUser.reputation || 0
      } : undefined
    };
  }

  /**
   * Transform user data for API public consumption (DTO)
   */
  static toPublicUserDTO(dbUser: any): PublicUserDTO {
    if (!dbUser) {
      throw new Error('Invalid user data provided to transformer');
    }

    return {
      id: dbUser.id as UserId,
      username: dbUser.username,
      displayName: dbUser.displayName || undefined,
      avatarUrl: dbUser.avatarUrl || undefined,
      role: dbUser.role as UserRole,
      isOnline: this.calculateOnlineStatus(dbUser.lastSeen),
      lastSeen: this.shouldShowLastSeen(dbUser) ? dbUser.lastSeen : undefined,
      createdAt: dbUser.createdAt,
      stats: dbUser.stats ? {
        postCount: dbUser.stats.postCount || 0,
        threadCount: dbUser.stats.threadCount || 0,
        reputation: dbUser.stats.reputation || dbUser.reputation || 0
      } : undefined
    };
  }

  /**
   * Transform user data for authenticated user viewing their own profile
   * Includes personal settings but no admin-only data
   */
  static toAuthenticatedSelf(dbUser: any): AuthenticatedUserSelf {
    const publicData = this.toPublicUser(dbUser);
    
    return {
      ...publicData,
      email: dbUser.email,
      emailVerified: dbUser.emailVerified || false,
      preferences: dbUser.preferences || this.getDefaultPreferences(),
      notifications: dbUser.notificationSettings || this.getDefaultNotificationSettings(),
      privacy: dbUser.privacySettings || this.getDefaultPrivacySettings()
    };
  }

  /**
   * Transform user data for authenticated user viewing their own profile (DTO)
   */
  static toAuthenticatedSelfDTO(dbUser: any): AuthenticatedUserSelfDTO {
    const publicData = this.toPublicUserDTO(dbUser);
    
    return {
      ...publicData,
      email: dbUser.email,
      emailVerified: dbUser.emailVerified || false,
      totalXp: dbUser.totalXp || dbUser.stats?.totalXp || dbUser.xp || 0,
      preferences: {
        theme: dbUser.preferences?.theme || 'auto',
        language: dbUser.preferences?.language || 'en',
        timezone: dbUser.preferences?.timezone || 'UTC',
        emailNotifications: dbUser.preferences?.emailNotifications || true,
        pushNotifications: dbUser.preferences?.pushNotifications || true,
        marketingEmails: dbUser.preferences?.marketingEmails || false,
        display: dbUser.preferences?.display || this.getDefaultDisplaySettings()
      },
      notifications: dbUser.notificationSettings || this.getDefaultNotificationSettings(),
      privacy: dbUser.privacySettings || this.getDefaultPrivacySettings()
    };
  }

  /**
   * Transform user data for admin view
   * Includes all data with proper anonymization of IPs
   */
  static toAdminUserDetail(dbUser: any): AdminUserDetail {
    const authenticatedData = this.toAuthenticatedSelf(dbUser);
    
    return {
      ...authenticatedData,
      // GDPR-compliant IP handling
      ipAddressHash: dbUser.registrationIp ? this.hashIP(dbUser.registrationIp) : undefined,
      registrationIp: this.anonymizeOldIP(dbUser.registrationIp, dbUser.createdAt),
      lastLoginIp: this.anonymizeOldIP(dbUser.lastLoginIp, dbUser.lastLoginAt),
      // Moderation data
      moderationNotes: dbUser.moderationNotes || undefined,
      warnings: dbUser.warnings || [],
      suspensions: dbUser.suspensions || [],
      // Internal tracking
      internalNotes: dbUser.internalNotes || undefined,
      riskScore: dbUser.riskScore || undefined
    };
  }

  /**
   * Transform user data for profile view (DTO)
   */
  static toUserProfileDTO(dbUser: any): UserProfileDTO {
    if (!dbUser) {
      throw new Error('Invalid user data provided to transformer');
    }

    return {
      id: dbUser.id as UserId,
      username: dbUser.username,
      displayName: dbUser.displayName || dbUser.username,
      avatarUrl: dbUser.avatarUrl || undefined,
      role: dbUser.role as UserRole,
      level: dbUser.level || 1,
      bio: dbUser.bio || undefined,
      isOnline: this.calculateOnlineStatus(dbUser.lastSeen),
      lastSeen: dbUser.lastSeen,
      reputation: dbUser.stats?.reputation || dbUser.reputation || 0,
      totalXp: dbUser.stats?.totalXp || dbUser.totalXp || dbUser.xp || 0,
      levelConfig: dbUser.levelConfig ? {
        level: dbUser.levelConfig.level,
        name: dbUser.levelConfig.name,
        minXp: dbUser.levelConfig.minXp,
        maxXp: dbUser.levelConfig.maxXp,
        color: dbUser.levelConfig.color
      } : undefined,
      badges: dbUser.badges || [],
      title: dbUser.title || undefined,
      frame: dbUser.frame || undefined
    };
  }

  /**
   * Batch transform multiple users for public consumption
   */
  static toPublicUsers(dbUsers: any[]): PublicUser[] {
    return dbUsers.map(user => this.toPublicUser(user));
  }

  /**
   * Transform user data based on requesting user's permissions
   */
  static toRoleBasedUser(
    dbUser: any, 
    requestingUser: any, 
    isSelf: boolean = false
  ): PublicUser | AuthenticatedUserSelf | AdminUserDetail {
    
    // Self-view: return authenticated self data
    if (isSelf) {
      return this.toAuthenticatedSelf(dbUser);
    }
    
    // Admin view: return admin detail if requester is admin
    if (this.isAdmin(requestingUser)) {
      return this.toAdminUserDetail(dbUser);
    }
    
    // Default: return public data
    return this.toPublicUser(dbUser);
  }

  /**
   * Remove sensitive fields from user object (destructive)
   */
  static sanitizeUserForResponse(user: any): any {
    const sensitiveFields = [
      'password', 
      'passwordHash', 
      'salt',
      'registrationIp',
      'lastLoginIp', 
      'internalNotes',
      'moderationNotes'
    ];
    
    const sanitized = { ...user };
    sensitiveFields.forEach(field => {
      delete sanitized[field];
    });
    
    return sanitized;
  }

  // Private utility methods
  
  private static calculateOnlineStatus(lastSeen: Date): boolean {
    if (!lastSeen) return false;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return lastSeen > fiveMinutesAgo;
  }

  private static shouldShowLastSeen(dbUser: any): boolean {
    // Check user's privacy settings
    return dbUser.privacySettings?.lastSeen !== false;
  }

  private static hashIP(ip: string): string {
    if (!ip) return '';
    return createHash('sha256').update(ip + process.env.IP_SALT || 'default-salt').digest('hex');
  }

  private static anonymizeOldIP(ip: string, timestamp: Date): string | undefined {
    if (!ip || !timestamp) return undefined;
    
    // GDPR: Anonymize IPs older than 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    if (timestamp < thirtyDaysAgo) {
      return this.anonymizeIP(ip);
    }
    
    return ip;
  }

  private static anonymizeIP(ip: string): string {
    if (!ip) return '';
    
    // IPv4: xxx.xxx.xxx.0
    if (ip.includes('.')) {
      const parts = ip.split('.');
      if (parts.length === 4) {
        return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
      }
    }
    
    // IPv6: xxxx:xxxx:xxxx:xxxx::
    if (ip.includes(':')) {
      const parts = ip.split(':');
      if (parts.length >= 4) {
        return `${parts[0]}:${parts[1]}:${parts[2]}:${parts[3]}::`;
      }
    }
    
    return '[anonymized]';
  }

  private static isAdmin(user: any): boolean {
    return user && (user.role === 'admin' || user.role === 'owner');
  }

  private static getDefaultPreferences() {
    return {
      theme: 'auto' as const,
      language: 'en',
      timezone: 'UTC',
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
      display: this.getDefaultDisplaySettings()
    };
  }

  private static getDefaultDisplaySettings(): DisplaySettings {
    return {
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'relative',
      showSignatures: true,
      postsPerPage: 20,
      theme: 'system',
      fontSize: 'medium',
      threadDisplayMode: 'card',
      reducedMotion: false,
      hideNsfw: true,
      showMatureContent: false,
      showOfflineUsers: true
    };
  }

  private static getDefaultNotificationSettings() {
    return {
      mentions: true,
      replies: true,
      tips: true,
      achievements: true,
      moderation: true
    };
  }

  private static getDefaultPrivacySettings() {
    return {
      profileVisibility: 'public' as const,
      onlineStatus: true,
      lastSeen: true,
      emailVisible: false,
      allowDirectMessages: 'friends' as const,
      dataProcessingConsent: false,
      analyticsConsent: false,
      marketingConsent: false,
      consentDate: new Date()
    };
  }
}

// Export convenience methods
export const { 
  toPublicUser, 
  toAuthenticatedSelf, 
  toAdminUserDetail,
  toPublicUserDTO,
  toAuthenticatedSelfDTO,
  toUserProfileDTO
} = UserTransformer;