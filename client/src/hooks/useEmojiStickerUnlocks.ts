import { useMemo } from 'react';
import { hasUnlockedItem, getUnlockedItems, filterItemsByUnlockStatus, getUnlockRequirement, canAffordShopItem } from '@/lib/unlockHelper';
import { useAuth } from '@/hooks/use-auth';

// Type for user data from auth context or props
interface UserData {
    id: number;
    unlockedEmojis?: string[];
    unlockedStickers?: string[];
    equippedFlairEmoji?: string;
    level?: number;
    xp?: number;
    pathXp?: Record<string, number>;
    dgtPoints?: number;
}

/**
 * Hook for checking emoji and sticker unlock status in React components.
 * Provides convenient methods for unlock checks, filtering, and requirements.
 */
export function useEmojiStickerUnlocks(userData?: UserData) {
    const { user: authUser } = useAuth();

    // Use provided userData or fall back to auth user
    const user = userData || authUser;

    // Memoized unlock checker functions
    const unlockHelpers = useMemo(() => {
        if (!user) {
            // Return functions that always return false/empty when no user
            return {
                hasUnlockedEmoji: () => false,
                hasUnlockedSticker: () => false,
                hasUnlockedItem: () => false,
                getUnlockedEmojis: () => [],
                getUnlockedStickers: () => [],
                getLockedEmojis: () => [],
                getLockedStickers: () => [],
                getEmojiUnlockRequirement: () => null,
                getStickerUnlockRequirement: () => null,
                canAffordEmoji: () => false,
                canAffordSticker: () => false,
                userFlairEmoji: undefined,
            };
        }

        const userUnlockData = {
            unlockedEmojis: user.unlockedEmojis || [],
            unlockedStickers: user.unlockedStickers || [],
            level: user.level || 1,
            xp: user.xp || 0,
            pathXp: user.pathXp || {},
        };

        return {
            /**
             * Check if user has unlocked a specific emoji
             */
            hasUnlockedEmoji: (emojiId: string) =>
                hasUnlockedItem(user.id, emojiId, 'emoji', userUnlockData),

            /**
             * Check if user has unlocked a specific sticker
             */
            hasUnlockedSticker: (stickerId: string) =>
                hasUnlockedItem(user.id, stickerId, 'sticker', userUnlockData),

            /**
             * Generic unlock checker
             */
            hasUnlockedItem: (itemId: string, type: 'emoji' | 'sticker') =>
                hasUnlockedItem(user.id, itemId, type, userUnlockData),

            /**
             * Get all unlocked emojis for the user
             */
            getUnlockedEmojis: () =>
                getUnlockedItems(user.id, 'emoji', userUnlockData),

            /**
             * Get all unlocked stickers for the user
             */
            getUnlockedStickers: () =>
                getUnlockedItems(user.id, 'sticker', userUnlockData),

            /**
             * Get all locked emojis for the user
             */
            getLockedEmojis: () =>
                filterItemsByUnlockStatus(user.id, 'emoji', userUnlockData, true),

            /**
             * Get all locked stickers for the user
             */
            getLockedStickers: () =>
                filterItemsByUnlockStatus(user.id, 'sticker', userUnlockData, true),

            /**
             * Get unlock requirement text for an emoji
             */
            getEmojiUnlockRequirement: (emojiId: string) =>
                getUnlockRequirement(emojiId, 'emoji'),

            /**
             * Get unlock requirement text for a sticker
             */
            getStickerUnlockRequirement: (stickerId: string) =>
                getUnlockRequirement(stickerId, 'sticker'),

            /**
             * Check if user can afford to buy an emoji
             */
            canAffordEmoji: (emojiId: string) => {
                const dgtBalance = user.dgtPoints || 0;
                return canAffordShopItem(emojiId, 'emoji', dgtBalance);
            },

            /**
             * Check if user can afford to buy a sticker
             */
            canAffordSticker: (stickerId: string) => {
                const dgtBalance = user.dgtPoints || 0;
                return canAffordShopItem(stickerId, 'sticker', dgtBalance);
            },

            /**
             * Currently equipped flair emoji
             */
            userFlairEmoji: user.equippedFlairEmoji,
        };
    }, [user]);

    return unlockHelpers;
}

/**
 * Hook specifically for emoji unlock checks
 */
export function useEmojiUnlocks(userData?: UserData) {
    const { hasUnlockedEmoji, getUnlockedEmojis, getLockedEmojis, getEmojiUnlockRequirement, canAffordEmoji } =
        useEmojiStickerUnlocks(userData);

    return {
        hasUnlockedEmoji,
        getUnlockedEmojis,
        getLockedEmojis,
        getEmojiUnlockRequirement,
        canAffordEmoji,
    };
}

/**
 * Hook specifically for sticker unlock checks
 */
export function useStickerUnlocks(userData?: UserData) {
    const { hasUnlockedSticker, getUnlockedStickers, getLockedStickers, getStickerUnlockRequirement, canAffordSticker } =
        useEmojiStickerUnlocks(userData);

    return {
        hasUnlockedSticker,
        getUnlockedStickers,
        getLockedStickers,
        getStickerUnlockRequirement,
        canAffordSticker,
    };
}

/**
 * Hook for managing flair emoji
 */
export function useFlairEmoji(userData?: UserData) {
    const { userFlairEmoji, hasUnlockedEmoji } = useEmojiStickerUnlocks(userData);

    return {
        currentFlairEmoji: userFlairEmoji,
        hasFlairEmoji: !!userFlairEmoji,
        canEquipEmoji: (emojiId: string) => hasUnlockedEmoji(emojiId),
    };
} 