/**
 * Message Service
 * 
 * Business logic for messaging functionality
 */

import { db } from '@db';
import { eq, and, or, sql, desc } from 'drizzle-orm';
import { messages, users, directMessages } from '@schema';
import type { UserId, MessageId } from '@shared/types';
import { MessageTransformer } from './transformers';
import type { SendMessageRequest } from './types';
import { randomUUID } from 'crypto';

export class MessageService {
  /**
   * Get all conversations for a user
   */
  static async getConversations(userId: UserId) {
    const conversations = await db.execute(sql`
      WITH latest_messages AS (
        SELECT 
          CASE 
            WHEN sender_id = ${userId} THEN recipient_id
            ELSE sender_id
          END AS conversation_user_id,
          MAX(id) as latest_message_id
        FROM messages
        WHERE sender_id = ${userId} OR recipient_id = ${userId}
        GROUP BY conversation_user_id
      ),
      unread_counts AS (
        SELECT 
          sender_id,
          COUNT(*) as unread_count
        FROM messages
        WHERE recipient_id = ${userId} AND is_read = false
        GROUP BY sender_id
      )
      SELECT 
        u.id as user_id,
        u.username,
        u.avatar_url as "avatarUrl",
        m.content as "lastMessage",
        m.created_at as "lastMessageTime",
        COALESCE(uc.unread_count, 0) as "unreadCount"
      FROM latest_messages lm
      JOIN messages m ON m.id = lm.latest_message_id
      JOIN users u ON u.id = lm.conversation_user_id
      LEFT JOIN unread_counts uc ON uc.sender_id = lm.conversation_user_id
      ORDER BY m.created_at DESC
    `);

    return conversations.rows;
  }

  /**
   * Get messages between two users
   */
  static async getMessageThread(currentUserId: UserId, otherUserId: UserId) {
    const conversationMessages = await db
      .select()
      .from(messages)
      .where(
        or(
          and(eq(messages.senderId, currentUserId), eq(messages.recipientId, otherUserId)),
          and(eq(messages.senderId, otherUserId), eq(messages.recipientId, currentUserId))
        )
      )
      .orderBy(messages.createdAt);

    return conversationMessages;
  }

  /**
   * Send a new message
   */
  static async sendMessage(senderId: UserId, payload: SendMessageRequest) {
    const { recipientId, content } = payload;

    // Validate recipient exists
    const recipientExists = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, recipientId))
      .limit(1);

    if (recipientExists.length === 0) {
      throw new Error('Recipient not found');
    }

    // Don't allow self-messaging
    if (senderId === recipientId) {
      throw new Error('Cannot send messages to yourself');
    }

    // Create the message
    const [newMessage] = await db
      .insert(messages)
      .values({
        id: parseInt(Date.now().toString().slice(-9)),
        uuid: randomUUID(),
        senderId,
        recipientId,
        content,
        isRead: false,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    return newMessage;
  }

  /**
   * Mark messages as read
   */
  static async markMessagesAsRead(recipientId: UserId, senderId: UserId) {
    await db
      .update(messages)
      .set({
        isRead: true,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(messages.senderId, senderId),
          eq(messages.recipientId, recipientId),
          eq(messages.isRead, false)
        )
      );
  }

  /**
   * Delete a conversation (soft delete)
   */
  static async deleteConversation(userId: UserId, otherUserId: UserId) {
    await db
      .update(messages)
      .set({
        isDeleted: true,
        updatedAt: new Date()
      })
      .where(
        or(
          and(eq(messages.senderId, userId), eq(messages.recipientId, otherUserId)),
          and(eq(messages.senderId, otherUserId), eq(messages.recipientId, userId))
        )
      );
  }

  /**
   * Get unread message count for a user
   */
  static async getUnreadCount(userId: UserId): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(
        and(
          eq(messages.recipientId, userId),
          eq(messages.isRead, false),
          eq(messages.isDeleted, false)
        )
      );

    return result[0]?.count || 0;
  }

  /**
   * Delete a single message
   */
  static async deleteMessage(messageId: MessageId, userId: UserId) {
    // First check if user has permission to delete
    const [message] = await db
      .select()
      .from(messages)
      .where(eq(messages.id, messageId))
      .limit(1);

    if (!message) {
      throw new Error('Message not found');
    }

    // User can only delete their own messages
    if (message.senderId !== userId && message.recipientId !== userId) {
      throw new Error('Unauthorized to delete this message');
    }

    await db
      .update(messages)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId
      })
      .where(eq(messages.id, messageId));
  }

  /**
   * Edit a message
   */
  static async editMessage(messageId: MessageId, userId: UserId, newContent: string) {
    // First check if user has permission to edit
    const [message] = await db
      .select()
      .from(messages)
      .where(eq(messages.id, messageId))
      .limit(1);

    if (!message) {
      throw new Error('Message not found');
    }

    // Only sender can edit
    if (message.senderId !== userId) {
      throw new Error('Only the sender can edit messages');
    }

    // Check time limit (15 minutes)
    const messageAge = Date.now() - new Date(message.createdAt).getTime();
    const fifteenMinutes = 15 * 60 * 1000;
    
    if (messageAge > fifteenMinutes) {
      throw new Error('Messages can only be edited within 15 minutes');
    }

    await db
      .update(messages)
      .set({
        content: newContent,
        isEdited: true,
        editedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(messages.id, messageId));
  }

  /**
   * Block a user from messaging
   */
  static async blockUser(userId: UserId, blockedUserId: UserId) {
    // Implementation would depend on your blocking system
    // This is a placeholder
    throw new Error('Blocking system not yet implemented');
  }

  /**
   * Report a message
   */
  static async reportMessage(messageId: MessageId, reporterId: UserId, reason: string) {
    // Implementation would depend on your reporting system
    // This is a placeholder
    throw new Error('Reporting system not yet implemented');
  }
}