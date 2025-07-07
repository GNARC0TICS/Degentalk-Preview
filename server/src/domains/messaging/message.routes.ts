/**
 * Messaging Routes
 *
 * Defines API routes for user-to-user messaging functionality.
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import type { UserId } from '@shared/types/ids';
import { z } from 'zod';
import { db } from '@db';
import { eq } from 'drizzle-orm';
import { users } from '@schema';
import { getUserIdFromRequest } from '@server/src/utils/auth';
import { isAuthenticated, isAdminOrModerator, isAdmin } from '../auth/middleware/auth.middleware';
import { MessageTransformer } from './transformers/message.transformer';
import { MessageService } from './message.service';
import { logger } from "../../core/logger";

const router = Router();

// Get all conversations for the current user
router.get('/conversations', isAuthenticated, async (req: Request, res: Response) => {
	try {
		const userId = getUserIdFromRequest(req);
		if (userId === undefined) {
			return res.status(401).json({ message: 'Unauthorized - User ID not found' });
		}

		// Get conversations using the service
		const conversations = await MessageService.getConversations(userId);

		// Get current user for transformation
		const [currentUser] = await db
			.select()
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);
		
		// Transform conversations for authenticated user
		const transformedConversations = conversations.map(conversation => 
			MessageTransformer.toAuthenticatedConversation(conversation, currentUser, conversation.participants)
		);
		
		res.json(transformedConversations);
	} catch (error) {
		logger.error('Error getting conversations:', error);
		res.status(500).json({ message: 'Failed to get conversations' });
	}
});

// Get messages for a specific conversation
router.get('/conversation/:userId', isAuthenticated, async (req: Request, res: Response) => {
	try {
		const currentUserId = getUserIdFromRequest(req);
		if (currentUserId === undefined) {
			return res.status(401).json({ message: 'Unauthorized - User ID not found' });
		}
		const otherUserId = req.params.userId as UserId;

		if (isNaN(otherUserId)) {
			return res.status(400).json({ message: 'Invalid user ID' });
		}

		// Get messages using the service
		const conversationMessages = await MessageService.getMessageThread(currentUserId, otherUserId);

		// Get other user details
		const [otherUser] = await db
			.select()
			.from(users)
			.where(eq(users.id, otherUserId))
			.limit(1);

		// Get current user details
		const [currentUser] = await db
			.select()
			.from(users)
			.where(eq(users.id, currentUserId))
			.limit(1);

		// Transform messages for authenticated user
		const messageThread = {
			participants: [currentUser, otherUser],
			messages: conversationMessages.map(message => 
				MessageTransformer.toAuthenticatedMessage(message, currentUser)
			),
			totalCount: conversationMessages.length
		};

		res.json(messageThread);
	} catch (error) {
		logger.error('Error getting conversation messages:', error);
		res.status(500).json({ message: 'Failed to get conversation messages' });
	}
});

// Send a new message
router.post('/send', isAuthenticated, async (req: Request, res: Response) => {
	try {
		const sendMessageSchema = z.object({
			recipientId: z.string().uuid(),
			content: z.string().min(1).max(2000)
		});

		const { recipientId, content } = sendMessageSchema.parse(req.body);
		const senderId = getUserIdFromRequest(req);

		if (senderId === undefined) {
			return res.status(401).json({ message: 'Unauthorized - User ID not found' });
		}

		// Send message using the service
		const newMessage = await MessageService.sendMessage(senderId, { recipientId, content });

		// Get current user details for transformation
		const [currentUser] = await db
			.select()
			.from(users)
			.where(eq(users.id, senderId))
			.limit(1);

		// Transform the message before sending response
		const transformedMessage = MessageTransformer.toAuthenticatedMessage(
			newMessage,
			currentUser
		);

		res.status(201).json(transformedMessage);
	} catch (error) {
		logger.error('Error sending message:', error);
		if (error instanceof z.ZodError) {
			return res.status(400).json({ message: 'Invalid message data', errors: error.errors });
		}
		res.status(500).json({ message: 'Failed to send message' });
	}
});

// Mark messages as read
router.post('/mark-read/:userId', isAuthenticated, async (req: Request, res: Response) => {
	try {
		const currentUserId = getUserIdFromRequest(req);
		if (currentUserId === undefined) {
			return res.status(401).json({ message: 'Unauthorized - User ID not found' });
		}
		const senderId = req.params.userId as UserId;

		if (isNaN(senderId)) {
			return res.status(400).json({ message: 'Invalid user ID' });
		}

		// Mark messages as read using the service
		await MessageService.markMessagesAsRead(currentUserId, senderId);

		res.json({ success: true, message: 'Messages marked as read' });
	} catch (error) {
		logger.error('Error marking messages as read:', error);
		res.status(500).json({ message: 'Failed to mark messages as read' });
	}
});

// Delete a conversation
router.delete('/conversation/:userId', isAuthenticated, async (req: Request, res: Response) => {
	try {
		const currentUserId = getUserIdFromRequest(req);
		if (currentUserId === undefined) {
			return res.status(401).json({ message: 'Unauthorized - User ID not found' });
		}
		const otherUserId = req.params.userId as UserId;

		if (isNaN(otherUserId)) {
			return res.status(400).json({ message: 'Invalid user ID' });
		}

		// Delete conversation using the service
		await MessageService.deleteConversation(currentUserId, otherUserId);

		res.json({ success: true, message: 'Conversation deleted' });
	} catch (error) {
		logger.error('Error deleting conversation:', error);
		res.status(500).json({ message: 'Failed to delete conversation' });
	}
});

// Get unread message count
router.get('/unread-count', isAuthenticated, async (req: Request, res: Response) => {
	try {
		const userId = getUserIdFromRequest(req);
		if (userId === undefined) {
			return res.status(401).json({ message: 'Unauthorized - User ID not found' });
		}

		// Get unread count using the service
		const total = await MessageService.getUnreadCount(userId);

		res.json({ total });
	} catch (error) {
		logger.error('Error getting unread count:', error);
		res.status(500).json({ message: 'Failed to get unread message count' });
	}
});

// Edit a message
router.put('/message/:messageId', isAuthenticated, async (req: Request, res: Response) => {
	try {
		const editMessageSchema = z.object({
			content: z.string().min(1).max(2000)
		});

		const { content } = editMessageSchema.parse(req.body);
		const messageId = req.params.messageId;
		const userId = getUserIdFromRequest(req);

		if (userId === undefined) {
			return res.status(401).json({ message: 'Unauthorized - User ID not found' });
		}

		await MessageService.editMessage(messageId, userId, content);

		res.json({ success: true, message: 'Message edited successfully' });
	} catch (error) {
		logger.error('Error editing message:', error);
		if (error instanceof z.ZodError) {
			return res.status(400).json({ message: 'Invalid message data', errors: error.errors });
		}
		if (error instanceof Error) {
			return res.status(400).json({ message: error.message });
		}
		res.status(500).json({ message: 'Failed to edit message' });
	}
});

// Delete a single message
router.delete('/message/:messageId', isAuthenticated, async (req: Request, res: Response) => {
	try {
		const messageId = req.params.messageId;
		const userId = getUserIdFromRequest(req);

		if (userId === undefined) {
			return res.status(401).json({ message: 'Unauthorized - User ID not found' });
		}

		await MessageService.deleteMessage(messageId, userId);

		res.json({ success: true, message: 'Message deleted successfully' });
	} catch (error) {
		logger.error('Error deleting message:', error);
		if (error instanceof Error) {
			return res.status(400).json({ message: error.message });
		}
		res.status(500).json({ message: 'Failed to delete message' });
	}
});

// Admin: Get all messages for moderation
router.get('/admin/messages', isAdminOrModerator, async (req: Request, res: Response) => {
	try {
		const { userId, page = 1, limit = 50 } = req.query;
		
		// Get messages for admin moderation view
		const messages = await MessageService.getMessagesForModeration({ 
			userId: userId as string, 
			page: parseInt(page as string), 
			limit: parseInt(limit as string) 
		});
		
		// Transform messages for admin view
		const transformedMessages = messages.map(message => 
			MessageTransformer.toAdminMessage(message)
		);
		
		res.json({ 
			messages: transformedMessages,
			total: messages.length,
			page: parseInt(page as string),
			limit: parseInt(limit as string)
		});
	} catch (error) {
		logger.error('Error getting messages for moderation:', error);
		res.status(500).json({ message: 'Failed to get messages for moderation' });
	}
});

export default router;
