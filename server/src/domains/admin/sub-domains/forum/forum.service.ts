/**
 * Admin Forum Service
 *
 * Handles business logic for forum management.
 */

import { db } from '@db';
import { forumCategories, threads, posts, threadPrefixes, tags } from '@schema';
import { eq, and, sql, count, desc, asc, isNull, not, ne } from 'drizzle-orm';
import { AdminError } from '../../admin.errors';
import type {
	CategoryInput,
	PrefixInput,
	TagInput,
	ModerateThreadInput,
	PaginationInput
} from './forum.validators';

export class AdminForumService {
	async getAllCategories() {
		try {
			const allCategories = await db
				.select()
				.from(forumCategories)
				.orderBy(
					asc(forumCategories.parentId),
					asc(forumCategories.position),
					asc(forumCategories.name)
				);

			// Get thread counts for each category
			const threadCountsResult = await db
				.select({
					categoryId: threads.categoryId,
					threadCount: count()
				})
				.from(threads)
				.groupBy(threads.categoryId);

			const countMap = new Map<number, number>();
			threadCountsResult.forEach((row) => {
				if (row.categoryId !== null) {
					countMap.set(row.categoryId, Number(row.threadCount));
				}
			});

			return allCategories.map((category) => ({
				...category,
				threadCount: countMap.get(category.id) || 0
			}));
		} catch (error) {
			console.error('Error fetching categories:', error);
			throw AdminError.database('Failed to fetch categories');
		}
	}

