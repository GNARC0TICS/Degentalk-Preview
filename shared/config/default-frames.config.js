/**
 * Default avatar frames available in the shop
 * These are always available and serve as the base collection
 */
export const defaultFrames = [
    {
        id: 'default-bronze',
        name: 'Bronze Frame',
        imageUrl: '/assets/frames/bronze-frame.svg',
        rarity: 'common',
        animated: false,
        price: 100,
        isDefault: true,
        description: 'A classic bronze frame for beginners'
    },
    {
        id: 'default-silver',
        name: 'Silver Frame',
        imageUrl: '/assets/frames/silver-frame.svg',
        rarity: 'common',
        animated: false,
        price: 250,
        isDefault: true,
        description: 'A sleek silver frame'
    },
    {
        id: 'default-gold',
        name: 'Gold Frame',
        imageUrl: '/assets/frames/gold-frame.svg',
        rarity: 'rare',
        animated: false,
        price: 500,
        isDefault: true,
        description: 'A prestigious gold frame'
    },
    {
        id: 'default-electric-blue',
        name: 'Electric Blue',
        imageUrl: '/assets/frames/electric-blue-frame.svg',
        rarity: 'rare',
        animated: false,
        price: 750,
        isDefault: true,
        description: 'An energetic electric blue frame'
    },
    {
        id: 'default-cyber-circuit',
        name: 'Cyber Circuit',
        imageUrl: '/assets/frames/cyber-circuit-frame.svg',
        rarity: 'epic',
        animated: false,
        price: 1500,
        isDefault: true,
        description: 'A futuristic cyber circuit frame'
    },
    {
        id: 'default-diamond-crown',
        name: 'Diamond Crown',
        imageUrl: '/assets/frames/diamond-crown-frame.svg',
        rarity: 'epic',
        animated: false,
        price: 2500,
        isDefault: true,
        description: 'A luxurious diamond crown frame'
    },
    {
        id: 'default-og-beta',
        name: 'OG Beta',
        imageUrl: '/assets/frames/og-beta-frame.svg',
        rarity: 'legendary',
        animated: false,
        price: 10000,
        isDefault: true,
        description: 'Exclusive frame for OG beta testers'
    }
];
/**
 * Get a default frame by ID
 */
export function getDefaultFrameById(id) {
    return defaultFrames.find(frame => frame.id === id);
}
/**
 * Check if a frame ID is a default frame
 */
export function isDefaultFrame(id) {
    return defaultFrames.some(frame => frame.id === id);
}
/**
 * Get all default frame IDs
 */
export function getDefaultFrameIds() {
    return defaultFrames.map(frame => frame.id);
}
