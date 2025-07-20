/**
 * Signature Tier Configuration
 *
 * This file defines the capabilities and limits for signatures based on user level.
 * It is used by both the frontend and backend to consistently enforce signature rules.
 */
/**
 * Core signature tier configuration
 * Each tier level inherits all capabilities from lower tiers
 */
export const SignatureTierConfig = [
    {
        level: 1,
        maxChars: 100,
        canUseBBCode: true,
        canUseEmoji: false,
        canUseImages: false,
        canUseColors: false,
        canUseGifs: false,
        description: 'Basic text signature'
    },
    {
        level: 5,
        maxChars: 150,
        canUseBBCode: true,
        canUseEmoji: true,
        canUseImages: false,
        canUseColors: true,
        canUseGifs: false,
        description: 'Colored text with emojis'
    },
    {
        level: 10,
        maxChars: 200,
        canUseBBCode: true,
        canUseEmoji: true,
        canUseImages: true,
        canUseColors: true,
        canUseGifs: false,
        imageLimit: 1,
        description: 'Add a single image to your signature'
    },
    {
        level: 15,
        maxChars: 250,
        canUseBBCode: true,
        canUseEmoji: true,
        canUseImages: true,
        canUseColors: true,
        canUseGifs: true,
        imageLimit: 1,
        gifLimit: 1,
        description: 'Animated GIF support'
    },
    {
        level: 20,
        maxChars: 300,
        canUseBBCode: true,
        canUseEmoji: true,
        canUseImages: true,
        canUseColors: true,
        canUseGifs: true,
        canUseCustomCSS: true,
        imageLimit: 2,
        gifLimit: 1,
        description: 'Custom styling with 2 images'
    }
];
/**
 * Get the signature tier for a given user level
 * This function ensures all capabilities from lower levels are inherited
 */
export function getSignatureTierForLevel(userLevel) {
    // Find the highest tier that the user qualifies for
    const qualifyingTiers = SignatureTierConfig.filter((tier) => tier.level <= userLevel);
    if (qualifyingTiers.length === 0) {
        return SignatureTierConfig[0]; // Default to first tier if no qualifying tier found
    }
    // Get the highest qualifying tier
    const highestTier = qualifyingTiers[qualifyingTiers.length - 1];
    return highestTier;
}
