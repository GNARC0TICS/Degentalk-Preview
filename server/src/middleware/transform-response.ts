/**
 * Response Transformation Middleware
 *
 * SECURITY: Updated to use safe ID conversion with validation.
 * Automatically transforms database types to frontend-safe types
 * for API responses while ensuring all IDs are properly validated.
 */

import type { Request, Response, NextFunction } from 'express';
import { 
	SafeIdConverter,
	tryConvertId,
	safeTransformRecord,
	IdValidationError 
} from '@core/helpers/safe-id-converter';
import { logger } from '@core/logger';

// Response transformation middleware factory
export const createTransformMiddleware = <T>(transformer: (data: any) => T) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const originalJson = res.json;

		res.json = function (data: any) {
			if (data && data.success && data.data) {
				// Transform the data while preserving the API response structure
				const transformedData = Array.isArray(data.data)
					? data.data.map(transformer)
					: transformer(data.data);

				return originalJson.call(this, {
					...data,
					data: transformedData
				});
			}

			return originalJson.call(this, data);
		};

		next();
	};
};

// Safe transformation functions for common entities
const safeTransformUser = (data: any) => {
	try {
		return safeTransformRecord(data, ['password', 'salt', 'internal_notes']);
	} catch (error) {
		if (error instanceof IdValidationError) {
			logger.error('TRANSFORM', 'Invalid ID in user transformation', { error: error.message });
			throw error;
		}
		throw error;
	}
};

const safeTransformThread = (data: any) => {
	try {
		return safeTransformRecord(data);
	} catch (error) {
		if (error instanceof IdValidationError) {
			logger.error('TRANSFORM', 'Invalid ID in thread transformation', { error: error.message });
			throw error;
		}
		throw error;
	}
};

const safeTransformPost = (data: any) => {
	try {
		return safeTransformRecord(data);
	} catch (error) {
		if (error instanceof IdValidationError) {
			logger.error('TRANSFORM', 'Invalid ID in post transformation', { error: error.message });
			throw error;
		}
		throw error;
	}
};

const safeTransformWallet = (data: any) => {
	try {
		return safeTransformRecord(data, ['private_key', 'seed']);
	} catch (error) {
		if (error instanceof IdValidationError) {
			logger.error('TRANSFORM', 'Invalid ID in wallet transformation', { error: error.message });
			throw error;
		}
		throw error;
	}
};

const safeTransformTransaction = (data: any) => {
	try {
		return safeTransformRecord(data);
	} catch (error) {
		if (error instanceof IdValidationError) {
			logger.error('TRANSFORM', 'Invalid ID in transaction transformation', { error: error.message });
			throw error;
		}
		throw error;
	}
};

const safeTransformMessage = (data: any) => {
	try {
		return safeTransformRecord(data, ['ipAddress', 'editorState']);
	} catch (error) {
		if (error instanceof IdValidationError) {
			logger.error('TRANSFORM', 'Invalid ID in message transformation', { error: error.message });
			throw error;
		}
		throw error;
	}
};

const safeTransformConversation = (data: any) => {
	try {
		const transformed = { ...data };
		// Handle both camelCase and snake_case fields
		if ('userId' in transformed || 'user_id' in transformed) {
			const userId = transformed.userId || transformed.user_id;
			transformed.userId = SafeIdConverter.toUserId(userId);
			delete transformed.user_id;
		}
		if ('lastMessageTime' in transformed || 'last_message_time' in transformed) {
			const time = transformed.lastMessageTime || transformed.last_message_time;
			transformed.lastMessageTime = new Date(time);
			delete transformed.last_message_time;
		}
		return transformed;
	} catch (error) {
		if (error instanceof IdValidationError) {
			logger.error('TRANSFORM', 'Invalid ID in conversation transformation', { error: error.message });
			throw error;
		}
		throw error;
	}
};

// Pre-built transformation middlewares for common entities
export const transformUserResponse = createTransformMiddleware(safeTransformUser);
export const transformThreadResponse = createTransformMiddleware(safeTransformThread);
export const transformPostResponse = createTransformMiddleware(safeTransformPost);
export const transformWalletResponse = createTransformMiddleware(safeTransformWallet);
export const transformTransactionResponse = createTransformMiddleware(safeTransformTransaction);
export const transformMessageResponse = createTransformMiddleware(safeTransformMessage);
export const transformConversationResponse = createTransformMiddleware(safeTransformConversation);

// Generic transformation middleware
export const transformResponse = (req: Request, res: Response, next: NextFunction) => {
	const originalJson = res.json;

	res.json = function (data: any) {
		if (data && data.success && data.data) {
			// Auto-detect entity type and apply appropriate transformation
			const transformedData = autoTransformData(data.data);

			return originalJson.call(this, {
				...data,
				data: transformedData
			});
		}

		return originalJson.call(this, data);
	};

	next();
};

