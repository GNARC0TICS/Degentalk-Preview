/**
 * Title Utilities
 * Shared utilities for title validation, CSS generation, and business logic
 */
import type { Title } from '../types/entities/title.types.js';
/**
 * Validates if a title meets its unlock requirements for a user
 */
export declare function validateTitleUnlock(title: Title, userLevel: number, userRoleIds: number[], userAchievements: string[]): {
    canUnlock: boolean;
    reason?: string;
};
/**
 * Gets the display priority for title sorting
 */
export declare function getTitlePriority(title: Title): number;
/**
 * Generates CSS styles for a title
 */
export declare function generateTitleStyles(title: Title): Record<string, string>;
/**
 * Gets CSS classes for a title based on rarity and effects
 */
export declare function getTitleClasses(title: Title): string;
/**
 * Gets the rarity color for a title
 */
export declare function getRarityColor(rarity: string): string;
/**
 * Formats a title for display
 */
export declare function formatTitleDisplay(title: Title): string;
/**
 * Checks if a title can be purchased
 */
export declare function canPurchaseTitle(title: Title, userCurrency: Record<string, number>): boolean;
/**
 * Migration helper: Converts legacy title format to new format
 */
export declare function migrateLegacyTitle(legacyTitle: any): Partial<Title>;
