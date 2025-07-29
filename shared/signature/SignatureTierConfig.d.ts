/**
 * Signature Tier Configuration
 *
 * This file defines the capabilities and limits for signatures based on user level.
 * It is used by both the frontend and backend to consistently enforce signature rules.
 */
export interface SignatureTierLevel {
    level: number;
    maxChars: number;
    canUseBBCode: boolean;
    canUseEmoji: boolean;
    canUseImages: boolean;
    canUseColors: boolean;
    canUseGifs: boolean;
    canUseCustomCSS?: boolean;
    imageLimit?: number;
    gifLimit?: number;
    description: string;
}
/**
 * Core signature tier configuration
 * Each tier level inherits all capabilities from lower tiers
 */
export declare const SignatureTierConfig: SignatureTierLevel[];
/**
 * Get the signature tier for a given user level
 * This function ensures all capabilities from lower levels are inherited
 */
export declare function getSignatureTierForLevel(userLevel: number): SignatureTierLevel;
