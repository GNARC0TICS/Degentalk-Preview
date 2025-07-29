import type { EmojiPackId, UserId } from '../../types/ids.js';
export interface UnlockEmojiPackParams {
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
 * Frontend-safe interface for emoji pack unlocking operations.
 * Server implementations should be in server/src/domains/shop/services/emoji-pack-unlock.service.ts
 */
export interface EmojiPackUnlockInterface {
    unlockEmojiPackForUser(params: UnlockEmojiPackParams): Promise<UnlockEmojiPackResult>;
    checkUserOwnsEmojiPack(userId: UserId, emojiPackId: EmojiPackId): Promise<boolean>;
    getUserEmojiPacks(userId: UserId): Promise<Array<{
        id: string;
        emojiPackId: EmojiPackId;
        unlockType: 'shop' | 'admin' | 'xp_reward';
        pricePaid?: string | null;
        unlockedAt: Date;
    }>>;
}
//# sourceMappingURL=types.d.ts.map