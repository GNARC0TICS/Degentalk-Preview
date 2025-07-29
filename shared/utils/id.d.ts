/**
 * UUID ID Utilities for UUID Migration
 *
 * Provides type-safe ID conversion and validation utilities for the migration
 * from numeric IDs to UUID-based branded types.
 */
import type { Id, UserId, ThreadId, PostId, ForumId, StructureId, TransactionId, WalletId, ItemId, FrameId, BadgeId, TitleId, TagId, MissionId, AchievementId, ProductId, PathId, AdminId, ReportId, ConversationId, RoomId, LevelId, EntityId } from '../types/ids.js';
/**
 * Validates if a string is a valid UUID format
 */
export declare function isValidId(value: unknown): value is string;
/**
 * Type-safe ID constructor that ensures proper branding
 */
export declare function toId<T extends string>(value: string): Id<T>;
/**
 * Strict UUID validation (throws on invalid)
 */
export declare function validateUuid(value: unknown): string;
/**
 * Safe ID parsing that returns null on failure
 */
export declare function parseId<T extends string>(value: unknown): Id<T> | null;
/**
 * Generic helper to create a branded ID validator
 */
export declare const createIdValidator: <T extends string>() => (id: unknown) => id is Id<T>;
export declare const isUserId: (id: unknown) => id is Id<"UserId">;
export declare const isThreadId: (id: unknown) => id is Id<"ThreadId">;
export declare const isPostId: (id: unknown) => id is Id<"PostId">;
export declare const isWalletId: (id: unknown) => id is Id<"WalletId">;
export declare const isTransactionId: (id: unknown) => id is Id<"TransactionId">;
export declare const isForumId: (id: unknown) => id is Id<"ForumId">;
export declare const isItemId: (id: unknown) => id is Id<"ItemId">;
export declare const isFrameId: (id: unknown) => id is Id<"FrameId">;
export declare const isBadgeId: (id: unknown) => id is Id<"BadgeId">;
export declare const isTitleId: (id: unknown) => id is Id<"TitleId">;
/**
 * Generate a new UUID v4
 */
export declare function generateId<T extends string>(): Id<T>;
/**
 * Check if two IDs are equal (type-safe comparison)
 */
export declare function idsEqual<T extends string>(a: Id<T> | null | undefined, b: Id<T> | null | undefined): boolean;
/**
 * Filter out null/undefined IDs from an array
 */
export declare function filterValidIds<T extends string>(ids: (Id<T> | null | undefined)[]): Id<T>[];
/**
 * Convert route parameter to typed ID
 * Replaces parseInt() patterns for ID parameters
 */
export declare function parseIdParam<T extends string>(param: string | undefined): Id<T> | null;
/**
 * Validate and assert ID is valid UUID
 * Throws error for better debugging
 */
export declare function assertValidId(id: string | undefined, paramName?: string): asserts id is string;
/**
 * Legacy support for numeric validation during migration
 * Use this for entities that haven't been migrated to UUIDs yet
 */
export declare function isValidNumericId(id: string | number | undefined | null): boolean;
/**
 * Convert route parameter to entity ID (supports both numeric and UUID)
 * For gradual migration scenarios
 */
export declare function parseEntityIdParam(param: string | undefined): string | number | null;
/**
 * Specific ID creation helpers for common types
 * These bypass validation for mock data and tests
 */
export declare const toUserId: (id: string) => UserId;
export declare const toThreadId: (id: string) => ThreadId;
export declare const toPostId: (id: string) => PostId;
export declare const toForumId: (id: string) => ForumId;
export declare const toStructureId: (id: string) => StructureId;
export declare const toTransactionId: (id: string) => TransactionId;
export declare const toWalletId: (id: string) => WalletId;
export declare const toItemId: (id: string) => ItemId;
export declare const toFrameId: (id: string) => FrameId;
export declare const toBadgeId: (id: string) => BadgeId;
export declare const toTitleId: (id: string) => TitleId;
export declare const toTagId: (id: string) => TagId;
export declare const toMissionId: (id: string) => MissionId;
export declare const toAchievementId: (id: string) => AchievementId;
export declare const toProductId: (id: string) => ProductId;
export declare const toPathId: (id: string) => PathId;
export declare const toAdminId: (id: string) => AdminId;
export declare const toReportId: (id: string) => ReportId;
export declare const toConversationId: (id: string) => ConversationId;
export declare const toRoomId: (id: string) => RoomId;
export declare const toLevelId: (id: string) => LevelId;
export declare const toEntityId: (id: string) => EntityId;