// Auto-detection and transformation based on data structure
function autoTransformData(data: any): any {
	if (Array.isArray(data)) {
		return data.map(autoTransformData);
	}

	if (typeof data === 'object' && data !== null) {
		try {
			// Detect entity type based on fields and transform accordingly
			if (hasUserFields(data)) {
				return safeTransformUser(data);
			} else if (hasThreadFields(data)) {
				return safeTransformThread(data);
			} else if (hasPostFields(data)) {
				return safeTransformPost(data);
			} else if (hasWalletFields(data)) {
				return safeTransformWallet(data);
			} else if (hasTransactionFields(data)) {
				return safeTransformTransaction(data);
			} else if (hasMessageFields(data)) {
				return safeTransformMessage(data);
			} else if (hasConversationFields(data)) {
				return safeTransformConversation(data);
			}

			// For unknown objects, just ensure IDs are properly transformed
			return transformUnknownObject(data);
		} catch (error) {
			if (error instanceof IdValidationError) {
				logger.error('TRANSFORM', 'Invalid ID detected in auto-transform', { 
					error: error.message,
					dataType: data.constructor.name 
				});
				// Return the data without transformation to prevent API failures
				// The invalid ID will be logged for security monitoring
				return data;
			}
			throw error;
		}
	}

	return data;
}

// Entity detection helpers
function hasUserFields(obj: any): boolean {
	return obj && ('username' in obj || 'email' in obj) && 'id' in obj;
}

function hasThreadFields(obj: any): boolean {
	return obj && 'title' in obj && 'forumId' in obj && 'id' in obj;
}

function hasPostFields(obj: any): boolean {
	return obj && 'content' in obj && 'threadId' in obj && 'id' in obj;
}

function hasWalletFields(obj: any): boolean {
	return obj && ('balance' in obj || 'address' in obj) && 'userId' in obj && 'id' in obj;
}

function hasTransactionFields(obj: any): boolean {
	return obj && 'amount' in obj && ('fromWalletId' in obj || 'toWalletId' in obj) && 'id' in obj;
}

function hasMessageFields(obj: any): boolean {
	return obj && 'content' in obj && 'senderId' in obj && 'recipientId' in obj && 'id' in obj;
}

function hasConversationFields(obj: any): boolean {
	return (
		obj && ('userId' in obj || 'user_id' in obj) && ('lastMessage' in obj || 'last_message' in obj)
	);
}

// Transform unknown objects by converting common ID fields with validation
function transformUnknownObject(obj: any): any {
	const transformed = { ...obj };

	// ID field to converter mapping
	const idFieldConverters: Record<string, (id: any) => any> = {
		'userId': (id) => tryConvertId(id, 'User'),
		'threadId': (id) => tryConvertId(id, 'Thread'),
		'postId': (id) => tryConvertId(id, 'Post'),
		'forumId': (id) => tryConvertId(id, 'Forum'),
		'walletId': (id) => tryConvertId(id, 'Wallet'),
		'transactionId': (id) => tryConvertId(id, 'Transaction'),
		'itemId': (id) => tryConvertId(id, 'Item'),
		'frameId': (id) => tryConvertId(id, 'Frame'),
		'badgeId': (id) => tryConvertId(id, 'Badge'),
		'titleId': (id) => tryConvertId(id, 'Title'),
		'messageId': (id) => tryConvertId(id, 'Message'),
		'conversationId': (id) => tryConvertId(id, 'Conversation'),
		'senderId': (id) => tryConvertId(id, 'User'),
		'recipientId': (id) => tryConvertId(id, 'User'),
		'fromWalletId': (id) => tryConvertId(id, 'Wallet'),
		'toWalletId': (id) => tryConvertId(id, 'Wallet'),
		'id': (id) => {
			// For generic 'id' field, validate but keep as string
			const stringId = String(id);
			if (!stringId || stringId === 'null' || stringId === 'undefined') {
				return null;
			}
			// Log if it looks like it should be a UUID but isn't valid
			if (stringId.length > 20 && !tryConvertId(stringId, 'Generic')) {
				logger.warn('TRANSFORM', 'Potential invalid UUID in generic id field', { id: stringId });
			}
			return stringId;
		}
	};

	// Process each potential ID field
	for (const [field, converter] of Object.entries(idFieldConverters)) {
		if (field in transformed && transformed[field] != null) {
			const convertedValue = converter(transformed[field]);
			if (convertedValue !== null) {
				transformed[field] = convertedValue;
			} else {
				// Log the validation failure but keep the original value
				// This prevents API breakage while still tracking security issues
				logger.warn('TRANSFORM', `Invalid ID in field ${field}, keeping original value`, {
					field,
					value: transformed[field],
					objectType: obj.constructor?.name
				});
			}
		}
	}

	return transformed;
}
