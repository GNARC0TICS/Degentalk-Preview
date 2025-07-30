import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DictionaryRepository } from '../repositories/dictionary.repository';
import { AlreadyUpvotedError, UpvoteNotFoundError, EntryNotFoundError } from '../errors/dictionary.errors';
import type { CreateDictionaryEntryDTO } from '../validation/dictionary.validation';
import { toUserId, toEntryId } from '@shared/utils/id';

describe('DictionaryRepository Integration Tests', () => {
  let repository: DictionaryRepository;
  let testEntryId: string;
  const testUserId = toUserId('550e8400-e29b-41d4-a716-446655440000');
  const testUserId2 = toUserId('550e8400-e29b-41d4-a716-446655440001');

  beforeEach(async () => {
    repository = new DictionaryRepository();
    
    // Create a test entry
    const testData: CreateDictionaryEntryDTO = {
      word: 'Test Word',
      definition: 'This is a test definition that is long enough to pass validation requirements.',
      usageExample: 'This is how you use the test word.',
      tags: ['test', 'example'],
      authorId: testUserId
    };
    
    const created = await repository.create(testData);
    testEntryId = created.id;
  });

  afterEach(async () => {
    // Cleanup: delete test entry if it exists
    try {
      await repository.delete(toEntryId(testEntryId));
    } catch (error) {
      // Ignore if already deleted
    }
  });

  describe('CRUD Operations', () => {
    it('should create a dictionary entry successfully', async () => {
      const testData: CreateDictionaryEntryDTO = {
        word: 'Another Test',
        definition: 'Another test definition that meets the minimum length requirements for validation.',
        authorId: testUserId
      };

      const created = await repository.create(testData);
      
      expect(created).toBeDefined();
      expect(created.word).toBe(testData.word);
      expect(created.definition).toBe(testData.definition);
      expect(created.authorId).toBe(testData.authorId);
      expect(created.upvoteCount).toBe(0);
      expect(created.viewCount).toBe(0);
      
      // Cleanup
      await repository.delete(toEntryId(created.id));
    });

    it('should find entry by ID', async () => {
      const found = await repository.findById(testEntryId);
      
      expect(found).toBeDefined();
      expect(found?.entry.id).toBe(testEntryId);
      expect(found?.entry.word).toBe('Test Word');
    });

    it('should update entry successfully', async () => {
      const updateData = {
        definition: 'This is an updated definition that also meets the minimum length requirements.'
      };

      const updated = await repository.update(toEntryId(testEntryId), updateData);
      
      expect(updated.definition).toBe(updateData.definition);
      expect(updated.updatedAt).toBeDefined();
    });

    it('should throw EntryNotFoundError when updating non-existent entry', async () => {
      const fakeId = toEntryId('550e8400-e29b-41d4-a716-446655440999');
      
      await expect(
        repository.update(fakeId, { word: 'Updated' })
      ).rejects.toThrow(EntryNotFoundError);
    });

    it('should delete entry successfully', async () => {
      // Create a temporary entry for deletion test
      const tempData: CreateDictionaryEntryDTO = {
        word: 'Temp Entry',
        definition: 'Temporary entry for deletion test that meets minimum length requirements.',
        authorId: testUserId
      };
      
      const created = await repository.create(tempData);
      const tempId = toEntryId(created.id);
      
      // Delete should succeed
      await expect(repository.delete(tempId)).resolves.not.toThrow();
      
      // Entry should no longer exist
      const found = await repository.findById(created.id);
      expect(found).toBeNull();
    });
  });

  describe('Upvoting System', () => {
    it('should allow user to upvote an entry', async () => {
      const hasUpvotedBefore = await repository.hasUserUpvoted(toEntryId(testEntryId), testUserId2);
      expect(hasUpvotedBefore).toBe(false);

      await repository.addUpvote(toEntryId(testEntryId), testUserId2);

      const hasUpvotedAfter = await repository.hasUserUpvoted(toEntryId(testEntryId), testUserId2);
      expect(hasUpvotedAfter).toBe(true);
    });

    it('should prevent duplicate upvotes', async () => {
      // First upvote should succeed
      await repository.addUpvote(toEntryId(testEntryId), testUserId2);

      // Second upvote should fail
      await expect(
        repository.addUpvote(toEntryId(testEntryId), testUserId2)
      ).rejects.toThrow(AlreadyUpvotedError);
    });

    it('should allow user to remove upvote', async () => {
      // First add an upvote
      await repository.addUpvote(toEntryId(testEntryId), testUserId2);
      
      // Then remove it
      await repository.removeUpvote(toEntryId(testEntryId), testUserId2);

      const hasUpvoted = await repository.hasUserUpvoted(toEntryId(testEntryId), testUserId2);
      expect(hasUpvoted).toBe(false);
    });

    it('should throw error when removing non-existent upvote', async () => {
      await expect(
        repository.removeUpvote(toEntryId(testEntryId), testUserId2)
      ).rejects.toThrow(UpvoteNotFoundError);
    });
  });

  describe('Search and Filtering', () => {
    it('should find entries with search', async () => {
      const results = await repository.searchEntries('Test', { limit: 10 });
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].entry.word).toContain('Test');
    });

    it('should get popular entries', async () => {
      const results = await repository.findPopular(5);
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeLessThanOrEqual(5);
    });

    it('should get recent entries', async () => {
      const results = await repository.findRecent({ limit: 5 });
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeLessThanOrEqual(5);
    });

    it('should get entry count', async () => {
      const count = await repository.getCount();
      
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Cache Functionality', () => {
    it('should cache and retrieve count', async () => {
      // First call should hit database
      const count1 = await repository.getCount();
      
      // Second call should hit cache (faster)
      const startTime = Date.now();
      const count2 = await repository.getCount();
      const endTime = Date.now();
      
      expect(count1).toBe(count2);
      expect(endTime - startTime).toBeLessThan(10); // Should be very fast from cache
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const invalidData = {
        word: '', // Invalid: too short
        definition: 'Short', // Invalid: too short
        authorId: 'invalid-uuid' // Invalid UUID format
      } as CreateDictionaryEntryDTO;

      // This should be caught by validation, but if it reaches the repository
      // it should handle database-level errors
      await expect(
        repository.create(invalidData)
      ).rejects.toThrow();
    });
  });
});