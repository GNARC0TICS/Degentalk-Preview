/**
 * Safe ID Converter
 * 
 * SECURITY: Replaces the dangerous TypeTransformer with validated ID conversions.
 * All ID conversions MUST go through proper validation to prevent security vulnerabilities.
 * 
 * This module provides safe alternatives to TypeTransformer methods that:
 * - Validate UUID format before conversion
 * - Log invalid conversion attempts for security monitoring
 * - Throw errors on invalid IDs to prevent silent failures
 * - Maintain type safety with branded IDs
 */

import { isValidId, toId } from '@shared/utils/id';
import { toUserId as _toUserId, toThreadId as _toThreadId, toPostId as _toPostId, toForumId as _toForumId, toWalletId as _toWalletId, toTransactionId as _toTransactionId, toItemId as _toItemId, toFrameId as _toFrameId, toBadgeId as _toBadgeId, toTitleId as _toTitleId, toMessageId as _toMessageId, toConversationId as _toConversationId } from '@shared/types';
import type {
	UserId,
	ThreadId,
	PostId,
	WalletId,
	TransactionId,
	ForumId,
	ItemId,
	FrameId,
	BadgeId,
	TitleId,
	MessageId,
	ConversationId,
	Id
} from '@shared/types/ids';
import { logger } from '@core/logger';

// Security error class for ID validation failures
export class IdValidationError extends Error {
	constructor(public readonly attemptedId: string | number, public readonly type: string) {
		super(`Invalid ${type} ID format: ${attemptedId}`);
		this.name = 'IdValidationError';
	}
}

/**
 * Safely convert to UserId with validation
 */
export function safeToUserId(id: string | number): UserId {
	const stringId = String(id);
	if (!isValidId(stringId)) {
		logger.error('Invalid UserId conversion attempt', `Attempted ID: ${id}`);
		throw new IdValidationError(id, 'User');
	}
	return _toUserId(stringId);
}

/**
 * Safely convert to ThreadId with validation
 */
export function safeToThreadId(id: string | number): ThreadId {
	const stringId = String(id);
	if (!isValidId(stringId)) {
		logger.error('Invalid ThreadId conversion attempt', `Attempted ID: ${id}`);
		throw new IdValidationError(id, 'Thread');
	}
	return _toThreadId(stringId);
}

/**
 * Safely convert to PostId with validation
 */
export function safeToPostId(id: string | number): PostId {
	const stringId = String(id);
	if (!isValidId(stringId)) {
		logger.error('Invalid PostId conversion attempt', `Attempted ID: ${id}`);
		throw new IdValidationError(id, 'Post');
	}
	return _toPostId(stringId);
}

/**
 * Safely convert to ForumId with validation
 */
export function safeToForumId(id: string | number): ForumId {
	const stringId = String(id);
	if (!isValidId(stringId)) {
		logger.error('Invalid ForumId conversion attempt', `Attempted ID: ${id}`);
		throw new IdValidationError(id, 'Forum');
	}
	return _toForumId(stringId);
}

/**
 * Safely convert to WalletId with validation
 */
export function safeToWalletId(id: string | number): WalletId {
	const stringId = String(id);
	if (!isValidId(stringId)) {
		logger.error('Invalid WalletId conversion attempt', `Attempted ID: ${id}`);
		throw new IdValidationError(id, 'Wallet');
	}
	return _toWalletId(stringId);
}

/**
 * Safely convert to TransactionId with validation
 */
export function safeToTransactionId(id: string | number): TransactionId {
	const stringId = String(id);
	if (!isValidId(stringId)) {
		logger.error('Invalid TransactionId conversion attempt', `Attempted ID: ${id}`);
		throw new IdValidationError(id, 'Transaction');
	}
	return _toTransactionId(stringId);
}

/**
 * Safely convert to ItemId with validation
 */
export function safeToItemId(id: string | number): ItemId {
	const stringId = String(id);
	if (!isValidId(stringId)) {
		logger.error('Invalid ItemId conversion attempt', `Attempted ID: ${id}`);
		throw new IdValidationError(id, 'Item');
	}
	return _toItemId(stringId);
}

/**
 * Safely convert to FrameId with validation
 */
export function safeToFrameId(id: string | number): FrameId {
	const stringId = String(id);
	if (!isValidId(stringId)) {
		logger.error('Invalid FrameId conversion attempt', `Attempted ID: ${id}`);
		throw new IdValidationError(id, 'Frame');
	}
	return _toFrameId(stringId);
}

/**
 * Safely convert to BadgeId with validation
 */
export function safeToBadgeId(id: string | number): BadgeId {
	const stringId = String(id);
	if (!isValidId(stringId)) {
		logger.error('Invalid BadgeId conversion attempt', `Attempted ID: ${id}`);
		throw new IdValidationError(id, 'Badge');
	}
	return _toBadgeId(stringId);
}

