/**
 * Messaging Routes
 *
 * Defines API routes for user-to-user messaging functionality.
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '@db';
import { randomUUID } from 'crypto';
import { eq, and, or, desc, sql } from 'drizzle-orm';
import { messages, users } from '@schema';

import { isAuthenticated, isAdminOrModerator, isAdmin } from '../auth/middleware/auth.middleware';

// Helper function to get user ID from req.user
function getUserId(req: Request): number {
	if (req.user && typeof (req.user as any).id === 'number') {
		return (req.user as any).id;
	}
	console.error('User ID not found in req.user');
	return (req.user as any)?.user_id;
}

const router = Router();

// Get all conversations for the current user
router.get('/conversations', isAuthenticated, async (req: Request, res: Response) => {
	try {
		const userId = getUserId(req);

		// Get unique conversations with last message and unread count
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

		res.json(conversations.rows);
	} catch (error) {
		console.error('Error getting conversations:', error);
		res.status(500).json({ message: 'Failed to get conversations' });
	}
});

// Get messages for a specific conversation
router.get('/conversation/:userId', isAuthenticated, async (req: Request, res: Response) => {
	try {
		const currentUserId = getUserId(req);
		const otherUserId = parseInt(req.params.userId);

		if (isNaN(otherUserId)) {
			return res.status(400).json({ message: 'Invalid user ID' });
		}

		// Get messages between the two users
		const conversationMessages = await db
			.select({
				id: messages.id,
				senderId: messages.senderId,
				recipientId: messages.recipientId,
				content: messages.content,
				timestamp: messages.createdAt,
				isRead: messages.isRead
			})
			.from(messages)
			.where(
				or(
					and(eq(messages.senderId, currentUserId), eq(messages.recipientId, otherUserId)),
					and(eq(messages.senderId, otherUserId), eq(messages.recipientId, currentUserId))
				)
			)
			.orderBy(messages.createdAt);

		res.json(conversationMessages);
	} catch (error) {
		console.error('Error getting conversation messages:', error);
		res.status(500).json({ message: 'Failed to get conversation messages' });
	}
});

// Send a new message
router.post('/send', isAuthenticated, async (req: Request, res: Response) => {
	try {
		const sendMessageSchema = z.object({
			recipientId: z.number(),
			content: z.string().min(1).max(2000)
		});

		const { recipientId, content } = sendMessageSchema.parse(req.body);
		const senderId = getUserId(req);

		// Check if recipient exists
		const recipientExists = await db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.id, recipientId))
			.limit(1);

		if (recipientExists.length === 0) {
			return res.status(404).json({ message: 'Recipient not found' });
		}

		// Don't allow sending messages to self
		if (senderId === recipientId) {
			return res.status(400).json({ message: 'Cannot send messages to yourself' });
		}

		// Insert the new message
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

		res.status(201).json(newMessage);
	} catch (error) {
		console.error('Error sending message:', error);
		if (error instanceof z.ZodError) {
			return res.status(400).json({ message: 'Invalid message data', errors: error.errors });
		}
		res.status(500).json({ message: 'Failed to send message' });
	}
});

// Mark messages as read
router.post('/mark-read/:userId', isAuthenticated, async (req: Request, res: Response) => {
	try {
		const currentUserId = getUserId(req);
		const senderId = parseInt(req.params.userId);

		if (isNaN(senderId)) {
			return res.status(400).json({ message: 'Invalid user ID' });
		}

		// Update all unread messages from the sender to the current user
		await db
			.update(messages)
			.set({
				isRead: true,
				updatedAt: new Date()
			})
			.where(
				and(
					eq(messages.senderId, senderId),
					eq(messages.recipientId, currentUserId),
					eq(messages.isRead, false)
				)
			);

		res.json({ success: true, message: 'Messages marked as read' });
	} catch (error) {
		console.error('Error marking messages as read:', error);
		res.status(500).json({ message: 'Failed to mark messages as read' });
	}
});

// Delete a conversation
router.delete('/conversation/:userId', isAuthenticated, async (req: Request, res: Response) => {
	try {
		const currentUserId = getUserId(req);
		const otherUserId = parseInt(req.params.userId);

		if (isNaN(otherUserId)) {
			return res.status(400).json({ message: 'Invalid user ID' });
		}

		// Soft delete all messages between the two users
		await db
			.update(messages)
			.set({
				isDeleted: true,
				updatedAt: new Date()
			})
			.where(
				or(
					and(eq(messages.senderId, currentUserId), eq(messages.recipientId, otherUserId)),
					and(eq(messages.senderId, otherUserId), eq(messages.recipientId, currentUserId))
				)
			);

		res.json({ success: true, message: 'Conversation deleted' });
	} catch (error) {
		console.error('Error deleting conversation:', error);
		res.status(500).json({ message: 'Failed to delete conversation' });
	}
});

// Get unread message count
router.get('/unread-count', isAuthenticated, async (req: Request, res: Response) => {
	try {
		const userId = getUserId(req);

		// Count unread messages for the current user
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

		const total = result[0]?.count || 0;

		res.json({ total });
	} catch (error) {
		console.error('Error getting unread count:', error);
		res.status(500).json({ message: 'Failed to get unread message count' });
	}
});

export default router;
