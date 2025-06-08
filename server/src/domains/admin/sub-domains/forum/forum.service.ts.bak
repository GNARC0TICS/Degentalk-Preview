/**
 * Admin Forum Service
 * 
 * Handles business logic for forum management.
 */

import { db } from '@db';
import { 
  forumCategories, 
  threads, 
  posts,
  threadPrefixes,
} from '@schema';
import { eq, and, sql, count, desc, asc, isNull, not, ne } from 'drizzle-orm';
import { AdminError } from '../../../../core/errors';
import type { 
  CategoryInput, 
  PrefixInput, 
  ModerateThreadInput, 
  PaginationInput 
} from './forum.validators';

export class AdminForumService {
  async getAllCategories() {
    try {
      const allCategories = await db.select()
        .from(forumCategories)
        .orderBy(asc(forumCategories.parentId), asc(forumCategories.position), asc(forumCategories.name));
      
      // Get thread counts for each category
      const threadCountsResult = await db
        .select({
          categoryId: threads.categoryId,
          threadCount: count(),
        })
        .from(threads)
        .groupBy(threads.categoryId);

      const countMap = new Map<number, number>();
      threadCountsResult.forEach(row => {
        if (row.categoryId !== null) {
          countMap.set(row.categoryId, Number(row.threadCount));
        }
      });

      return allCategories.map(category => ({
        ...category,
        threadCount: countMap.get(category.id) || 0,
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw AdminError.database('Failed to fetch categories');
    }
  }

  async getCategoryById(id: number) {
    try {
      const [category] = await db.select()
        .from(forumCategories)
        .where(eq(forumCategories.id, id));
      
      if (!category) {
        throw AdminError.notFound('Category', id);
      }

      // Get thread count
      const [threadCountResult] = await db
        .select({ count: count() })
        .from(threads)
        .where(eq(threads.categoryId, id));

      return {
        ...category,
        threadCount: Number(threadCountResult?.count) || 0
      };
    } catch (error) {
      if (error instanceof AdminError) throw error;
      console.error('Error fetching category:', error);
      throw AdminError.database('Failed to fetch category');
    }
  }

  async createCategory(data: CategoryInput) {
    try {
      // Check for duplicate slug
      const [existingCategory] = await db.select({ id: forumCategories.id })
        .from(forumCategories)
        .where(eq(forumCategories.slug, data.slug));
      
      if (existingCategory) {
        throw AdminError.duplicate('Category', 'slug', data.slug);
      }

      // If this has a parent, verify parent exists
      if (data.parentId) {
        const [parentCategory] = await db.select({ id: forumCategories.id })
          .from(forumCategories)
          .where(eq(forumCategories.id, data.parentId));
        
        if (!parentCategory) {
          throw AdminError.notFound('Parent category', data.parentId);
        }
      }

      const [newCategory] = await db.insert(forumCategories)
        .values({
          name: data.name,
          description: data.description,
          slug: data.slug,
          parentId: data.parentId,
          position: data.sortOrder,
          icon: data.icon,
          isHidden: data.isHidden,
          allowThreads: data.allowThreads,
          viewPermission: data.viewPermission,
          postPermission: data.postPermission,
        })
        .returning();
      
      return newCategory;
    } catch (error) {
      if (error instanceof AdminError) throw error;
      console.error('Error creating category:', error);
      throw AdminError.database('Failed to create category');
    }
  }

  async updateCategory(id: number, data: CategoryInput) {
    try {
      // Check category exists
      const [existingCategory] = await db.select()
        .from(forumCategories)
        .where(eq(forumCategories.id, id));
      
      if (!existingCategory) {
        throw AdminError.notFound('Category', id);
      }

      // Check for slug conflicts
      if (data.slug && data.slug !== existingCategory.slug) {
        const [slugConflict] = await db.select({ id: forumCategories.id })
          .from(forumCategories)
          .where(and(eq(forumCategories.slug, data.slug), ne(forumCategories.id, id)));
        
        if (slugConflict) {
          throw AdminError.duplicate('Category', 'slug', data.slug);
        }
      }

      // Prevent category from being its own parent
      if (data.parentId === id) {
        throw AdminError.validation('Category cannot be its own parent');
      }

      // If updating parent, verify parent exists
      if (data.parentId && data.parentId !== existingCategory.parentId) {
        const [parentCategory] = await db.select({ id: forumCategories.id })
          .from(forumCategories)
          .where(eq(forumCategories.id, data.parentId));
        
        if (!parentCategory) {
          throw AdminError.notFound('Parent category', data.parentId);
        }
      }

      const [updatedCategory] = await db.update(forumCategories)
        .set({
          name: data.name,
          description: data.description,
          slug: data.slug,
          parentId: data.parentId,
          position: data.sortOrder,
          icon: data.icon,
          isHidden: data.isHidden,
          allowThreads: data.allowThreads,
          viewPermission: data.viewPermission,
          postPermission: data.postPermission,
          updatedAt: new Date(),
        })
        .where(eq(forumCategories.id, id))
        .returning();
      
      return updatedCategory;
    } catch (error) {
      if (error instanceof AdminError) throw error;
      console.error('Error updating category:', error);
      throw AdminError.database('Failed to update category');
    }
  }

  async deleteCategory(id: number) {
    try {
      // Check category exists
      const [existingCategory] = await db.select()
        .from(forumCategories)
        .where(eq(forumCategories.id, id));
      
      if (!existingCategory) {
        throw AdminError.notFound('Category', id);
      }

      // Check for child categories
      const [childCount] = await db.select({ count: count() })
        .from(forumCategories)
        .where(eq(forumCategories.parentId, id));
      
      if (Number(childCount?.count) > 0) {
        throw AdminError.validation('Cannot delete category with child categories');
      }

      // Check if category has threads
      const [threadCount] = await db.select({ count: count() })
        .from(threads)
        .where(eq(threads.categoryId, id));
      
      if (Number(threadCount?.count) > 0) {
        throw AdminError.validation('Cannot delete category with threads');
      }

      // Delete the category
      await db.delete(forumCategories)
        .where(eq(forumCategories.id, id));
      
      return { success: true, message: 'Category deleted successfully' };
    } catch (error) {
      if (error instanceof AdminError) throw error;
      console.error('Error deleting category:', error);
      throw AdminError.database('Failed to delete category');
    }
  }

  // Thread Prefix Management
  
  async getAllPrefixes() {
    try {
      const prefixes = await db.select()
        .from(threadPrefixes)
        .orderBy(asc(threadPrefixes.sortOrder), asc(threadPrefixes.name));
      
      return prefixes;
    } catch (error) {
      console.error('Error fetching prefixes:', error);
      throw AdminError.database('Failed to fetch thread prefixes');
    }
  }

  async createPrefix(data: PrefixInput) {
    try {
      // Check for duplicate name
      const [existingPrefix] = await db.select({ id: threadPrefixes.id })
        .from(threadPrefixes)
        .where(and(
          eq(threadPrefixes.name, data.name),
          data.categoryId 
            ? eq(threadPrefixes.categoryId, data.categoryId)
            : isNull(threadPrefixes.categoryId)
        ));
      
      if (existingPrefix) {
        const errorMessage = data.categoryId 
          ? 'A prefix with this name already exists for this category' 
          : 'A global prefix with this name already exists';
        throw AdminError.duplicate('Prefix', 'name', data.name);
      }

      // If category-specific, verify category exists
      if (data.categoryId) {
        const [category] = await db.select({ id: forumCategories.id })
          .from(forumCategories)
          .where(eq(forumCategories.id, data.categoryId));
        
        if (!category) {
          throw AdminError.notFound('Category', data.categoryId);
        }
      }

      const [newPrefix] = await db.insert(threadPrefixes)
        .values({
          name: data.name,
          color: data.color,
          icon: data.icon,
          categoryId: data.categoryId,
          isHidden: data.isHidden,
          sortOrder: data.sortOrder,
        })
        .returning();
      
      return newPrefix;
    } catch (error) {
      if (error instanceof AdminError) throw error;
      console.error('Error creating thread prefix:', error);
      throw AdminError.database('Failed to create thread prefix');
    }
  }

  // Thread moderation
  
  async moderateThread(threadId: number, data: ModerateThreadInput) {
    try {
      // Check thread exists
      const [existingThread] = await db.select()
        .from(threads)
        .where(eq(threads.id, threadId));
      
      if (!existingThread) {
        throw AdminError.notFound('Thread', threadId);
      }

      // If changing category, verify category exists and allows threads
      if (data.categoryId && data.categoryId !== existingThread.categoryId) {
        const [category] = await db.select({ id: forumCategories.id, allowThreads: forumCategories.allowThreads })
          .from(forumCategories)
          .where(eq(forumCategories.id, data.categoryId));
        
        if (!category) {
          throw AdminError.notFound('Target category', data.categoryId);
        }
        
        if (!category.allowThreads) {
          throw AdminError.validation('Target category does not allow threads');
        }
      }

      // If changing prefix, verify prefix exists
      if (data.prefixId && data.prefixId !== existingThread.prefixId) {
        const [prefix] = await db.select({ id: threadPrefixes.id })
          .from(threadPrefixes)
          .where(eq(threadPrefixes.id, data.prefixId));
        
        if (!prefix) {
          throw AdminError.notFound('Thread prefix', data.prefixId);
        }
      }

      const [updatedThread] = await db.update(threads)
        .set({
          isLocked: data.isLocked !== undefined ? data.isLocked : existingThread.isLocked,
          isSticky: data.isSticky !== undefined ? data.isSticky : existingThread.isSticky,
          isHidden: data.isHidden !== undefined ? data.isHidden : existingThread.isHidden,
          prefixId: data.prefixId !== undefined ? data.prefixId : existingThread.prefixId,
          categoryId: data.categoryId !== undefined ? data.categoryId : existingThread.categoryId,
          updatedAt: new Date(),
        })
        .where(eq(threads.id, threadId))
        .returning();
      
      return updatedThread;
    } catch (error) {
      if (error instanceof AdminError) throw error;
      console.error('Error moderating thread:', error);
      throw AdminError.database('Failed to moderate thread');
    }
  }
}

export const adminForumService = new AdminForumService(); 