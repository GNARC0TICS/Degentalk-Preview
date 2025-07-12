/**
 * Shoutbox Message Transformer
 * 
 * Security-first data transformation for shoutbox messages and chat rooms
 * Implements three-tier access: Public → Authenticated → Admin
 * Follows established patterns from Users, Forums, Economy, and Shop domains
 */

import type { UserId, MessageId, RoomId } from '@shared/types/ids';
import { UserTransformer } from '../../users/transformers/user.transformer';

export class ShoutboxTransformer {
  
  // ==========================================
  // SHOUTBOX MESSAGE TRANSFORMERS
  // ==========================================

  /**
   * Transform shoutbox message for public view
   * Minimal data exposure for logged-out users
   */
  static toPublicShout(dbMessage: any): any {
    return {
      id: dbMessage.id as MessageId,
      content: this.sanitizeContent(dbMessage.content, 'public'),
      timestamp: dbMessage.createdAt.toISOString(),
      roomId: dbMessage.roomId as RoomId,
      
      // Basic user info only
      user: dbMessage.user ? {
        id: dbMessage.user.id || dbMessage.userId,
        username: dbMessage.user.username || dbMessage.username,
        level: dbMessage.user.level || dbMessage.level || 1,
        avatarUrl: dbMessage.user.avatarUrl || dbMessage.avatarUrl,
        usernameColor: dbMessage.user.usernameColor || dbMessage.usernameColor
      } : null,
      
      // System metadata
      isDeleted: dbMessage.isDeleted || false,
      isPinned: dbMessage.isPinned || false,
      isEdited: dbMessage.editedAt !== null
    };
  }

  /**
   * Transform shoutbox message for authenticated users
   * Includes user roles and additional metadata
   */
  static toAuthenticatedShout(dbMessage: any): any {
    const publicData = this.toPublicShout(dbMessage);
    
    return {
      ...publicData,
      
      // Enhanced user info for authenticated users
      user: dbMessage.user ? {
        ...publicData.user,
        groupId: dbMessage.user.groupId || dbMessage.groupId,
        roles: dbMessage.user.roles || dbMessage.roles || [],
        activeAvatarUrl: dbMessage.user.activeAvatarUrl || dbMessage.activeAvatarUrl
      } : null,
      
      // Additional message metadata
      tipAmount: dbMessage.tipAmount || 0,
      editedAt: dbMessage.editedAt?.toISOString() || null
    };
  }

  /**
   * Transform shoutbox message for admin view
   * Includes all data including sensitive info
   */
  static toAdminShout(dbMessage: any): any {
    const authenticatedData = this.toAuthenticatedShout(dbMessage);
    
    return {
      ...authenticatedData,
      
      // Admin-only metadata
      createdAt: dbMessage.createdAt.toISOString(),
      userId: dbMessage.userId as UserId,
      ipAddress: dbMessage.ipAddress,
      userAgent: dbMessage.userAgent,
      
      // Full user data if available
      user: dbMessage.user ? UserTransformer.toPublicUser(dbMessage.user) : authenticatedData.user
    };
  }

  // ==========================================
  // CHAT ROOM TRANSFORMERS
  // ==========================================

  /**
   * Transform chat room for public view
   */
  static toPublicRoom(dbRoom: any): any {
    return {
      id: dbRoom.id as RoomId,
      name: dbRoom.name,
      description: dbRoom.description,
      isPrivate: dbRoom.isPrivate || false,
      order: dbRoom.order || 0,
      
      // Basic stats
      messageCount: dbRoom.messageCount || 0,
      activeUsers: dbRoom.activeUsers || 0
    };
  }

  /**
   * Transform chat room for authenticated users
   */
  static toAuthenticatedRoom(dbRoom: any): any {
    const publicData = this.toPublicRoom(dbRoom);
    
    return {
      ...publicData,
      
      // Access requirements
      minXpRequired: dbRoom.minXpRequired || 0,
      minGroupIdRequired: dbRoom.minGroupIdRequired,
      accessRoles: dbRoom.accessRoles || [],
      
      // User permissions
      canPost: dbRoom.canPost !== false,
      canView: dbRoom.canView !== false
    };
  }

  /**
   * Transform chat room for admin view
   */
  static toAdminRoom(dbRoom: any): any {
    const authenticatedData = this.toAuthenticatedRoom(dbRoom);
    
    return {
      ...authenticatedData,
      
      // Admin metadata
      createdAt: dbRoom.createdAt?.toISOString(),
      createdBy: dbRoom.createdBy as UserId,
      isDeleted: dbRoom.isDeleted || false,
      themeConfig: dbRoom.themeConfig || {},
      maxUsers: dbRoom.maxUsers
    };
  }

  // ==========================================
  // GENERIC SHOUTBOX TRANSFORMERS (Legacy)
  // ==========================================

  /**
   * Generic public transformer (for backward compatibility)
   */
  static toPublicShoutbox(entity: any): any {
    // If it looks like a message, transform as message
    if (entity.content !== undefined) {
      return this.toPublicShout(entity);
    }
    
    // If it looks like a room, transform as room
    if (entity.name !== undefined) {
      return this.toPublicRoom(entity);
    }
    
    // Fallback: return as-is
    return entity;
  }

  /**
   * Generic authenticated transformer (for backward compatibility)
   */
  static toAuthenticatedShoutbox(entity: any): any {
    // If it looks like a message, transform as message
    if (entity.content !== undefined) {
      return this.toAuthenticatedShout(entity);
    }
    
    // If it looks like a room, transform as room
    if (entity.name !== undefined) {
      return this.toAuthenticatedRoom(entity);
    }
    
    // Fallback: return as-is
    return entity;
  }

  /**
   * Generic admin transformer (for backward compatibility)
   */
  static toAdminShoutbox(entity: any): any {
    // If it looks like a message, transform as message
    if (entity.content !== undefined) {
      return this.toAdminShout(entity);
    }
    
    // If it looks like a room, transform as room
    if (entity.name !== undefined) {
      return this.toAdminRoom(entity);
    }
    
    // Fallback: return as-is
    return entity;
  }

  // ==========================================
  // ARRAY HELPERS
  // ==========================================

  static toPublicShoutboxList(entities: any[]): any[] {
    return entities.map(e => this.toPublicShoutbox(e));
  }

  static toAuthenticatedShoutboxList(entities: any[]): any[] {
    return entities.map(e => this.toAuthenticatedShoutbox(e));
  }

  static toAdminShoutboxList(entities: any[]): any[] {
    return entities.map(e => this.toAdminShoutbox(e));
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  /**
   * Sanitize content based on access level
   */
  private static sanitizeContent(content: string, level: 'public' | 'authenticated' | 'admin'): string {
    if (!content) return '';
    
    // For public access, limit content length and strip sensitive patterns
    if (level === 'public') {
      // Strip IP addresses, emails, and other sensitive patterns
      const sanitized = content
        .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP_REDACTED]')
        .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REDACTED]');
      
      // Limit length for public view
      return sanitized.length > 200 ? sanitized.substring(0, 200) + '...' : sanitized;
    }
    
    return content;
  }
}