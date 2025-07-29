/**
 * Shop Items Configuration
 * Central configuration for all default shop items that are always available
 * Following the config-first architecture pattern
 */
/**
 * Default shop items that are always available
 * These items populate the shop UI and are seeded into the database
 */
export const defaultShopItems = [
    // 🟦 Username Colors
    {
        id: 'cool-blue-name',
        name: 'Cool Blue',
        price: 25,
        type: 'usernameColor',
        rarity: 'common',
        hex: '#4da6ff',
        description: 'A refreshing cool blue color for your username',
        isAlwaysAvailable: true
    },
    {
        id: 'dusty-rose-name',
        name: 'Dusty Rose',
        price: 25,
        type: 'usernameColor',
        rarity: 'common',
        hex: '#cc6699',
        description: 'An elegant dusty rose color for your username',
        isAlwaysAvailable: true
    },
    // 🖼️ Avatar Frames
    {
        id: 'frame-midnight',
        name: 'Midnight Frame',
        price: 40,
        type: 'avatarFrame',
        rarity: 'common',
        cssClass: 'frame-midnight',
        description: 'A sleek midnight-themed frame for your avatar',
        isAlwaysAvailable: true
    },
    {
        id: 'frame-gold-liner',
        name: 'Gold Liner',
        price: 50,
        type: 'avatarFrame',
        rarity: 'common',
        cssClass: 'frame-gold',
        description: 'A prestigious gold-lined frame for your avatar',
        isAlwaysAvailable: true
    },
    // 🧢 User Titles
    {
        id: 'title-veteran',
        name: 'Veteran',
        price: 20,
        type: 'userTitle',
        rarity: 'common',
        titleText: 'Forum Veteran',
        description: 'Show your experience with the Forum Veteran title',
        isAlwaysAvailable: true
    },
    {
        id: 'title-lurker',
        name: 'Lurker',
        price: 15,
        type: 'userTitle',
        rarity: 'common',
        titleText: 'Professional Lurker',
        description: 'Embrace the shadows with the Professional Lurker title',
        isAlwaysAvailable: true
    }
];
/**
 * Shop categories for organizing items
 */
export const shopCategories = {
    cosmetics: {
        id: 'cosmetics',
        name: 'Cosmetics',
        description: 'Customize your appearance',
        subcategories: {
            usernameColors: {
                id: 'username-colors',
                name: 'Username Colors',
                type: 'usernameColor'
            },
            avatarFrames: {
                id: 'avatar-frames',
                name: 'Avatar Frames',
                type: 'avatarFrame'
            },
            userTitles: {
                id: 'user-titles',
                name: 'User Titles',
                type: 'userTitle'
            }
        }
    }
};
/**
 * Helper function to get items by type
 */
export function getItemsByType(type) {
    return defaultShopItems.filter((item) => item.type === type);
}
/**
 * Helper function to get item by ID
 */
export function getItemById(id) {
    return defaultShopItems.find((item) => item.id === id);
}
/**
 * Type guards for item types
 */
export function isUsernameColorItem(item) {
    return item.type === 'usernameColor';
}
export function isAvatarFrameItem(item) {
    return item.type === 'avatarFrame';
}
export function isUserTitleItem(item) {
    return item.type === 'userTitle';
}
