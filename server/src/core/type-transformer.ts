/**
 * Type Transformation Layer
 *
 * ⚠️ DEPRECATED - SECURITY VULNERABILITY ⚠️
 * This module contains critical security vulnerabilities:
 * - No UUID validation on ID conversions
 * - Allows any string/number to become a branded ID
 * - Bypasses all security checks
 * 
 * DO NOT USE THIS MODULE
 * Use @core/helpers/safe-id-converter instead
 * 
 * This file is kept temporarily for reference during migration.
 * It will be deleted once all usages are replaced.
 * 
 * @deprecated Use SafeIdConverter from @core/helpers/safe-id-converter
 */

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
import { logger } from './logger';

// Type transformation utilities
export class TypeTransformer {
	/**
	 * Transform database record to API-safe format
	 * Removes internal fields and ensures type safety
	 */
	static transformDbRecord<T extends Record<string, any>>(
		record: T,
		internalFields: (keyof T)[] = []
	): Omit<T, keyof T & string> {
		const transformed = { ...record };

		// Remove internal fields
		for (const field of internalFields) {
			delete transformed[field];
		}

		return transformed;
	}

	/**
	 * Transform database ID to frontend-safe branded type
	 */
	static toUserId(id: string | number): UserId {
		return String(id) as UserId;
	}

	static toThreadId(id: string | number): ThreadId {
		return String(id) as ThreadId;
	}

	static toPostId(id: string | number): PostId {
		return String(id) as PostId;
	}

	static toWalletId(id: string | number): WalletId {
		return String(id) as WalletId;
	}

	static toTransactionId(id: string | number): TransactionId {
		return String(id) as TransactionId;
	}

	static toForumId(id: string | number): ForumId {
		return String(id) as ForumId;
	}

	static toItemId(id: string | number): ItemId {
		return String(id) as ItemId;
	}

	static toFrameId(id: string | number): FrameId {
		return String(id) as FrameId;
	}

	static toBadgeId(id: string | number): BadgeId {
		return String(id) as BadgeId;
	}

	static toTitleId(id: string | number): TitleId {
		return String(id) as TitleId;
	}

	static toMessageId(id: string | number): MessageId {
		return String(id) as MessageId;
	}

	static toConversationId(id: string | number): ConversationId {
		return String(id) as ConversationId;
	}

	/**
	 * Generic ID transformer
	 */
	static toId<T extends string>(id: string | number): Id<T> {
		return String(id) as Id<T>;
	}

	/**
	 * Transform user record from database to API format
	 */
	static transformUser(dbUser: any): any {
		return {
			...this.transformDbRecord(dbUser, ['password', 'salt', 'internal_notes']),
			id: this.toUserId(dbUser.id)
		};
	}

	/**
	 * Transform thread record from database to API format
	 */
	static transformThread(dbThread: any): any {
		return {
			...this.transformDbRecord(dbThread),
			id: this.toThreadId(dbThread.id),
			userId: this.toUserId(dbThread.userId),
			forumId: this.toForumId(dbThread.forumId)
		};
	}

	/**
	 * Transform post record from database to API format
	 */
	static transformPost(dbPost: any): any {
		return {
			...this.transformDbRecord(dbPost),
			id: this.toPostId(dbPost.id),
			userId: this.toUserId(dbPost.userId),
			threadId: this.toThreadId(dbPost.threadId)
		};
	}

	/**
	 * Transform wallet record from database to API format
	 */
	static transformWallet(dbWallet: any): any {
		return {
			...this.transformDbRecord(dbWallet, ['private_key', 'seed']),
			id: this.toWalletId(dbWallet.id),
			userId: this.toUserId(dbWallet.userId)
		};
	}

	/**
	 * Transform transaction record from database to API format
	 */
	static transformTransaction(dbTransaction: any): any {
		return {
			...this.transformDbRecord(dbTransaction),
			id: this.toTransactionId(dbTransaction.id),
			fromWalletId: dbTransaction.fromWalletId ? this.toWalletId(dbTransaction.fromWalletId) : null,
			toWalletId: dbTransaction.toWalletId ? this.toWalletId(dbTransaction.toWalletId) : null,
			userId: this.toUserId(dbTransaction.userId)
		};
	}

	/**
	 * Transform message record from database to API format
	 */
	static transformMessage(dbMessage: any): any {
		return {
			...this.transformDbRecord(dbMessage, ['ipAddress', 'editorState']),
			id: this.toMessageId(dbMessage.id),
			senderId: this.toUserId(dbMessage.senderId),
			recipientId: this.toUserId(dbMessage.recipientId)
		};
	}

	/**
	 * Transform conversation record from database to API format
	 */
	static transformConversation(dbConversation: any): any {
		return {
			...this.transformDbRecord(dbConversation),
			id: dbConversation.id ? this.toConversationId(dbConversation.id) : undefined,
			userId: this.toUserId(dbConversation.userId || dbConversation.user_id),
			lastMessageTime: new Date(dbConversation.lastMessageTime || dbConversation.last_message_time)
		};
	}

	/**
	 * Transform array of records
	 */
	static transformArray<T>(records: any[], transformer: (record: any) => T): T[] {
		return records.map(transformer);
	}

	/**
	 * Transform paginated response
	 */
	static transformPaginated<T>(
		response: { data: any[]; meta: any },
		transformer: (record: any) => T
	): { data: T[]; meta: any } {
		return {
			data: this.transformArray(response.data, transformer),
			meta: response.meta
		};
	}

	/**
	 * Validate transformed data
	 */
	static validateTransformation<T>(
		original: any,
		transformed: T,
		requiredFields: string[]
	): boolean {
		for (const field of requiredFields) {
			if (!(field in transformed)) {
				logger.warn(`Missing required field in transformation: ${field}`);
				return false;
			}
		}
		return true;
	}
}

// Convenience export
export const transform = TypeTransformer;
