import { db } from '@db';
import { cosmeticCategories } from '@schema';
import { eq, desc, asc } from 'drizzle-orm';
import { AdminError } from '../../admin.errors';

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
		return db.select().from(cosmeticCategories).orderBy(asc(cosmeticCategories.name));
	}

	async create(data: CategoryInput) {
		const [exists] = await db
			.select({ id: cosmeticCategories.id })
			.from(cosmeticCategories)
			.where(eq(cosmeticCategories.slug, data.slug));
		if (exists) throw AdminError.duplicate('Cosmetic Category', 'slug', data.slug);

		const [created] = await db.insert(cosmeticCategories).values(data).returning();
		return created;
	}

	async update(id: Id<'id'>, data: Partial<CategoryInput>) {
		const [existing] = await db
			.select()
			.from(cosmeticCategories)
			.where(eq(cosmeticCategories.id, id));
		if (!existing) throw AdminError.notFound('Cosmetic Category', id);

		const [updated] = await db
			.update(cosmeticCategories)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(cosmeticCategories.id, id))
			.returning();
		return updated;
	}

	async delete(id: Id<'id'>) {
		const [deleted] = await db
			.delete(cosmeticCategories)
			.where(eq(cosmeticCategories.id, id))
			.returning();
		if (!deleted) throw AdminError.notFound('Cosmetic Category', id);
		return { success: true };
	}
}

export const shopCategoryService = new ShopCategoryService();
