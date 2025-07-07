import { db } from '@server/src/lib/db';
import { userEmojiPacks } from '@schema';
import { eq, and } from 'drizzle-orm';
import type { EmojiPackId, PackId, UserId } from '@shared/types/ids';

interface UnlockEmojiPackParams {
	userId: UserId;
	emojiPackId: EmojiPackId;
	unlockType: 'shop' | 'admin' | 'xp_reward';
	pricePaid?: Id<'pricePaid'>;
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
