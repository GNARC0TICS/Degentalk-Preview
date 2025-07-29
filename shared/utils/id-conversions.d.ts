/**
 * Type-safe ID conversion utilities
 *
 * These functions provide safe conversions between different branded ID types
 * while maintaining type safety and runtime validation
 */
import type { PostId, ThreadId, ContentId, Id, DictionaryEntryId, EntryId } from '../types/ids.js';
/**
 * Convert PostId to ContentId for reporting/moderation APIs
 * @throws {Error} If the PostId is invalid
 */
export declare function postIdToContentId(postId: PostId): ContentId;
/**
 * Convert ThreadId to ContentId for reporting/moderation APIs
 */
export declare function threadIdToContentId(threadId: ThreadId): ContentId;
/**
 * Generic content ID converter with validation
 */
export declare function toContentId<T extends string>(id: Id<T>, sourceType: 'post' | 'thread' | 'message'): ContentId;
/**
 * Type guard to check if an ID can be used as ContentId
 */
export declare function isContentId(id: unknown): id is ContentId;
/**
 * Convert DictionaryEntryId to EntryId
 * Used when DictionaryEntryId needs to be passed to generic entry APIs
 */
export declare function dictionaryEntryIdToEntryId(dictionaryEntryId: DictionaryEntryId): EntryId;
//# sourceMappingURL=id-conversions.d.ts.map