	async getCategoryById(id: number) {
		try {
			const [category] = await db.select().from(forumCategories).where(eq(forumCategories.id, id));

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
			const [existingCategory] = await db
				.select({ id: forumCategories.id })
				.from(forumCategories)
				.where(eq(forumCategories.slug, data.slug));

			if (existingCategory) {
				throw AdminError.duplicate('Category', 'slug', data.slug);
			}

			// If this has a parent, verify parent exists
			if (data.parentId) {
				const [parentCategory] = await db
					.select({ id: forumCategories.id })
					.from(forumCategories)
					.where(eq(forumCategories.id, data.parentId));

				if (!parentCategory) {
					throw AdminError.notFound('Parent category', data.parentId);
				}
			}

			const [newCategory] = await db
				.insert(forumCategories)
				.values({
					name: data.name,
					description: data.description,
					slug: data.slug,
					parentId: data.parentId,
					position: data.position ?? 0,
					icon: data.icon,
					isHidden: data.isHidden,
					allowThreads: data.allowThreads,
					viewPermission: data.viewPermission,
					postPermission: data.postPermission
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
			const [existingCategory] = await db
				.select()
				.from(forumCategories)
				.where(eq(forumCategories.id, id));

			if (!existingCategory) {
				throw AdminError.notFound('Category', id);
			}

			// Check for slug conflicts
			if (data.slug && data.slug !== existingCategory.slug) {
				const [slugConflict] = await db
					.select({ id: forumCategories.id })
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
				const [parentCategory] = await db
					.select({ id: forumCategories.id })
					.from(forumCategories)
					.where(eq(forumCategories.id, data.parentId));

				if (!parentCategory) {
					throw AdminError.notFound('Parent category', data.parentId);
				}
			}

			const [updatedCategory] = await db
				.update(forumCategories)
				.set({
					name: data.name,
					description: data.description,
					slug: data.slug,
					parentId: data.parentId,
					position: data.position ?? 0,
					icon: data.icon,
					isHidden: data.isHidden,
					allowThreads: data.allowThreads,
					viewPermission: data.viewPermission,
					postPermission: data.postPermission,
					updatedAt: new Date()
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
			const [existingCategory] = await db
				.select()
				.from(forumCategories)
				.where(eq(forumCategories.id, id));

			if (!existingCategory) {
				throw AdminError.notFound('Category', id);
			}

			// Check for child categories
			const [childCount] = await db
				.select({ count: count() })
				.from(forumCategories)
				.where(eq(forumCategories.parentId, id));

			if (Number(childCount?.count) > 0) {
				throw AdminError.validation('Cannot delete category with child categories');
			}

			// Check if category has threads
			const [threadCount] = await db
				.select({ count: count() })
				.from(threads)
				.where(eq(threads.categoryId, id));

			if (Number(threadCount?.count) > 0) {
				throw AdminError.validation('Cannot delete category with threads');
			}

			// Delete the category
			await db.delete(forumCategories).where(eq(forumCategories.id, id));

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
			const prefixes = await db
				.select()
				.from(threadPrefixes)
				.orderBy(asc(threadPrefixes.position), asc(threadPrefixes.name));

			return prefixes;
		} catch (error) {
			console.error('Error fetching prefixes:', error);
			throw AdminError.database('Failed to fetch thread prefixes');
		}
	}

	async createPrefix(data: PrefixInput) {
		try {
			// Check for duplicate name
			const [existingPrefix] = await db
				.select({ id: threadPrefixes.id })
				.from(threadPrefixes)
				.where(
					and(
						eq(threadPrefixes.name, data.name),
						data.categoryId
							? eq(threadPrefixes.categoryId, data.categoryId)
							: isNull(threadPrefixes.categoryId)
					)
				);

			if (existingPrefix) {
				const errorMessage = data.categoryId
					? 'A prefix with this name already exists for this category'
					: 'A global prefix with this name already exists';
				throw AdminError.duplicate('Prefix', 'name', data.name);
			}

			// If category-specific, verify category exists
			if (data.categoryId) {
				const [category] = await db
					.select({ id: forumCategories.id })
					.from(forumCategories)
					.where(eq(forumCategories.id, data.categoryId));

				if (!category) {
					throw AdminError.notFound('Category', data.categoryId);
				}
			}

			const [newPrefix] = await db
				.insert(threadPrefixes)
				.values({
					name: data.name,
					color: data.color,
					icon: data.icon,
					categoryId: data.categoryId,
					isHidden: data.isHidden,
					position: data.position ?? 0
				})
				.returning();

			return newPrefix;
		} catch (error) {
			if (error instanceof AdminError) throw error;
			console.error('Error creating thread prefix:', error);
			throw AdminError.database('Failed to create thread prefix');
		}
	}

	// Tag Management

	async getAllTags() {
		try {
			const allTags = await db.select().from(tags).orderBy(asc(tags.name));

			return allTags;
		} catch (error) {
			console.error('Error fetching tags:', error);
			throw AdminError.database('Failed to fetch tags');
		}
	}

	async createTag(data: TagInput) {
		try {
			// Check for duplicate name
			const [existingName] = await db
				.select({ id: tags.id })
				.from(tags)
				.where(eq(tags.name, data.name));

			if (existingName) {
				throw AdminError.duplicate('Tag', 'name', data.name);
			}

			// Check for duplicate slug
			const [existingSlug] = await db
				.select({ id: tags.id })
				.from(tags)
				.where(eq(tags.slug, data.slug));

			if (existingSlug) {
				throw AdminError.duplicate('Tag', 'slug', data.slug);
			}

			const [newTag] = await db
				.insert(tags)
				.values({
					name: data.name,
					slug: data.slug,
					description: data.description
				})
				.returning();

			return newTag;
		} catch (error) {
			if (error instanceof AdminError) throw error;
			console.error('Error creating tag:', error);
			throw AdminError.database('Failed to create tag');
		}
	}

	async updateTag(id: number, data: TagInput) {
		try {
			// Check tag exists
			const [existingTag] = await db.select().from(tags).where(eq(tags.id, id));

			if (!existingTag) {
				throw AdminError.notFound('Tag', id);
			}

			// Check for name conflicts
			if (data.name && data.name !== existingTag.name) {
				const [nameConflict] = await db
					.select({ id: tags.id })
					.from(tags)
					.where(and(eq(tags.name, data.name), ne(tags.id, id)));

				if (nameConflict) {
					throw AdminError.duplicate('Tag', 'name', data.name);
				}
			}

			// Check for slug conflicts
			if (data.slug && data.slug !== existingTag.slug) {
				const [slugConflict] = await db
					.select({ id: tags.id })
					.from(tags)
					.where(and(eq(tags.slug, data.slug), ne(tags.id, id)));

				if (slugConflict) {
					throw AdminError.duplicate('Tag', 'slug', data.slug);
				}
			}

			const [updatedTag] = await db
				.update(tags)
				.set({
					name: data.name,
					slug: data.slug,
					description: data.description
				})
				.where(eq(tags.id, id))
				.returning();

			return updatedTag;
		} catch (error) {
			if (error instanceof AdminError) throw error;
			console.error('Error updating tag:', error);
			throw AdminError.database('Failed to update tag');
		}
	}

	async deleteTag(id: number) {
		try {
			// Check tag exists
			const [existingTag] = await db.select().from(tags).where(eq(tags.id, id));

			if (!existingTag) {
				throw AdminError.notFound('Tag', id);
			}

			// Delete the tag
			await db.delete(tags).where(eq(tags.id, id));

			return { success: true, message: 'Tag deleted successfully' };
		} catch (error) {
			if (error instanceof AdminError) throw error;
			console.error('Error deleting tag:', error);
			throw AdminError.database('Failed to delete tag');
		}
	}

	// Thread moderation

	async moderateThread(threadId: number, data: ModerateThreadInput) {
		try {
			// Check thread exists
			const [existingThread] = await db.select().from(threads).where(eq(threads.id, threadId));

			if (!existingThread) {
				throw AdminError.notFound('Thread', threadId);
			}

			// If changing category, verify category exists and allows threads
			if (data.categoryId && data.categoryId !== existingThread.categoryId) {
				const [category] = await db
					.select({ id: forumCategories.id, allowThreads: forumCategories.allowThreads })
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
				const [prefix] = await db
					.select({ id: threadPrefixes.id })
					.from(threadPrefixes)
					.where(eq(threadPrefixes.id, data.prefixId));

				if (!prefix) {
					throw AdminError.notFound('Thread prefix', data.prefixId);
				}
			}

			const [updatedThread] = await db
				.update(threads)
				.set({
					isLocked: data.isLocked !== undefined ? data.isLocked : existingThread.isLocked,
					isSticky: data.isSticky !== undefined ? data.isSticky : existingThread.isSticky,
					isHidden: data.isHidden !== undefined ? data.isHidden : existingThread.isHidden,
					prefixId: data.prefixId !== undefined ? data.prefixId : existingThread.prefixId,
					categoryId: data.categoryId !== undefined ? data.categoryId : existingThread.categoryId,
					updatedAt: new Date()
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

	// Forum entity management methods
	async getAllEntities() {
		const entities = await db
			.select()
			.from(forumCategories)
			.orderBy(forumCategories.position, forumCategories.name);

		return entities;
	}

	async getEntityById(id: number) {
		const [entity] = await db
			.select()
			.from(forumCategories)
			.where(eq(forumCategories.id, id))
			.limit(1);

		return entity;
	}

	async createEntity(data: any) {
		const [entity] = await db.insert(forumCategories).values(data).returning();

		return entity;
	}

	async updateEntity(id: number, data: any) {
		const [entity] = await db
			.update(forumCategories)
			.set({
				...data,
				updatedAt: new Date()
			})
			.where(eq(forumCategories.id, id))
			.returning();

		return entity;
	}

	async deleteEntity(id: number) {
		// Check if entity has children
		const children = await db
			.select({ id: forumCategories.id })
			.from(forumCategories)
			.where(eq(forumCategories.parentId, id))
			.limit(1);

		if (children.length > 0) {
			throw new Error('Cannot delete entity with children');
		}

		// Check if entity has threads (only for forums)
		const entity = await this.getEntityById(id);
		if (entity && entity.type === 'forum') {
			const threadCount = await db
				.select({ count: sql<number>`count(*)` })
				.from(threads)
				.where(eq(threads.categoryId, id));

			if (threadCount[0].count > 0) {
				throw new Error('Cannot delete forum with threads');
			}
		}

		const result = await db.delete(forumCategories).where(eq(forumCategories.id, id));

		return result.rowCount > 0;
	}
}

export const adminForumService = new AdminForumService();
