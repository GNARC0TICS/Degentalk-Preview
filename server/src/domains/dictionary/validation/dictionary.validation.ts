import { z } from 'zod';
import type { EntryId } from '@shared/types/ids';

/**
 * Validation schemas for dictionary domain matching actual database schema
 */

// Dictionary Entry Creation DTO
export const createDictionaryEntrySchema = z.object({
  word: z.string().min(2, 'Word must be at least 2 characters').max(50, 'Word cannot exceed 50 characters'),
  definition: z.string().min(20, 'Definition must be at least 20 characters').max(5000, 'Definition cannot exceed 5000 characters'),
  usageExample: z.string().optional(),
  tags: z.array(z.string()).max(5, 'Cannot have more than 5 tags').optional(),
  authorId: z.string().uuid('Invalid author ID format')
});

export type CreateDictionaryEntryDTO = z.infer<typeof createDictionaryEntrySchema>;

// Dictionary Entry Update DTO
export const updateDictionaryEntrySchema = z.object({
  word: z.string().min(2, 'Word must be at least 2 characters').max(50, 'Word cannot exceed 50 characters').optional(),
  definition: z.string().min(20, 'Definition must be at least 20 characters').max(5000, 'Definition cannot exceed 5000 characters').optional(),
  usageExample: z.string().optional(),
  tags: z.array(z.string()).max(5, 'Cannot have more than 5 tags').optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  approverId: z.string().uuid().optional(),
  featured: z.boolean().optional(),
  metaDescription: z.string().optional()
});

export type UpdateDictionaryEntryDTO = z.infer<typeof updateDictionaryEntrySchema>;

// Dictionary Search/Filter Parameters
export const dictionarySearchSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'all']).optional(),
  tag: z.string().optional(),
  authorId: z.string().uuid().optional(),
  sort: z.enum(['newest', 'oldest', 'popular', 'alphabetical']).default('newest')
});

export type DictionarySearchParams = z.infer<typeof dictionarySearchSchema>;

// Upvote parameters
export const upvoteEntrySchema = z.object({
  entryId: z.string().uuid('Invalid entry ID format'),
  userId: z.string().uuid('Invalid user ID format')
});

export type UpvoteEntryDTO = z.infer<typeof upvoteEntrySchema>;

// Legacy exports for backward compatibility
export type CreateDictionaryEntryInput = CreateDictionaryEntryDTO;
export type UpdateDictionaryEntryInput = UpdateDictionaryEntryDTO;
export type DictionaryQueryInput = DictionarySearchParams;