/**
 * Messaging Domain Types
 * 
 * Security-aware DTOs for private messaging and conversations
 * Follows the established transformer pattern with role-based data exposure
 */

import type { 
  UserId, 
  MessageId, 
  ConversationId,
  DgtAmount 
} from '@shared/types/ids';

// ==========================================
// MESSAGE TYPES
// ==========================================

/**
 * Public message - minimal exposure for system messages or public announcements
 */
export interface PublicMessage {
  id: MessageId;
  content: string;
  timestamp: string;
  type: 'system' | 'announcement' | 'welcome';
  
  // Minimal sender info for system messages
  sender?: {
    id: UserId;
    username: string;
    level: number;
  };
  
  // System metadata
  isSystem: boolean;
  isEdited: boolean;
}

/**
 * Authenticated message - for participants in private conversations
 */
export interface AuthenticatedMessage {
  id: MessageId;
  conversationId: ConversationId;
  senderId: UserId;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'system' | 'tip' | 'reaction';
  
  // Sender details
  sender: {
    id: UserId;
    username: string;
    avatarUrl?: string;
    level: number;
    isOnline: boolean;
    lastSeen?: string;
  };
  
  // Message state
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  
  // Read status (for current user)
  isRead: boolean;
  readAt?: string;
  
  // Interaction permissions
  canEdit: boolean;
  canDelete: boolean;
  canReact: boolean;
  
  // Reactions and tips
  reactions?: Array<{
    emoji: string;
    count: number;
    userReacted: boolean;
  }>;
  
  tipAmount?: DgtAmount;
  
  // Reply context
  replyTo?: {
    messageId: MessageId;
    content: string; // Truncated
    senderUsername: string;
  };
  
  // File attachments
  attachments?: Array<{
    id: string;
    filename: string;
    size: number;
    mimeType: string;
    downloadUrl: string;
  }>;
}

/**
 * Admin message - comprehensive view for moderation and system management
 */
export interface AdminMessage extends AuthenticatedMessage {
  // System tracking
  ipAddress: string; // Anonymized
  userAgent?: string;
  
  // Moderation data
  reportCount: number;
  isFlagged: boolean;
  flagReason?: string;
  moderationNotes?: string;
  
  // Technical metadata
  messageSize: number; // bytes
  deliveryStatus: 'sent' | 'delivered' | 'failed';
  encryptionStatus?: 'encrypted' | 'plain';
  
  // Analytics
  editHistory?: Array<{
    editedAt: string;
    oldContent: string; // Truncated for audit
  }>;
  
  // Admin actions
  moderatedBy?: UserId;
  moderatedAt?: string;
  moderationAction?: 'none' | 'warning' | 'deleted' | 'edited';
}

// ==========================================
// CONVERSATION TYPES
// ==========================================

/**
 * Public conversation - for public announcements or system conversations
 */
export interface PublicConversation {
  id: ConversationId;
  type: 'announcement' | 'system' | 'welcome';
  title?: string;
  
  // Basic stats
  participantCount: number;
  messageCount: number;
  
  // Latest message preview
  lastMessage?: {
    content: string; // Truncated
    timestamp: string;
    senderUsername: string;
  };
  
  // System flags
  isSystem: boolean;
  isActive: boolean;
}

/**
 * Authenticated conversation - for private conversations user participates in
 */
export interface AuthenticatedConversation {
  id: ConversationId;
  type: 'direct' | 'group' | 'system';
  title?: string;
  
  // Participants
  participants: Array<{
    id: UserId;
    username: string;
    avatarUrl?: string;
    level: number;
    isOnline: boolean;
    role?: 'owner' | 'admin' | 'member';
  }>;
  
  // User-specific state
  lastReadAt?: string;
  unreadCount: number;
  isMuted: boolean;
  isPinned: boolean;
  
  // Conversation metadata
  createdAt: string;
  createdBy: UserId;
  messageCount: number;
  
  // Latest message
  lastMessage?: {
    id: MessageId;
    content: string; // Truncated
    timestamp: string;
    senderId: UserId;
    senderUsername: string;
    type: string;
  };
  
  // Permissions
  canSendMessages: boolean;
  canAddParticipants: boolean;
  canLeave: boolean;
  canDelete: boolean;
  
  // Settings
  settings?: {
    notifications: boolean;
    soundEnabled: boolean;
    autoMarkRead: boolean;
  };
}

/**
 * Admin conversation - comprehensive management view
 */
export interface AdminConversation extends AuthenticatedConversation {
  // System data
  createdByIp: string; // Anonymized
  totalDataSize: number; // bytes
  
  // Moderation
  reportCount: number;
  isFlagged: boolean;
  flagReason?: string;
  moderationNotes?: string;
  
  // Analytics
  activityMetrics: {
    messagesLast24h: number;
    messagesLast7d: number;
    averageResponseTime: number; // minutes
    mostActiveParticipant: UserId;
  };
  
  // Technical details
  encryptionEnabled: boolean;
  backupStatus: 'current' | 'pending' | 'failed';
  lastBackupAt?: string;
  
  // Admin metadata
  moderatedBy?: UserId;
  moderatedAt?: string;
  adminNotes?: string;
}

// ==========================================
// UTILITY TYPES
// ==========================================

/**
 * Message draft for temporary storage
 */
export interface MessageDraft {
  conversationId: ConversationId;
  content: string;
  replyToId?: MessageId;
  attachments?: Array<{
    filename: string;
    size: number;
    mimeType: string;
  }>;
  savedAt: string;
}

/**
 * Conversation summary for lists and previews
 */
export interface ConversationSummary {
  id: ConversationId;
  title: string;
  participantCount: number;
  unreadCount: number;
  lastActivity: string;
  type: 'direct' | 'group' | 'system';
  isActive: boolean;
}

/**
 * Message search result
 */
export interface MessageSearchResult {
  message: AuthenticatedMessage;
  conversation: ConversationSummary;
  context: {
    beforeMessages: Array<Pick<AuthenticatedMessage, 'id' | 'content' | 'timestamp' | 'sender'>>;
    afterMessages: Array<Pick<AuthenticatedMessage, 'id' | 'content' | 'timestamp' | 'sender'>>;
  };
  matchScore: number;
}

/**
 * Typing indicator status
 */
export interface TypingStatus {
  conversationId: ConversationId;
  userId: UserId;
  username: string;
  startedAt: string;
  expiresAt: string;
}

// ==========================================
// REQUEST/RESPONSE TYPES
// ==========================================

/**
 * Send message request payload
 */
export interface SendMessageRequest {
  recipientId: UserId;
  content: string;
  type?: 'text' | 'image' | 'file' | 'tip';
  replyToId?: MessageId;
  tipAmount?: DgtAmount;
  attachments?: Array<{
    filename: string;
    size: number;
    mimeType: string;
    data: string; // base64 or file URL
  }>;
}