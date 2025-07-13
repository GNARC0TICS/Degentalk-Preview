/**
 * Response Transformation Middleware
 *
 * Automatically transforms database types to frontend-safe types
 * for API responses. Ensures clean separation between internal
 * database representation and public API contracts.
 */

import type { Request, Response, NextFunction } from 'express';
import { transform } from '@core/type-transformer';

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

// Pre-built transformation middlewares for common entities
export const transformUserResponse = createTransformMiddleware(transform.transformUser);
export const transformThreadResponse = createTransformMiddleware(transform.transformThread);
export const transformPostResponse = createTransformMiddleware(transform.transformPost);
export const transformWalletResponse = createTransformMiddleware(transform.transformWallet);
export const transformTransactionResponse = createTransformMiddleware(
	transform.transformTransaction
);
export const transformMessageResponse = createTransformMiddleware(transform.transformMessage);
export const transformConversationResponse = createTransformMiddleware(
	transform.transformConversation
);

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
		// Detect entity type based on fields and transform accordingly
		if (hasUserFields(data)) {
			return transform.transformUser(data);
		} else if (hasThreadFields(data)) {
			return transform.transformThread(data);
		} else if (hasPostFields(data)) {
			return transform.transformPost(data);
		} else if (hasWalletFields(data)) {
			return transform.transformWallet(data);
		} else if (hasTransactionFields(data)) {
			return transform.transformTransaction(data);
		} else if (hasMessageFields(data)) {
			return transform.transformMessage(data);
		} else if (hasConversationFields(data)) {
			return transform.transformConversation(data);
		}

		// For unknown objects, just ensure IDs are properly transformed
		return transformUnknownObject(data);
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

// Transform unknown objects by converting common ID fields
function transformUnknownObject(obj: any): any {
	const transformed = { ...obj };

	// Common ID field transformations
	const idFields = [
		'id',
		'userId',
		'threadId',
		'postId',
		'forumId',
		'walletId',
		'transactionId',
		'itemId',
		'frameId',
		'badgeId',
		'titleId',
		'messageId',
		'conversationId',
		'senderId',
		'recipientId'
	];

	for (const field of idFields) {
		if (field in transformed && transformed[field] != null) {
			if (field === 'userId') {
				transformed[field] = transform.toUserId(transformed[field]);
			} else if (field === 'threadId') {
				transformed[field] = transform.toThreadId(transformed[field]);
			} else if (field === 'postId') {
				transformed[field] = transform.toPostId(transformed[field]);
			} else if (field === 'forumId') {
				transformed[field] = transform.toForumId(transformed[field]);
			} else if (field === 'walletId') {
				transformed[field] = transform.toWalletId(transformed[field]);
			} else if (field === 'transactionId') {
				transformed[field] = transform.toTransactionId(transformed[field]);
			} else if (field === 'itemId') {
				transformed[field] = transform.toItemId(transformed[field]);
			} else if (field === 'frameId') {
				transformed[field] = transform.toFrameId(transformed[field]);
			} else if (field === 'badgeId') {
				transformed[field] = transform.toBadgeId(transformed[field]);
			} else if (field === 'titleId') {
				transformed[field] = transform.toTitleId(transformed[field]);
			} else if (field === 'messageId') {
				transformed[field] = transform.toMessageId(transformed[field]);
			} else if (field === 'conversationId') {
				transformed[field] = transform.toConversationId(transformed[field]);
			} else if (field === 'senderId') {
				transformed[field] = transform.toUserId(transformed[field]);
			} else if (field === 'recipientId') {
				transformed[field] = transform.toUserId(transformed[field]);
			} else if (field === 'id') {
				// For generic 'id' field, convert to string
				transformed[field] = String(transformed[field]);
			}
		}
	}

	return transformed;
}
