import { db } from '@db';
import { userEmojiPacks } from '@schema';
import { eq, and } from 'drizzle-orm';
import { logger, LogAction } from '@core/logger';
import type { EmojiPackId, UserId } from '@shared/types/ids';
import { reportErrorServer } from '@server/lib/report-error';

interface UnlockEmojiPackParams {
	userId: UserId;
	emojiPackId: EmojiPackId;
	unlockType: 'shop' | 'admin' | 'xp_reward';
	pricePaid?: string;
}

export interface UnlockEmojiPackResult {
	success: boolean;
	alreadyUnlocked?: boolean;
}

/**
 * Server-side service for emoji pack unlocking operations
 */
export class EmojiPackUnlockService {
	/**
	 * Unlocks an emoji pack for a user. If the user already owns the pack,
	 * returns { success: true, alreadyUnlocked: true }.
	 */
	static async unlockEmojiPackForUser({
		userId,
		emojiPackId,
		unlockType,
		pricePaid
	}: UnlockEmojiPackParams): Promise<UnlockEmojiPackResult> {
		try {
			logger.info('EMOJI_PACK_UNLOCK', 'Unlocking emoji pack', {
				userId,
				emojiPackId,
				unlockType
			});

			// Check if user already owns the pack
			const existing = await db
				.select({ id: userEmojiPacks.id })
				.from(userEmojiPacks)
				.where(and(eq(userEmojiPacks.userId, userId), eq(userEmojiPacks.emojiPackId, emojiPackId)))
				.limit(1);

			if (existing.length > 0) {
				logger.info('EMOJI_PACK_UNLOCK', 'User already owns emoji pack', {
					userId,
					emojiPackId
				});
				return { success: true, alreadyUnlocked: true };
			}

			// Insert new ownership row
			await db.insert(userEmojiPacks).values({
				userId,
				emojiPackId,
				unlockType,
				pricePaid
			});

			logger.info('EMOJI_PACK_UNLOCK', 'Successfully unlocked emoji pack', {
				userId,
				emojiPackId,
				unlockType
			});

			return { success: true };
		} catch (error) {
			await reportErrorServer(error, {
				service: 'EmojiPackUnlockService',
				operation: 'unlockEmojiPackForUser',
				action: LogAction.FAILURE,
				data: { userId, emojiPackId, unlockType }
			});
			return { success: false };
		}
	}

	/**
	 * Check if a user owns a specific emoji pack
	 */
	static async checkUserOwnsEmojiPack(userId: UserId, emojiPackId: EmojiPackId): Promise<boolean> {
		try {
			const existing = await db
				.select({ id: userEmojiPacks.id })
				.from(userEmojiPacks)
				.where(and(eq(userEmojiPacks.userId, userId), eq(userEmojiPacks.emojiPackId, emojiPackId)))
				.limit(1);

			return existing.length > 0;
		} catch (error) {
			await reportErrorServer(error, {
				service: 'EmojiPackUnlockService',
				operation: 'checkUserOwnsEmojiPack',
				action: LogAction.FAILURE,
				data: { userId, emojiPackId }
			});
			return false;
		}
	}

	/**
	 * Get all emoji packs owned by a user
	 */
	static async getUserEmojiPacks(userId: UserId) {
		try {
			const ownedPacks = await db
				.select({
					id: userEmojiPacks.id,
					emojiPackId: userEmojiPacks.emojiPackId,
					unlockType: userEmojiPacks.unlockType,
					pricePaid: userEmojiPacks.pricePaid,
					unlockedAt: userEmojiPacks.createdAt
				})
				.from(userEmojiPacks)
				.where(eq(userEmojiPacks.userId, userId));

			return ownedPacks;
		} catch (error) {
			await reportErrorServer(error, {
				service: 'EmojiPackUnlockService',
				operation: 'getUserEmojiPacks',
				action: LogAction.FAILURE,
				data: { userId }
			});
			return [];
		}
	}
}