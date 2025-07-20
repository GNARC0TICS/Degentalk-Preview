// Type guards
export function isShopItem(value) {
    return (typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        'name' in value &&
        'category' in value &&
        'price' in value);
}
export function isFrame(value) {
    return isShopItem(value) && 'category' in value && value.category === 'frame';
}
export function isBadge(value) {
    return isShopItem(value) && 'category' in value && value.category === 'badge';
}
export function isTitle(value) {
    return isShopItem(value) && 'category' in value && value.category === 'title';
}
export function isItemBundle(value) {
    return (typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        'name' in value &&
        'items' in value &&
        'price' in value &&
        'discount' in value &&
        'savings' in value &&
        Array.isArray(value.items) &&
        typeof value.price === 'number');
}
export function isUserCosmetics(value) {
    return (typeof value === 'object' &&
        value !== null &&
        'userId' in value &&
        'inventory' in value &&
        'favorites' in value &&
        'equipped' in value &&
        Array.isArray(value.activeBadges) &&
        Array.isArray(value.favorites));
}
// Constants
export const RARITY_COLORS = {
    common: {
        color: '#64748b',
        backgroundColor: '#f1f5f9',
        dropRate: 0.6,
        priceMultiplier: 1.0
    },
    rare: {
        color: '#2563eb',
        backgroundColor: '#dbeafe',
        dropRate: 0.25,
        priceMultiplier: 2.5
    },
    epic: {
        color: '#9333ea',
        backgroundColor: '#ede9fe',
        dropRate: 0.1,
        priceMultiplier: 5.0
    },
    legendary: {
        color: '#f59e0b',
        backgroundColor: '#fef3c7',
        dropRate: 0.04,
        priceMultiplier: 10.0
    },
    mythic: {
        color: '#dc2626',
        backgroundColor: '#fee2e2',
        dropRate: 0.01,
        priceMultiplier: 25.0
    }
};
