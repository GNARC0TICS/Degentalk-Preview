/**
 * Type-safe ID conversion utilities
 * 
 * These functions provide safe conversions between different branded ID types
 * while maintaining type safety and runtime validation
 */

import type { PostId, ThreadId, ContentId, UserId, Id, DictionaryEntryId, EntryId } from '../types/ids.js';
import { isValidId } from './id.js';

/**
 * Convert PostId to ContentId for reporting/moderation APIs
 * @throws {Error} If the PostId is invalid
 */
export function postIdToContentId(postId: PostId): ContentId {
  if (!postId) {
    throw new Error('PostId is required but was not provided');
  }
  
  if (!isValidId(postId)) {
    throw new Error(`Invalid PostId format: "${postId}". Expected a valid UUID.`);
  }
  
  // ContentId is a union type that includes PostId
  // This is a safe conversion since PostId is a valid ContentId
  return postId as unknown as ContentId;
}

/**
 * Convert ThreadId to ContentId for reporting/moderation APIs
 */
export function threadIdToContentId(threadId: ThreadId): ContentId {
  if (!isValidId(threadId)) {
    throw new Error(`Invalid ThreadId: ${threadId}`);
  }
  return threadId as unknown as ContentId;
}

/**
 * Generic content ID converter with validation
 */
export function toContentId<T extends string>(
  id: Id<T>,
  sourceType: 'post' | 'thread' | 'message'
): ContentId {
  if (!isValidId(id)) {
    throw new Error(`Invalid ${sourceType} ID: ${id}`);
  }
  
  // Log conversion for debugging
  if (process.env.NODE_ENV === 'development') {
    console.debug(`Converting ${sourceType} ID to ContentId:`, id);
  }
  
  return id as unknown as ContentId;
}

/**
 * Type guard to check if an ID can be used as ContentId
 */
export function isContentId(id: unknown): id is ContentId {
  return typeof id === 'string' && isValidId(id as any);
}

/**
 * Convert DictionaryEntryId to EntryId
 * Used when DictionaryEntryId needs to be passed to generic entry APIs
 */
export function dictionaryEntryIdToEntryId(dictionaryEntryId: DictionaryEntryId): EntryId {
  if (!dictionaryEntryId) {
    throw new Error('DictionaryEntryId is required but was not provided');
  }
  
  if (!isValidId(dictionaryEntryId)) {
    throw new Error(`Invalid DictionaryEntryId format: "${dictionaryEntryId}". Expected a valid UUID.`);
  }
  
  return dictionaryEntryId as unknown as EntryId;
}