import type { FrameId } from '../types/ids.js';
export interface DefaultFrame {
    id: FrameId;
    name: string;
    imageUrl: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    animated: boolean;
    price: number;
    isDefault: true;
    description?: string;
}
/**
 * Default avatar frames available in the shop
 * These are always available and serve as the base collection
 */
export declare const defaultFrames: DefaultFrame[];
/**
 * Get a default frame by ID
 */
export declare function getDefaultFrameById(id: FrameId): DefaultFrame | undefined;
/**
 * Check if a frame ID is a default frame
 */
export declare function isDefaultFrame(id: FrameId): boolean;
/**
 * Get all default frame IDs
 */
export declare function getDefaultFrameIds(): FrameId[];
