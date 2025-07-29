/**
 * XP Actions Registry
 *
 * This module defines all actions that can award XP in the system.
 * These actions are used by the XP service to grant XP to users.
 */
/**
 * Enum of all possible XP-granting actions in the system
 */
export declare enum XP_ACTION {
    POST_CREATED = "post_created",
    THREAD_CREATED = "thread_created",
    RECEIVED_LIKE = "received_like",
    DAILY_LOGIN = "daily_login",
    USER_MENTIONED = "user_mentioned",
    REPLY_RECEIVED = "reply_received",
    PROFILE_COMPLETED = "profile_completed",
    FRAME_EQUIPPED = "frame_equipped",
    TIP_GIVEN = "tip_given",
    TIP_RECEIVED = "tip_received",
    DGT_PURCHASE = "dgt_purchase"
}
/**
 * Configuration for an XP action
 */
export interface XpActionConfig {
    key: XP_ACTION | string;
    baseValue: number;
    description: string;
    maxPerDay?: number;
    cooldownSeconds?: number;
    enabled?: boolean;
}
/**
 * Default XP action configurations
 *
 * These are used as fallbacks if database values aren't available
 * They're also used to seed the database initially
 */
export declare const DEFAULT_XP_ACTIONS: Record<XP_ACTION, XpActionConfig>;
/**
 * Load XP action configurations from the database
 * Includes caching to reduce database queries
 */
export declare function loadXpActionsFromDb(forceRefresh?: boolean): Promise<Record<string, XpActionConfig>>;
/**
 * Get all configured XP actions
 */
export declare function getXpActions(): Promise<Record<string, XpActionConfig>>;
/**
 * Get an XP action configuration
 */
export declare function getXpAction(key: XP_ACTION | string): Promise<XpActionConfig | null>;
/**
 * Get the base XP value for an action
 */
export declare function getXpValueForAction(key: XP_ACTION | string): Promise<number>;
/**
 * Legacy synchronous functions for backward compatibility
 * These will be deprecated in favor of the async versions above
 */
export declare const XP_ACTIONS: Record<XP_ACTION, XpActionConfig>;
export declare function getXpActionSync(key: XP_ACTION): XpActionConfig | null;
export declare function getXpValueForActionSync(key: XP_ACTION): number;
