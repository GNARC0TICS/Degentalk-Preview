/**
 * Messaging Routes
 *
 * Defines API routes for user-to-user messaging functionality.
 */

import { Router } from 'express'
import type { Router as RouterType } from 'express';
import type { Request, Response } from 'express';
import type { UserId } from '@shared/types/ids';
import { z } from 'zod';
import { db } from '@db';
import { eq } from 'drizzle-orm';
import { users } from '@schema';
import { getUserIdFromRequest } from '@core/utils/auth.helpers';
import {
	isAuthenticated,
	isAdminOrModerator,
	isAdmin
} from '@api/domains/auth/middleware/auth.middleware';
import { MessageTransformer } from './transformers/message.transformer';
import { MessageService } from './message.service';
import { logger } from '@core/logger';
import { UserTransformer } from '@api/domains/users/transformers/user.transformer';
import {
	sendSuccessResponse,
	sendErrorResponse,
	sendTransformedResponse,
	sendTransformedListResponse
} from '@core/utils/transformer.helpers';

const router: RouterType = Router();

// Get all conversations for the current user
router.get('/conversations', isAuthenticated, async (req: Request, res: Response) => {
	try {
		const userId = getUserIdFromRequest(req);
		if (userId === undefined) {
			return sendErrorResponse(res, 'Unauthorized - User ID not found', 401);
		}

		// Get conversations using the service
		const conversations = await MessageService.getConversations(userId);

		// Get current user for transformation
		const [currentUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

		// Transform conversations for authenticated user
		const transformedConversations = conversations.map((conversation) =>
			MessageTransformer.toAuthenticatedConversation(
				conversation,
				currentUser,
				conversation.participants
			)
		);

		sendSuccessResponse(res, transformedConversations);
	} catch (error) {
		logger.error('Error getting conversations:', error);
		sendErrorResponse(res, 'Failed to get conversations', 500);
	}
});

// Get messages for a specific conversation
router.get('/conversation/:userId', isAuthenticated, async (req: Request, res: Response) => {
	try {
		const currentUserId = getUserIdFromRequest(req);
		if (currentUserId === undefined) {
			return sendErrorResponse(res, 'Unauthorized - User ID not found', 401);
		}
		const otherUserId = req.params.userId as UserId;

		if (isNaN(otherUserId)) {
			return sendErrorResponse(res, 'Invalid user ID', 400);
		}

		// Get messages using the service
		const conversationMessages = await MessageService.getMessageThread(currentUserId, otherUserId);

		// Get other user details
		const [otherUser] = await db.select().from(users).where(eq(users.id, otherUserId)).limit(1);

		// Get current user details
		const [currentUser] = await db.select().from(users).where(eq(users.id, currentUserId)).limit(1);

		// Transform messages for authenticated user
		const messageThread = {
			participants: [currentUser, otherUser].map((user) => UserTransformer.toPublicUser(user)),
			messages: conversationMessages.map((message) =>
				MessageTransformer.toAuthenticatedMessage(message, currentUser)
			),
			totalCount: conversationMessages.length
		};

		sendSuccessResponse(res, messageThread);
	} catch (error) {
		logger.error('Error getting conversation messages:', error);
		sendErrorResponse(res, 'Failed to get conversation messages', 500);
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
			return sendErrorResponse(res, 'Unauthorized - User ID not found', 401);
		}

		// Send message using the service
		const newMessage = await MessageService.sendMessage(senderId, { recipientId, content });

		// Get current user details for transformation
		const [currentUser] = await db.select().from(users).where(eq(users.id, senderId)).limit(1);

		// Transform the message before sending response
		const transformedMessage = MessageTransformer.toAuthenticatedMessage(newMessage, currentUser);

		res.status(201);
		sendSuccessResponse(res, transformedMessage);
	} catch (error) {
		logger.error('Error sending message:', error);
		if (error instanceof z.ZodError) {
			return sendErrorResponse(res, 'Invalid message data', 400, { errors: error.errors });
		}
		sendErrorResponse(res, 'Failed to send message', 500);
	}
});

