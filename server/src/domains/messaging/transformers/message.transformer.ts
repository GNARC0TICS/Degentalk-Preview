/**
 * Message Transformer
 * 
 * Security-first data transformation for private messaging and conversations
 * Implements three-tier access: Public → Authenticated → Admin
 * Follows established patterns from Users, Forums, Economy, and Shop domains
 */

import type {
  PublicMessage,
  AuthenticatedMessage,
  AdminMessage,
  PublicConversation,
  AuthenticatedConversation,
  AdminConversation,
  MessageSearchResult,
  TypingStatus
} from '../types';

import type { 
  UserId, 
  MessageId, 
  ConversationId,
  DgtAmount
} from '@shared/types';

import { UserTransformer } from '../../users/transformers/user.transformer';
import { createHash } from 'crypto';

export class MessageTransformer {
  
  // ==========================================
  // MESSAGE TRANSFORMERS
  // ==========================================

  /**
   * Transform message for public view (system messages and announcements only)
   * Minimal data exposure for non-participants
   */
  static toPublicMessage(dbMessage: any): PublicMessage {
    return {
      id: dbMessage.id as MessageId,
      content: this.sanitizeContent(dbMessage.content, 'public'),
      timestamp: dbMessage.createdAt.toISOString(),
      type: dbMessage.type || 'system',
      
      // Minimal sender info for system messages only
      sender: dbMessage.type === 'system' ? {
        id: dbMessage.senderId as UserId,
        username: dbMessage.senderUsername || 'System',
        level: dbMessage.senderLevel || 0
      } : undefined,
      
      // System metadata
      isSystem: dbMessage.type === 'system',
      isEdited: dbMessage.editedAt !== null
    };
  }

  /**
   * Transform message for authenticated participants
   * Shows full message content with interaction permissions
   */
  static toAuthenticatedMessage(dbMessage: any, requestingUser: any, conversation?: any): AuthenticatedMessage {
    const isParticipant = this.isUserParticipant(requestingUser?.id, conversation);
    
    if (!isParticipant && dbMessage.type !== 'system') {
      throw new Error('User is not a participant in this conversation');
    }

    return {
      id: dbMessage.id as MessageId,
      conversationId: dbMessage.conversationId as ConversationId,
      senderId: dbMessage.senderId as UserId,
      content: this.sanitizeContent(dbMessage.content, 'authenticated'),
      timestamp: dbMessage.createdAt.toISOString(),
      type: dbMessage.type || 'text',
      
      // Sender details
      sender: {
        id: dbMessage.senderId as UserId,
        username: dbMessage.senderUsername,
        avatarUrl: dbMessage.senderAvatarUrl,
        level: dbMessage.senderLevel || 1,
        isOnline: this.isUserOnline(dbMessage.senderId),
        lastSeen: dbMessage.senderLastSeen?.toISOString()
      },
      
      // Message state
      isEdited: dbMessage.editedAt !== null,
      editedAt: dbMessage.editedAt?.toISOString(),
      isDeleted: dbMessage.deletedAt !== null,
      deletedAt: dbMessage.deletedAt?.toISOString(),
      
      // Read status for current user
      isRead: this.isMessageRead(dbMessage.id, requestingUser?.id),
      readAt: this.getReadTimestamp(dbMessage.id, requestingUser?.id),
      
      // Interaction permissions
      canEdit: this.canUserEditMessage(dbMessage, requestingUser),
      canDelete: this.canUserDeleteMessage(dbMessage, requestingUser),
      canReact: this.canUserReactToMessage(dbMessage, requestingUser),
      
      // Reactions
      reactions: this.transformReactions(dbMessage.reactions, requestingUser?.id),
      
      // Tip amount (if applicable)
      tipAmount: dbMessage.tipAmount ? this.sanitizeDgtAmount(dbMessage.tipAmount) : undefined,
      
      // Reply context
      replyTo: dbMessage.replyToId ? {
        messageId: dbMessage.replyToId as MessageId,
        content: this.truncateContent(dbMessage.replyToContent, 100),
        senderUsername: dbMessage.replyToSenderUsername
      } : undefined,
      
      // File attachments
      attachments: this.transformAttachments(dbMessage.attachments, requestingUser)
    };
  }

