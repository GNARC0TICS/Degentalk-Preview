import { db } from '@degentalk/db';
import { rarities } from '@schema';
import type { Id } from '@shared/types/ids';
import { eq, asc } from 'drizzle-orm';
import { AdminError } from '../../admin/admin.errors';

interface RarityInput {
	name: string;
	slug: string;
	hexColor: string;
	rarityScore: number;
	isGlow?: boolean;
	isAnimated?: boolean;
	flags?: any;
	pluginData?: any;
}

export class RarityService {
	async list() {
		return db.select().from(rarities).orderBy(asc(rarities.rarityScore));
	}

	async create(data: RarityInput) {
		const [exists] = await db.select().from(rarities).where(eq(rarities.slug, data.slug));
		if (exists) throw AdminError.duplicate('Rarity', 'slug', data.slug);
		const [created] = await db.insert(rarities).values(data).returning();
		return created;
	}

	async update(id: Id<'id'>, data: Partial<RarityInput>) {
		const [existing] = await db.select().from(rarities).where(eq(rarities.id, id));
		if (!existing) throw AdminError.notFound('Rarity', id);
		const [updated] = await db
			.update(rarities)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(rarities.id, id))
			.returning();
		return updated;
	}

	async delete(id: Id<'id'>) {
		const [deleted] = await db.delete(rarities).where(eq(rarities.id, id)).returning();
		if (!deleted) throw AdminError.notFound('Rarity', id);
		return { success: true };
	}
}

export const rarityService = new RarityService();
