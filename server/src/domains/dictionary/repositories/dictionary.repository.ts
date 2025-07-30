import { eq, and, desc, sql, ilike, count, or } from 'drizzle-orm';
import { db } from '@db';
import { dictionaryEntries, dictionaryUpvotes, users } from '@db/schema';
import type { UserId, EntryId } from '@shared/types/ids';
import { isValidId, toEntryId } from '@shared/utils/id';
import type { 
  CreateDictionaryEntryDTO, 
  UpdateDictionaryEntryDTO,
  DictionarySearchParams 
} from '../validation/dictionary.validation';
import { 
  DictionaryError,
  EntryNotFoundError,
  AlreadyUpvotedError,
  UpvoteNotFoundError 
} from '../errors/dictionary.errors';

interface PaginationOptions {
  limit?: number;
  offset?: number;
  search?: string;
}

type CacheEntry<T> = { data: T; expires: number };

/**
 * Repository for dictionary domain
 * All database operations for dictionary should go through this repository
 */
export class DictionaryRepository {
  
  private readonly CACHE_TTL = 300; // 5 minutes
  private readonly CACHE_KEYS = {
    ENTRY: (id: string) => `dict:entry:${id}`,
    TERM: (term: string) => `dict:term:${term}`,
    POPULAR: (page: number) => `dict:popular:${page}`,
    RECENT: (page: number) => `dict:recent:${page}`,
    SEARCH: (query: string, page: number) => `dict:search:${query}:${page}`,
    COUNT: () => 'dict:count'
  };
  
  // Simple in-memory cache for now - in production would use Redis
  private cache = new Map<string, CacheEntry<unknown>>();
  private readonly maxCacheSize = 1000; // Prevent OOM
  
  // Cache performance metrics
  private cacheHits = 0;
  private cacheMisses = 0;
  private evictions = 0;
  
  // Query performance metrics
  private queryCount = 0;
  private totalQueryTime = 0;
  
  private async getFromCache<T>(key: string): Promise<T | null> {
    const cached = this.cache.get(key) as CacheEntry<T> | undefined;
    if (cached && cached.expires > Date.now()) {
      this.cacheHits++;
      return cached.data;
    }
    if (cached && cached.expires <= Date.now()) {
      this.cache.delete(key);
    }
    this.cacheMisses++;
    return null;
  }
  
  private async setCache<T>(key: string, data: T, ttl = this.CACHE_TTL): Promise<void> {
    // Evict oldest entries if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      this.evictOldestEntry();
    }
    