  /**
   * Transform message for admin/moderation view
   * Includes all system data and moderation information
   */
  static toAdminMessage(dbMessage: any, analytics?: any): AdminMessage {
    // Get authenticated data first (with admin permissions)
    const authenticatedData = this.toAuthenticatedMessage(dbMessage, { role: 'admin', id: 'admin' });
    
    return {
      ...authenticatedData,
      
      // System tracking (anonymized for GDPR)
      ipAddress: this.anonymizeIP(dbMessage.ipAddress),
      userAgent: dbMessage.userAgent,
      
      // Moderation data
      reportCount: dbMessage.reportCount || 0,
      isFlagged: dbMessage.isFlagged === true,
      flagReason: dbMessage.flagReason,
      moderationNotes: dbMessage.moderationNotes,
      
      // Technical metadata
      messageSize: this.calculateMessageSize(dbMessage),
      deliveryStatus: dbMessage.deliveryStatus || 'sent',
      encryptionStatus: dbMessage.encryptionStatus || 'plain',
      
      // Edit history for audit
      editHistory: this.getEditHistory(dbMessage),
      
      // Admin actions
      moderatedBy: dbMessage.moderatedBy as UserId || undefined,
      moderatedAt: dbMessage.moderatedAt?.toISOString(),
      moderationAction: dbMessage.moderationAction || 'none'
    };
  }

  // ==========================================
  // CONVERSATION TRANSFORMERS
  // ==========================================

  /**
   * Transform conversation for public view (system announcements only)
   */
  static toPublicConversation(dbConversation: any): PublicConversation {
    // Only show system conversations publicly
    if (dbConversation.type !== 'system' && dbConversation.type !== 'announcement') {
      throw new Error('Conversation is not public');
    }

    return {
      id: dbConversation.id as ConversationId,
      type: dbConversation.type,
      title: dbConversation.title,
      
      // Basic public stats
      participantCount: dbConversation.participantCount || 0,
      messageCount: dbConversation.messageCount || 0,
      
      // Latest message preview (sanitized)
      lastMessage: dbConversation.lastMessage ? {
        content: this.truncateContent(dbConversation.lastMessage.content, 50),
        timestamp: dbConversation.lastMessage.createdAt.toISOString(),
        senderUsername: dbConversation.lastMessage.senderUsername
      } : undefined,
      
      // System flags
      isSystem: dbConversation.type === 'system',
      isActive: dbConversation.isActive !== false
    };
  }

