import { db } from '@db';
import { animationPacks, animationPackItems, mediaLibrary } from '@schema';
import { eq, asc } from 'drizzle-orm';
import slugify from 'slugify';
import type { PackId } from '@shared/types';

export interface PackInput {
	name: string;
	description?: string;
	rarity: 'cope' | 'mid' | 'exit' | 'mythic';
	priceDgt?: number | null;
	isPublished?: boolean;
	contents: number[]; // media IDs in order
}

export class AnimationPackService {
	async list() {
		const packs = await db.select().from(animationPacks).orderBy(asc(animationPacks.id));
		return Promise.all(
			packs.map(async (p) => ({
				...p,
				contents: await this.contentsForPack(p.id)
			}))
		);
	}

	async contentsForPack(packId: PackId) {
		return db
			.select({ id: mediaLibrary.id, url: mediaLibrary.url })
			.from(animationPackItems)
			.innerJoin(mediaLibrary, eq(animationPackItems.mediaId, mediaLibrary.id))
			.where(eq(animationPackItems.packId, packId))
			.orderBy(asc(animationPackItems.sortOrder));
	}

	async create(data: PackInput) {
		const [pack] = await db
			.insert(animationPacks)
			.values({
				name: data.name,
				slug: slugify(data.name, { lower: true, strict: true }),
				description: data.description,
				rarity: data.rarity,
				priceDgt: data.priceDgt ?? null,
				isPublished: data.isPublished ?? false
			})
			.returning();

		await this.syncItems(pack.id, data.contents);
		return { ...pack, contents: await this.contentsForPack(pack.id) };
	}

	async update(id: Id<'id'>, data: PackInput) {
		await db
			.update(animationPacks)
			.set({
				name: data.name,
				slug: slugify(data.name, { lower: true, strict: true }),
				description: data.description,
				rarity: data.rarity,
				priceDgt: data.priceDgt ?? null,
				isPublished: data.isPublished ?? false
			})
			.where(eq(animationPacks.id, id));
		await this.syncItems(id, data.contents);
		const [pack] = await db.select().from(animationPacks).where(eq(animationPacks.id, id));
		return { ...pack, contents: await this.contentsForPack(id) };
	}

	async delete(id: Id<'id'>) {
		await db.delete(animationPacks).where(eq(animationPacks.id, id));
	}

	private async syncItems(packId: PackId, mediaIds: number[]) {
		// Clear existing
		await db.delete(animationPackItems).where(eq(animationPackItems.packId, packId));
		if (!mediaIds.length) return;
		await db
			.insert(animationPackItems)
			.values(mediaIds.map((mid, idx) => ({ packId, mediaId: mid, sortOrder: idx })));
	}
}

export const animationPackService = new AnimationPackService();
