import { cosmeticsConfig } from '@/config/cosmetics.config';

// Types for user data
interface UserUnlockData {
    unlockedEmojis?: string[];
    unlockedStickers?: string[];
    level?: number;
    xp?: number;
    pathXp?: Record<string, number>;
}

/**
 * Central helper function to check if a user has unlocked a specific emoji or sticker.
 * 
 * This function is the single source of truth for unlock checks and should be used
 * everywhere in the codebase instead of duplicating unlock logic.
 * 
 * @param userId - The user ID (for future database lookups)
 * @param itemId - The emoji or sticker ID from config
 * @param type - Whether checking for 'emoji' or 'sticker'
 * @param userData - User's unlock data (emojis, stickers, level, xp, etc.)
 * @returns boolean indicating if the item is unlocked
 */
export function hasUnlockedItem(
    userId: number,
    itemId: string,
    type: 'emoji' | 'sticker',
    userData: UserUnlockData
): boolean {
    // Get the item definition from config
    const item = type === 'emoji'
        ? cosmeticsConfig.emojis[itemId]
        : cosmeticsConfig.stickers[itemId];

    if (!item) {
        console.warn(`${type} with ID "${itemId}" not found in config`);
        return false;
    }

    // If item is not locked, it's available to everyone
    if (!item.isLocked) {
        return true;
    }

    // Check if user has already unlocked this item
    const unlockedItems = type === 'emoji'
        ? userData.unlockedEmojis || []
        : userData.unlockedStickers || [];

    if (unlockedItems.includes(itemId)) {
        return true;
    }

    // Check unlock conditions based on unlock type
    switch (item.unlockType) {
        case 'free':
            return true;

        case 'shop':
            // Shop items require explicit unlock (already checked above)
            return false;

        case 'xp':
            // XP-based unlocks check against user's total XP or path XP
            if (typeof item.unlockValue === 'number') {
                const userXp = userData.xp || 0;
                return userXp >= item.unlockValue;
            }
            return false;

        case 'level':
            // Level-based unlocks
            if (typeof item.unlockValue === 'number') {
                const userLevel = userData.level || 1;
                return userLevel >= item.unlockValue;
            }
            return false;

        case 'event':
            // Event items require explicit unlock
            return false;

        default:
            console.warn(`Unknown unlock type: ${item.unlockType} for ${type} ${itemId}`);
            return false;
    }
}

/**
 * Batch check multiple items for unlock status
 */
export function checkMultipleUnlocks(
    userId: number,
    items: Array<{ id: string; type: 'emoji' | 'sticker' }>,
    userData: UserUnlockData
): Record<string, boolean> {
    const results: Record<string, boolean> = {};

    for (const { id, type } of items) {
        results[id] = hasUnlockedItem(userId, id, type, userData);
    }

    return results;
}

/**
 * Get all unlocked items of a specific type for a user
 */
export function getUnlockedItems(
    userId: number,
    type: 'emoji' | 'sticker',
    userData: UserUnlockData
): string[] {
    const allItems = type === 'emoji'
        ? Object.keys(cosmeticsConfig.emojis)
        : Object.keys(cosmeticsConfig.stickers);

    return allItems.filter(itemId =>
        hasUnlockedItem(userId, itemId, type, userData)
    );
}

/**
 * Get unlock requirements for a locked item
 */
export function getUnlockRequirement(
    itemId: string,
    type: 'emoji' | 'sticker'
): string | null {
    const item = type === 'emoji'
        ? cosmeticsConfig.emojis[itemId]
        : cosmeticsConfig.stickers[itemId];

    if (!item || !item.isLocked) {
        return null;
    }

    switch (item.unlockType) {
        case 'free':
            return 'Free for all users';

        case 'shop':
            return `Purchase in shop for ${item.unlockValue || 'N/A'} DGT`;

        case 'xp':
            return `Reach ${item.unlockValue || 'N/A'} XP`;

        case 'level':
            return `Reach level ${item.unlockValue || 'N/A'}`;

        case 'event':
            return 'Available during special events';

        default:
            return 'Unknown unlock requirement';
    }
}

/**
 * Filter items by unlock status
 */
export function filterItemsByUnlockStatus(
    userId: number,
    type: 'emoji' | 'sticker',
    userData: UserUnlockData,
    showLocked: boolean = false
): string[] {
    const allItems = type === 'emoji'
        ? Object.keys(cosmeticsConfig.emojis)
        : Object.keys(cosmeticsConfig.stickers);

    return allItems.filter(itemId => {
        const isUnlocked = hasUnlockedItem(userId, itemId, type, userData);
        return showLocked ? !isUnlocked : isUnlocked;
    });
}

/**
 * Unlock an item for a user (for shop purchases, admin grants, etc.)
 * This would typically be called from server-side code
 */
export function unlockItem(
    itemId: string,
    type: 'emoji' | 'sticker',
    userData: UserUnlockData
): UserUnlockData {
    const updatedData = { ...userData };

    if (type === 'emoji') {
        const unlockedEmojis = updatedData.unlockedEmojis || [];
        if (!unlockedEmojis.includes(itemId)) {
            updatedData.unlockedEmojis = [...unlockedEmojis, itemId];
        }
    } else {
        const unlockedStickers = updatedData.unlockedStickers || [];
        if (!unlockedStickers.includes(itemId)) {
            updatedData.unlockedStickers = [...unlockedStickers, itemId];
        }
    }

    return updatedData;
}

/**
 * Check if user can afford a shop item
 */
export function canAffordShopItem(
    itemId: string,
    type: 'emoji' | 'sticker',
    userDgtBalance: number
): boolean {
    const item = type === 'emoji'
        ? cosmeticsConfig.emojis[itemId]
        : cosmeticsConfig.stickers[itemId];

    if (!item || item.unlockType !== 'shop') {
        return false;
    }

    const price = typeof item.unlockValue === 'number' ? item.unlockValue : 0;
    return userDgtBalance >= price;
} 