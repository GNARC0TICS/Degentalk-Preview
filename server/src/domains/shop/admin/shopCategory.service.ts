import { db } from '@degentalk/db';
import { productCategories as shopCategories } from '@schema';
import { eq, desc, asc } from 'drizzle-orm';
import { AdminError } from '../../admin/admin.errors';
import type { Id } from '@shared/types/ids';

interface CategoryInput {
	name: string;
	slug: string;
	description?: string;
	bgColor?: string | null;
	textColor?: string | null;
	iconUrl?: string | null;
	allowedRarities?: any;
	isActive?: boolean;
	pluginData?: any;
}

export class ShopCategoryService {
	async list() {
		return db.select().from(shopCategories).orderBy(asc(shopCategories.name));
	}

	async create(data: CategoryInput) {
		const [exists] = await db
			.select({ id: shopCategories.id })
			.from(shopCategories)
			.where(eq(shopCategories.slug, data.slug));
		if (exists) throw AdminError.duplicate('Cosmetic Category', 'slug', data.slug);

		const [created] = await db.insert(shopCategories).values(data).returning();
		return created;
	}

	async update(id: Id<'id'>, data: Partial<CategoryInput>) {
		const [existing] = await db.select().from(shopCategories).where(eq(shopCategories.id, id));
		if (!existing) throw AdminError.notFound('Cosmetic Category', id);

		const [updated] = await db
			.update(shopCategories)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(shopCategories.id, id))
			.returning();
		return updated;
	}

	async delete(id: Id<'id'>) {
		const [deleted] = await db.delete(shopCategories).where(eq(shopCategories.id, id)).returning();
		if (!deleted) throw AdminError.notFound('Cosmetic Category', id);
		return { success: true };
	}
}

export const shopCategoryService = new ShopCategoryService();
