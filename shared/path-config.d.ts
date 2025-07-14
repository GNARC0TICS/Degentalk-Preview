import type { CategoryId } from '@shared/types/ids';
/**
 * Degentalk Dynamic Path System Configuration
 *
 * This file defines the mappings between forum categories and user identity paths.
 * When users interact with content in specific categories, they gain XP in the
 * corresponding path, forming their dynamic identity on the platform.
 */
export interface PathDefinition {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
}
export declare const availablePaths: Record<string, PathDefinition>;
export declare const categoryPathMappings: Record<number, string>;
export declare const xpRewards: {
    newThread: number;
    newPost: number;
    receivedLike: number;
    receivedReaction: number;
    generalXpPerAction: number;
    multiplierThreshold: number;
};
/**
 * Gets the path ID associated with a category
 * @param categoryId The forum category ID
 * @returns The path ID or undefined if no mapping exists
 */
export declare function getPathForCategory(categoryId: CategoryId): string | undefined;
/**
 * Gets the path definition from a path ID
 * @param pathId The path identifier
 * @returns The path definition or undefined if not found
 */
export declare function getPathDefinition(pathId: string): PathDefinition | undefined;
/**
 * Gets the user's dominant path (highest XP)
 * @param paths The user's path XP object
 * @returns The dominant path ID or undefined if no paths
 */
export declare function getDominantPath(paths: Record<string, number> | undefined): string | undefined;
