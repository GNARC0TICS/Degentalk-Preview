import { db } from '@db';
import { userEmojiPacks } from '@schema';
import { eq, and } from 'drizzle-orm';
import { EntityId } from '@shared/types';

interface UnlockEmojiPackParams {
	userId: UserId;
	emojiPackId: EntityId;
	unlockType: 'shop' | 'admin' | 'xp_reward';
	pricePaid?: number;
}

/**
 * Unlocks an emoji pack for a user. If the user already owns the pack,
 * the function returns `{ success: true, alreadyUnlocked: true }`.
 */
export async function unlockEmojiPackForUser({
	userId,
	emojiPackId,
	unlockType,
	pricePaid
}: UnlockEmojiPackParams): Promise<{ success: boolean; alreadyUnlocked?: boolean }> {
	// Check if user already owns the pack
	const existing = await db
		.select({ id: userEmojiPacks.id })
		.from(userEmojiPacks)
		.where(and(eq(userEmojiPacks.userId, userId), eq(userEmojiPacks.emojiPackId, emojiPackId)))
		.limit(1);

	if (existing.length > 0) {
		return { success: true, alreadyUnlocked: true };
	}

	// Insert new ownership row
	await db.insert(userEmojiPacks).values({
		userId,
		emojiPackId,
		unlockType,
		pricePaid
	});

	return { success: true };
}