    this.cache.set(key, {
      data,
      expires: Date.now() + (ttl * 1000)
    } as CacheEntry<T>);
  }
  
  private evictOldestEntry(): void {
    const entries = Array.from(this.cache.entries());
    if (entries.length > 0) {
      // Find the entry with earliest expiry time
      const oldestEntry = entries.reduce((oldest, current) => 
        current[1].expires < oldest[1].expires ? current : oldest
      );
      this.cache.delete(oldestEntry[0]);
      this.evictions++;
    }
  }
  
  /**
   * Get cache performance metrics
   */
  getCacheStats() {
    const totalRequests = this.cacheHits + this.cacheMisses;
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate: totalRequests > 0 ? this.cacheHits / totalRequests : 0,
      evictions: this.evictions
    };
  }
  
  /**
   * Get comprehensive performance metrics
   */
  getMetrics() {
    const cacheStats = this.getCacheStats();
    return {
      cache: cacheStats,
      queries: {
        count: this.queryCount,
        avgTime: this.queryCount > 0 ? this.totalQueryTime / this.queryCount : 0,
        totalTime: this.totalQueryTime
      }
    };
  }
  
  /**
   * Track query execution time
   */
  private async trackQuery<T>(operation: () => Promise<T>): Promise<T> {
    const start = Date.now();
    try {
      const result = await operation();
      return result;
    } finally {
      this.queryCount++;
      this.totalQueryTime += Date.now() - start;
    }
  }
  
  private async invalidateCache(pattern: string): Promise<void> {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
  /**
   * Find all dictionary entries with pagination and search
   */
  async findAll(options: PaginationOptions = {}) {
    const { limit = 20, offset = 0, search } = options;
    
    let query = db
      .select()
      .from(dictionaryEntries)
      .where(eq(dictionaryEntries.status, 'approved'))
      .orderBy(desc(dictionaryEntries.createdAt))
      .limit(limit)
      .offset(offset);

    if (search) {
      query = query.where(
        ilike(dictionaryEntries.word, `%${search}%`)
      );
    }

    const entries = await query;
    
    // Get authors separately if provider is available
    if (this.authorProvider && entries.length > 0) {
      const authorIds = [...new Set(entries.map(e => e.authorId))];
      const authors = await this.authorProvider.getAuthors(authorIds);
      
      return entries.map(entry => ({
        entry,
        author: authors.get(entry.authorId) || null
      }));
    }
    
    return entries.map(entry => ({ entry, author: null }));
  }

  /**
   * Find dictionary entry by ID
   */
  async findById(id: string) {
    // Validate ID format using shared validator
    if (!isValidId(id)) {
      throw new EntryNotFoundError(id);
    }
    
    const entryId = toEntryId(id);
    const cacheKey = this.CACHE_KEYS.ENTRY(entryId);
    const cached = await this.getFromCache(cacheKey);
    if (cached) return cached;
    
    const [entry] = await db
      .select()
      .from(dictionaryEntries)
      .where(eq(dictionaryEntries.id, entryId))
      .limit(1);
    
    if (!entry) return null;
    
    // Get author separately if provider is available
    let author: Author | null = null;
    if (this.authorProvider) {
      author = await this.authorProvider.getAuthor(entry.authorId);
    }
    
    const result = { entry, author };
    await this.setCache(cacheKey, result);
    return result;
  }

  /**
   * Find dictionary entry by slug
   */
  async findBySlug(slug: string) {
    const [result] = await db
      .select({
        entry: dictionaryEntries,
        author: {
          id: users.id,
          username: users.username,
          avatarUrl: users.avatarUrl
        }
      })
      .from(dictionaryEntries)
      .leftJoin(users, eq(dictionaryEntries.authorId, users.id))
      .where(eq(dictionaryEntries.slug, slug))
      .limit(1);
    
    return result || null;
  }

  /**
   * Find dictionary entry by word/term
   */
  async findByTerm(term: string) {
    const [result] = await db
      .select()
      .from(dictionaryEntries)
      .where(eq(dictionaryEntries.word, term))
      .limit(1);
    
    return result || null;
  }

  /**
   * Create new dictionary entry
   */
  async create(data: CreateDictionaryEntryDTO): Promise<typeof dictionaryEntries.$inferSelect> {
    try {
      return await db.transaction(async (tx) => {
        const [created] = await tx
          .insert(dictionaryEntries)
          .values({
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning();
        
        // Invalidate relevant caches after successful creation
        await this.invalidateCache('dict:popular');
        await this.invalidateCache('dict:recent');
        await this.invalidateCache('dict:count');
        
        return created;
      });
    } catch (error: any) {
      if (error.code === '23505') { // Unique constraint violation
        // Check which constraint was violated
        if (error.constraint?.includes('slug')) {
          throw new DictionaryError('SLUG_CONFLICT', 'Entry with this slug already exists', { 
            data,
            originalError: error.message
          });
        }
        throw new DictionaryError('DUPLICATE_ENTRY', 'Entry already exists', { 
          data,
          originalError: error.message
        });
      }
      throw error;
    }
  }

  /**
   * Update dictionary entry
   */
  async update(id: EntryId, data: UpdateDictionaryEntryDTO): Promise<typeof dictionaryEntries.$inferSelect> {
    return await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(dictionaryEntries)
        .set({ 
          ...data, 
          updatedAt: new Date() 
        })
        .where(eq(dictionaryEntries.id, id))
        .returning();
      
      if (!updated) {
        throw new EntryNotFoundError(id);
      }
      
      // Invalidate relevant caches after successful update
      await this.invalidateCache('dict:popular');
      await this.invalidateCache('dict:recent');
      await this.invalidateCache(`dict:entry:${id}`);
      
      return updated;
    });
  }

  /**
   * Delete dictionary entry
   */
  async delete(id: EntryId): Promise<void> {
    return await db.transaction(async (tx) => {
      // First delete all upvotes for this entry
      await tx
        .delete(dictionaryUpvotes)
        .where(eq(dictionaryUpvotes.entryId, id));
      
      // Then delete the entry itself
      const result = await tx
        .delete(dictionaryEntries)
        .where(eq(dictionaryEntries.id, id))
        .returning();
      
      if (result.length === 0) {
        throw new EntryNotFoundError(id);
      }
      
      // Invalidate all caches after deletion
      await this.invalidateCache('dict:');
    });
  }

  /**
   * Check if user has already upvoted an entry
   */
  async hasUserUpvoted(entryId: EntryId, userId: UserId): Promise<boolean> {
    const [existing] = await db
      .select()
      .from(dictionaryUpvotes)
      .where(
        and(
          eq(dictionaryUpvotes.entryId, entryId),
          eq(dictionaryUpvotes.userId, userId)
        )
      )
      .limit(1);
    
    return !!existing;
  }

  /**
   * Add upvote to dictionary entry
   */
  async addUpvote(entryId: EntryId, userId: UserId): Promise<void> {
    try {
      // Use transaction to ensure data consistency and handle race conditions
      await db.transaction(async (tx) => {
        // Check if already upvoted within transaction to prevent race conditions
        const [existing] = await tx
          .select()
          .from(dictionaryUpvotes)
          .where(
            and(
              eq(dictionaryUpvotes.entryId, entryId),
              eq(dictionaryUpvotes.userId, userId)
            )
          )
          .limit(1);
        
        if (existing) {
          throw new AlreadyUpvotedError(entryId, userId);
        }
        
        // Add upvote record
        await tx.insert(dictionaryUpvotes).values({
          entryId,
          userId,
          createdAt: new Date()
        });
        
        // Increment upvote count
        await tx
          .update(dictionaryEntries)
          .set({ 
            upvoteCount: sql`${dictionaryEntries.upvoteCount} + 1` 
          })
          .where(eq(dictionaryEntries.id, entryId));
      });
    } catch (error: any) {
      // Handle Postgres unique constraint violations (race condition)
      if (error.code === '23505') {
        throw new AlreadyUpvotedError(entryId, userId);
      }
      throw error;
    }
  }

  /**
   * Remove upvote from dictionary entry
   */
  async removeUpvote(entryId: EntryId, userId: UserId): Promise<void> {
    try {
      // Use transaction to ensure data consistency
      await db.transaction(async (tx) => {
        // Verify upvote exists before attempting to remove
        const [existing] = await tx
          .select()
          .from(dictionaryUpvotes)
          .where(
            and(
              eq(dictionaryUpvotes.entryId, entryId),
              eq(dictionaryUpvotes.userId, userId)
            )
          )
          .limit(1);
        
        if (!existing) {
          throw new UpvoteNotFoundError(entryId, userId);
        }
        
        // Remove upvote record
        await tx
          .delete(dictionaryUpvotes)
          .where(eq(dictionaryUpvotes.id, existing.id));
        
        // Prevent negative upvote counts
        await tx
          .update(dictionaryEntries)
          .set({ 
            upvoteCount: sql`GREATEST(0, ${dictionaryEntries.upvoteCount} - 1)` 
          })
          .where(eq(dictionaryEntries.id, entryId));
      });
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Increment view count for an entry
   */
  async incrementViewCount(id: string) {
    // Validate ID format
    if (!isValidId(id)) {
      throw new EntryNotFoundError(id);
    }
    
    const entryId = toEntryId(id);
    await db
      .update(dictionaryEntries)
      .set({ 
        viewCount: sql`${dictionaryEntries.viewCount} + 1` 
      })
      .where(eq(dictionaryEntries.id, entryId));
  }

  /**
   * Get popular entries (by upvote count)
   */
  async findPopular(limit = 10) {
    const entries = await db
      .select()
      .from(dictionaryEntries)
      .where(eq(dictionaryEntries.status, 'approved'))
      .orderBy(desc(dictionaryEntries.upvoteCount))
      .limit(limit);
    
    // Get authors separately if provider is available
    if (this.authorProvider && entries.length > 0) {
      const authorIds = [...new Set(entries.map(e => e.authorId))];
      const authors = await this.authorProvider.getAuthors(authorIds);
      
      return entries.map(entry => ({
        entry,
        author: authors.get(entry.authorId) || null
      }));
    }
    
    return entries.map(entry => ({ entry, author: null }));
  }

  /**
   * Get total count of approved entries
   */
  async getCount(): Promise<number> {
    const cacheKey = this.CACHE_KEYS.COUNT();
    const cached = await this.getFromCache<number>(cacheKey);
    if (cached !== null) return cached;
    
    const [result] = await db
      .select({ count: count() })
      .from(dictionaryEntries)
      .where(eq(dictionaryEntries.status, 'approved'));
    
    await this.setCache(cacheKey, result.count);
    return result.count;
  }
  
  /**
   * Search entries with full-text search
   */
  async searchEntries(query: string, options: { limit?: number; offset?: number } = {}) {
    const { limit = 20, offset = 0 } = options;
    const cacheKey = this.CACHE_KEYS.SEARCH(query, Math.floor(offset / limit) + 1);
    const cached = await this.getFromCache(cacheKey);
    if (cached) return cached;
    
    // Use safe Drizzle operators to prevent SQL injection
    // Escape wildcards and SQL special characters
    const escapedQuery = query
      .replace(/[%_]/g, '\\$&')  // Escape wildcards
      .replace(/['";\\]/g, '');   // Remove dangerous characters
    const entries = await db
      .select()
      .from(dictionaryEntries)
      .where(
        and(
          eq(dictionaryEntries.status, 'approved'),
          or(
            ilike(dictionaryEntries.word, `%${escapedQuery}%`),
            ilike(dictionaryEntries.definition, `%${escapedQuery}%`)
          )
        )
      )
      .orderBy(desc(dictionaryEntries.createdAt))
      .limit(limit)
      .offset(offset);
    
    // Get authors separately if provider is available
    let results;
    if (this.authorProvider && entries.length > 0) {
      const authorIds = [...new Set(entries.map(e => e.authorId))];
      const authors = await this.authorProvider.getAuthors(authorIds);
      
      results = entries.map(entry => ({
        entry,
        author: authors.get(entry.authorId) || null
      }));
    } else {
      results = entries.map(entry => ({ entry, author: null }));
    }
    
    await this.setCache(cacheKey, results);
    return results;
  }
  
  /**
   * Get recent entries with cache
   */
  async findRecent(options: { limit?: number; offset?: number } = {}) {
    const { limit = 20, offset = 0 } = options;
    const page = Math.floor(offset / limit) + 1;
    const cacheKey = this.CACHE_KEYS.RECENT(page);
    const cached = await this.getFromCache(cacheKey);
    if (cached) return cached;
    
    const entries = await db
      .select()
      .from(dictionaryEntries)
      .where(eq(dictionaryEntries.status, 'approved'))
      .orderBy(desc(dictionaryEntries.createdAt))
      .limit(limit)
      .offset(offset);
    
    // Get authors separately if provider is available
    let results;
    if (this.authorProvider && entries.length > 0) {
      const authorIds = [...new Set(entries.map(e => e.authorId))];
      const authors = await this.authorProvider.getAuthors(authorIds);
      
      results = entries.map(entry => ({
        entry,
        author: authors.get(entry.authorId) || null
      }));
    } else {
      results = entries.map(entry => ({ entry, author: null }));
    }
    
    await this.setCache(cacheKey, results, 300); // 5 minutes
    return results;
  }
}

// Export singleton instance
export const dictionaryRepository = new DictionaryRepository();