  /**
   * Transform conversation for authenticated participants
   * Shows full conversation data with user-specific state
   */
  static toAuthenticatedConversation(dbConversation: any, requestingUser: any, participants?: any[]): AuthenticatedConversation {
    const isParticipant = this.isUserParticipant(requestingUser?.id, dbConversation);
    
    if (!isParticipant && dbConversation.type !== 'system') {
      throw new Error('User is not a participant in this conversation');
    }

    return {
      id: dbConversation.id as ConversationId,
      type: dbConversation.type || 'direct',
      title: dbConversation.title,
      
      // Participants with online status
      participants: (participants || []).map(participant => ({
        id: participant.userId as UserId,
        username: participant.username,
        avatarUrl: participant.avatarUrl,
        level: participant.level || 1,
        isOnline: this.isUserOnline(participant.userId),
        role: participant.role || 'member'
      })),
      
      // User-specific state
      lastReadAt: this.getUserLastReadTime(dbConversation.id, requestingUser?.id),
      unreadCount: this.getUserUnreadCount(dbConversation.id, requestingUser?.id),
      isMuted: this.isConversationMuted(dbConversation.id, requestingUser?.id),
      isPinned: this.isConversationPinned(dbConversation.id, requestingUser?.id),
      
      // Conversation metadata
      createdAt: dbConversation.createdAt.toISOString(),
      createdBy: dbConversation.createdBy as UserId,
      messageCount: dbConversation.messageCount || 0,
      
      // Latest message
      lastMessage: dbConversation.lastMessage ? {
        id: dbConversation.lastMessage.id as MessageId,
        content: this.truncateContent(dbConversation.lastMessage.content, 100),
        timestamp: dbConversation.lastMessage.createdAt.toISOString(),
        senderId: dbConversation.lastMessage.senderId as UserId,
        senderUsername: dbConversation.lastMessage.senderUsername,
        type: dbConversation.lastMessage.type || 'text'
      } : undefined,
      
      // User permissions in this conversation
      canSendMessages: this.canUserSendMessages(dbConversation, requestingUser),
      canAddParticipants: this.canUserAddParticipants(dbConversation, requestingUser),
      canLeave: this.canUserLeaveConversation(dbConversation, requestingUser),
      canDelete: this.canUserDeleteConversation(dbConversation, requestingUser),
      
      // User settings for this conversation
      settings: this.getUserConversationSettings(dbConversation.id, requestingUser?.id)
    };
  }

  /**
   * Transform conversation for admin view
   * Includes comprehensive analytics and moderation data
   */
  static toAdminConversation(dbConversation: any, analytics?: any): AdminConversation {
    // Get authenticated data with admin permissions
    const authenticatedData = this.toAuthenticatedConversation(dbConversation, { role: 'admin', id: 'admin' });
    
    return {
      ...authenticatedData,
      
      // System data (anonymized)
      createdByIp: this.anonymizeIP(dbConversation.createdByIp),
      totalDataSize: this.calculateConversationSize(dbConversation),
      
      // Moderation
      reportCount: dbConversation.reportCount || 0,
      isFlagged: dbConversation.isFlagged === true,
      flagReason: dbConversation.flagReason,
      moderationNotes: dbConversation.moderationNotes,
      
      // Analytics
      activityMetrics: {
        messagesLast24h: analytics?.messagesLast24h || 0,
        messagesLast7d: analytics?.messagesLast7d || 0,
        averageResponseTime: analytics?.averageResponseTime || 0,
        mostActiveParticipant: analytics?.mostActiveParticipant as UserId
      },
      
      // Technical details
      encryptionEnabled: dbConversation.encryptionEnabled === true,
      backupStatus: dbConversation.backupStatus || 'current',
      lastBackupAt: dbConversation.lastBackupAt?.toISOString(),
      
      // Admin metadata
      moderatedBy: dbConversation.moderatedBy as UserId || undefined,
      moderatedAt: dbConversation.moderatedAt?.toISOString(),
      adminNotes: dbConversation.adminNotes
    };
  }

  // ==========================================
  // UTILITY TRANSFORMERS
  // ==========================================

  /**
   * Transform search results with proper context
   */
  static toMessageSearchResult(searchResult: any, requestingUser: any): MessageSearchResult {
    return {
      message: this.toAuthenticatedMessage(searchResult.message, requestingUser, searchResult.conversation),
      conversation: {
        id: searchResult.conversation.id as ConversationId,
        title: searchResult.conversation.title,
        participantCount: searchResult.conversation.participantCount,
        unreadCount: this.getUserUnreadCount(searchResult.conversation.id, requestingUser?.id),
        lastActivity: searchResult.conversation.lastMessageAt.toISOString(),
        type: searchResult.conversation.type,
        isActive: searchResult.conversation.isActive !== false
      },
      context: {
        beforeMessages: searchResult.beforeMessages.map((msg: any) => ({
          id: msg.id as MessageId,
          content: this.truncateContent(msg.content, 100),
          timestamp: msg.createdAt.toISOString(),
          sender: {
            id: msg.senderId as UserId,
            username: msg.senderUsername,
            avatarUrl: msg.senderAvatarUrl,
            level: msg.senderLevel || 1,
            isOnline: false,
            lastSeen: undefined
          }
        })),
        afterMessages: searchResult.afterMessages.map((msg: any) => ({
          id: msg.id as MessageId,
          content: this.truncateContent(msg.content, 100),
          timestamp: msg.createdAt.toISOString(),
          sender: {
            id: msg.senderId as UserId,
            username: msg.senderUsername,
            avatarUrl: msg.senderAvatarUrl,
            level: msg.senderLevel || 1,
            isOnline: false,
            lastSeen: undefined
          }
        }))
      },
      matchScore: searchResult.matchScore || 0
    };
  }