// Mark messages as read
router.post('/mark-read/:userId', isAuthenticated, async (req: Request, res: Response) => {
	try {
		const currentUserId = getUserIdFromRequest(req);
		if (currentUserId === undefined) {
			return sendErrorResponse(res, 'Unauthorized - User ID not found', 401);
		}
		const senderId = req.params.userId as UserId;

		if (isNaN(senderId)) {
			return sendErrorResponse(res, 'Invalid user ID', 400);
		}

		// Mark messages as read using the service
		await MessageService.markMessagesAsRead(currentUserId, senderId);

		sendSuccessResponse(res, null, 'Messages marked as read');
	} catch (error) {
		logger.error('Error marking messages as read:', error);
		sendErrorResponse(res, 'Failed to mark messages as read', 500);
	}
});

// Delete a conversation
router.delete('/conversation/:userId', isAuthenticated, async (req: Request, res: Response) => {
	try {
		const currentUserId = getUserIdFromRequest(req);
		if (currentUserId === undefined) {
			return sendErrorResponse(res, 'Unauthorized - User ID not found', 401);
		}
		const otherUserId = req.params.userId as UserId;

		if (isNaN(otherUserId)) {
			return sendErrorResponse(res, 'Invalid user ID', 400);
		}

		// Delete conversation using the service
		await MessageService.deleteConversation(currentUserId, otherUserId);

		sendSuccessResponse(res, null, 'Conversation deleted');
	} catch (error) {
		logger.error('Error deleting conversation:', error);
		sendErrorResponse(res, 'Failed to delete conversation', 500);
	}
});

// Get unread message count
router.get('/unread-count', isAuthenticated, async (req: Request, res: Response) => {
	try {
		const userId = getUserIdFromRequest(req);
		if (userId === undefined) {
			return sendErrorResponse(res, 'Unauthorized - User ID not found', 401);
		}

		// Get unread count using the service
		const total = await MessageService.getUnreadCount(userId);

		sendSuccessResponse(res, { total });
	} catch (error) {
		logger.error('Error getting unread count:', error);
		sendErrorResponse(res, 'Failed to get unread message count', 500);
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
			return sendErrorResponse(res, 'Unauthorized - User ID not found', 401);
		}

		await MessageService.editMessage(messageId, userId, content);

		sendSuccessResponse(res, null, 'Message edited successfully');
	} catch (error) {
		logger.error('Error editing message:', error);
		if (error instanceof z.ZodError) {
			return sendErrorResponse(res, 'Invalid message data', 400, { errors: error.errors });
		}
		if (error instanceof Error) {
			return sendErrorResponse(res, error.message, 400);
		}
		sendErrorResponse(res, 'Failed to edit message', 500);
	}
});

// Delete a single message
router.delete('/message/:messageId', isAuthenticated, async (req: Request, res: Response) => {
	try {
		const messageId = req.params.messageId;
		const userId = getUserIdFromRequest(req);

		if (userId === undefined) {
			return sendErrorResponse(res, 'Unauthorized - User ID not found', 401);
		}

		await MessageService.deleteMessage(messageId, userId);

		sendSuccessResponse(res, null, 'Message deleted successfully');
	} catch (error) {
		logger.error('Error deleting message:', error);
		if (error instanceof Error) {
			return sendErrorResponse(res, error.message, 400);
		}
		sendErrorResponse(res, 'Failed to delete message', 500);
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
		const transformedMessages = messages.map((message) =>
			MessageTransformer.toAdminMessage(message)
		);

		sendSuccessResponse(res, {
			messages: transformedMessages,
			total: messages.length,
			page: parseInt(page as string),
			limit: parseInt(limit as string)
		});
	} catch (error) {
		logger.error('Error getting messages for moderation:', error);
		sendErrorResponse(res, 'Failed to get messages for moderation', 500);
	}
});

export default router;
