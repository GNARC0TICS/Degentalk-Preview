/**
 * Forum Configuration Service
 *
 * QUALITY IMPROVEMENT: Extracted from forum.service.ts god object
 * Handles forum configuration parsing, validation, and zone type determination
 */
import { type Forum as ConfigForum, type RootForum as ConfigZone } from '@config/forumMap';
import type { StructureId } from '@shared/types/ids';
export interface ForumConfigEntry {
    forum: ConfigForum;
    zone: ConfigZone;
}
export declare class ConfigService {
    /**
     * Parse zone type from pluginData with proper validation
     */
    parseZoneType(pluginData: unknown): 'primary' | 'general';
    /**
     * Get forum configuration by slug from forumMap
     */
    getForumBySlug(slug: string): ForumConfigEntry | null;
    /**
     * Validate forum slug and ensure it's a leaf forum (no sub-forums)
     */
    ensureValidLeafForum(slug: string): ConfigForum;
    /**
     * Map config forum to ForumCategoryWithStats structure
     */
    mapConfigForumToCategory(forum: ConfigForum, zone: ConfigZone, parentId?: StructureId | null): ForumCategoryWithStats;
    /**
     * Process plugin data to extract zone features
     */
    processZoneFeatures(pluginData: unknown): {
        features: string[];
        customComponents: string[];
        staffOnly: boolean;
        isPrimary: boolean;
    };
}
export declare const configService: ConfigService;