  /**
   * Transform typing status for real-time updates
   */
  static toTypingStatus(dbTyping: any): TypingStatus {
    return {
      conversationId: dbTyping.conversationId as ConversationId,
      userId: dbTyping.userId as UserId,
      username: dbTyping.username,
      startedAt: dbTyping.startedAt.toISOString(),
      expiresAt: dbTyping.expiresAt.toISOString()
    };
  }

  // ==========================================
  // PRIVATE UTILITY METHODS
  // ==========================================

  private static sanitizeContent(content: string, level: 'public' | 'authenticated'): string {
    if (!content) return '';
    
    // Basic sanitization
    let sanitized = content.trim();
    
    if (level === 'public') {
      // More aggressive sanitization for public content
      sanitized = sanitized.replace(/@\w+/g, '[mention]'); // Remove mentions
      sanitized = sanitized.replace(/https?:\/\/[^\s]+/g, '[link]'); // Remove links
    }
    
    return sanitized;
  }

  private static truncateContent(content: string, maxLength: number): string {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength - 3) + '...';
  }

  private static sanitizeDgtAmount(amount: any): DgtAmount {
    const parsed = parseFloat(amount?.toString() || '0');
    return (isNaN(parsed) ? 0 : Math.max(0, parsed)) as DgtAmount;
  }

  private static anonymizeIP(ip?: string): string {
    if (!ip) return 'unknown';
    
    if (ip.includes(':')) {
      // IPv6
      const parts = ip.split(':');
      return parts.slice(0, 4).join(':') + '::***';
    } else {
      // IPv4
      const parts = ip.split('.');
      return parts.slice(0, 3).join('.') + '.***';
    }
  }

  private static isUserParticipant(userId: any, conversation: any): boolean {
    if (!userId || !conversation) return false;
    
    // System conversations are open to all authenticated users
    if (conversation.type === 'system' || conversation.type === 'announcement') {
      return true;
    }
    
    // Check participant list
    return conversation.participants?.some((p: any) => p.userId === userId) || false;
  }

  private static isUserOnline(userId: any): boolean {
    // This would integrate with a real-time presence system
    return false; // Placeholder
  }

  private static isMessageRead(messageId: any, userId: any): boolean {
    // This would check read receipts table
    return false; // Placeholder
  }

  private static getReadTimestamp(messageId: any, userId: any): string | undefined {
    // This would get actual read timestamp
    return undefined; // Placeholder
  }

  private static canUserEditMessage(dbMessage: any, user: any): boolean {
    if (!user?.id) return false;
    
    // User can edit their own messages within 15 minutes
    if (dbMessage.senderId === user.id) {
      const editWindow = 15 * 60 * 1000; // 15 minutes
      const messageAge = Date.now() - new Date(dbMessage.createdAt).getTime();
      return messageAge < editWindow;
    }
    
    // Admins and moderators can edit any message
    return user.role === 'admin' || user.role === 'moderator';
  }

  private static canUserDeleteMessage(dbMessage: any, user: any): boolean {
    if (!user?.id) return false;
    
    // User can delete their own messages
    if (dbMessage.senderId === user.id) return true;
    
    // Admins and moderators can delete any message
    return user.role === 'admin' || user.role === 'moderator';
  }

  private static canUserReactToMessage(dbMessage: any, user: any): boolean {
    if (!user?.id) return false;
    
    // Can't react to deleted messages
    if (dbMessage.deletedAt) return false;
    
    // Can't react to your own messages (optional business rule)
    if (dbMessage.senderId === user.id) return false;
    
    return true;
  }

  private static transformReactions(reactions: any, userId: any): any[] | undefined {
    if (!reactions) return undefined;
    
    return reactions.map((reaction: any) => ({
      emoji: reaction.emoji,
      count: reaction.count || 0,
      userReacted: reaction.userIds?.includes(userId) || false
    }));
  }

  private static transformAttachments(attachments: any, user: any): any[] | undefined {
    if (!attachments) return undefined;
    
    return attachments.map((attachment: any) => ({
      id: attachment.id,
      filename: attachment.filename,
      size: attachment.size || 0,
      mimeType: attachment.mimeType,
      downloadUrl: this.generateDownloadUrl(attachment.id, user)
    }));
  }

  private static generateDownloadUrl(attachmentId: string, user: any): string {
    // Generate secure download URL with user authentication
    return `/api/messaging/attachments/${attachmentId}/download`;
  }

  private static calculateMessageSize(dbMessage: any): number {
    const contentSize = (dbMessage.content || '').length;
    const attachmentSize = dbMessage.attachments?.reduce((sum: number, att: any) => sum + (att.size || 0), 0) || 0;
    return contentSize + attachmentSize;
  }

  private static getEditHistory(dbMessage: any): any[] | undefined {
    if (!dbMessage.editHistory) return undefined;
    
    return dbMessage.editHistory.map((edit: any) => ({
      editedAt: edit.editedAt.toISOString(),
      oldContent: this.truncateContent(edit.oldContent, 200) // Truncated for audit
    }));
  }

  private static getUserLastReadTime(conversationId: any, userId: any): string | undefined {
    // This would get user's last read time for this conversation
    return undefined; // Placeholder
  }

  private static getUserUnreadCount(conversationId: any, userId: any): number {
    // This would calculate unread messages for user in conversation
    return 0; // Placeholder
  }

  private static isConversationMuted(conversationId: any, userId: any): boolean {
    // This would check user's mute settings
    return false; // Placeholder
  }

  private static isConversationPinned(conversationId: any, userId: any): boolean {
    // This would check user's pin settings
    return false; // Placeholder
  }

  private static canUserSendMessages(conversation: any, user: any): boolean {
    if (!user?.id) return false;
    
    // Check if conversation is active
    if (conversation.isActive === false) return false;
    
    // Check user permissions or bans
    return true; // Placeholder
  }

  private static canUserAddParticipants(conversation: any, user: any): boolean {
    if (!user?.id) return false;
    
    // Only group conversations allow adding participants
    if (conversation.type !== 'group') return false;
    
    // Check if user is owner or admin
    return conversation.createdBy === user.id || user.role === 'admin';
  }

  private static canUserLeaveConversation(conversation: any, user: any): boolean {
    if (!user?.id) return false;
    
    // Can't leave direct conversations (they just become inactive)
    if (conversation.type === 'direct') return false;
    
    // Can leave group conversations
    return conversation.type === 'group';
  }

  private static canUserDeleteConversation(conversation: any, user: any): boolean {
    if (!user?.id) return false;
    
    // Only creator or admin can delete
    return conversation.createdBy === user.id || user.role === 'admin';
  }

  private static getUserConversationSettings(conversationId: any, userId: any): any | undefined {
    // This would get user's settings for this conversation
    return {
      notifications: true,
      soundEnabled: true,
      autoMarkRead: false
    }; // Placeholder
  }

  private static calculateConversationSize(conversation: any): number {
    // This would calculate total data size of conversation
    return conversation.messageCount * 100; // Placeholder estimate
  }
}