/**
 * Safely convert to TitleId with validation
 */
export function safeToTitleId(id: string | number): TitleId {
	const stringId = String(id);
	if (!isValidId(stringId)) {
		logger.error('Invalid TitleId conversion attempt', `Attempted ID: ${id}`);
		throw new IdValidationError(id, 'Title');
	}
	return _toTitleId(stringId);
}

/**
 * Safely convert to MessageId with validation
 */
export function safeToMessageId(id: string | number): MessageId {
	const stringId = String(id);
	if (!isValidId(stringId)) {
		logger.error('Invalid MessageId conversion attempt', `Attempted ID: ${id}`);
		throw new IdValidationError(id, 'Message');
	}
	return _toMessageId(stringId);
}

/**
 * Safely convert to ConversationId with validation
 */
export function safeToConversationId(id: string | number): ConversationId {
	const stringId = String(id);
	if (!isValidId(stringId)) {
		logger.error('Invalid ConversationId conversion attempt', `Attempted ID: ${id}`);
		throw new IdValidationError(id, 'Conversation');
	}
	return _toConversationId(stringId);
}

/**
 * Generic safe ID converter with validation
 */
export function safeToId<T extends string>(id: string | number, type: T): Id<T> {
	const stringId = String(id);
	if (!isValidId(stringId)) {
		logger.error(`Invalid ${type}Id conversion attempt`, `Attempted ID: ${id}, Type: ${type}`);
		throw new IdValidationError(id, type);
	}
	return toId<T>(stringId);
}

/**
 * Try to convert an ID, returning null instead of throwing on failure.
 * Useful for optional ID fields or when you want to handle errors gracefully.
 */
export function tryConvertId<T extends string>(id: string | number | null | undefined, type: T): Id<T> | null {
	if (id == null) return null;
	
	try {
		const stringId = String(id);
		if (!isValidId(stringId)) {
			logger.warn(`Invalid ${type}Id in optional field`, `Attempted ID: ${id}, Type: ${type}`);
			return null;
		}
		return toId<T>(stringId);
	} catch (error) {
		logger.warn(`Failed to convert optional ${type}Id`, `Attempted ID: ${id}, Type: ${type}, Error: ${error}`);
		return null;
	}
}

/**
 * Batch convert multiple IDs with validation.
 * Throws if any ID is invalid.
 */
export function safeConvertIds<T extends string>(ids: (string | number)[], type: T): Id<T>[] {
	return ids.map(id => safeToId(id, type));
}

/**
 * Transform a record by safely converting all ID fields.
 * Used as a replacement for TypeTransformer.transformDbRecord
 */
export function safeTransformRecord<T extends Record<string, any>>(
	record: T,
	internalFields: (keyof T)[] = []
): T {
	const transformed = { ...record };

	// Remove internal fields
	for (const field of internalFields) {
		delete transformed[field];
	}

	// Safely convert ID fields
	const idFieldMappings: Record<string, (id: any) => any> = {
		id: (id) => tryConvertId(id, 'Generic'),
		userId: safeToUserId,
		threadId: safeToThreadId,
		postId: safeToPostId,
		forumId: safeToForumId,
		walletId: safeToWalletId,
		transactionId: safeToTransactionId,
		itemId: safeToItemId,
		frameId: safeToFrameId,
		badgeId: safeToBadgeId,
		titleId: safeToTitleId,
		messageId: safeToMessageId,
		conversationId: safeToConversationId,
		senderId: safeToUserId,
		recipientId: safeToUserId,
		fromWalletId: (id) => tryConvertId(id, 'Wallet'),
		toWalletId: (id) => tryConvertId(id, 'Wallet')
	};

	for (const [field, converter] of Object.entries(idFieldMappings)) {
		if (field in transformed && transformed[field] != null) {
			try {
				transformed[field] = converter(transformed[field]);
			} catch (error) {
				if (error instanceof IdValidationError) {
					logger.error(`Failed to transform ${field} in record`, `Field: ${field}, Value: ${transformed[field]}, Error: ${error.message}`);
					// Re-throw to prevent returning invalid data
					throw error;
				}
			}
		}
	}

	return transformed;
}

/**
 * Export a compatible interface for gradual migration from TypeTransformer
 */
export const SafeIdConverter = {
	toUserId: safeToUserId,
	toThreadId: safeToThreadId,
	toPostId: safeToPostId,
	toForumId: safeToForumId,
	toWalletId: safeToWalletId,
	toTransactionId: safeToTransactionId,
	toItemId: safeToItemId,
	toFrameId: safeToFrameId,
	toBadgeId: safeToBadgeId,
	toTitleId: safeToTitleId,
	toMessageId: safeToMessageId,
	toConversationId: safeToConversationId,
	toId: safeToId,
	transformDbRecord: safeTransformRecord
};