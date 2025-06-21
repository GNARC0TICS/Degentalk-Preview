import { db } from '@db';
import { dgtPackages } from '@schema';
import { eq, asc } from 'drizzle-orm';
import { AdminError } from '../../../../core/errors';

interface DgtPackageInput {
	name: string;
	description?: string | null;
	dgtAmount: number;
	usdPrice: number;
	discountPercentage?: number | null;
	isFeatured?: boolean;
	imageUrl?: string | null;
	isActive?: boolean;
	sortOrder?: number;
}

export class DgtPackageService {
	async list() {
		return db.select().from(dgtPackages).orderBy(asc(dgtPackages.sortOrder), asc(dgtPackages.id));
	}

	async create(data: DgtPackageInput) {
		const [exists] = await db
			.select({ id: dgtPackages.id })
			.from(dgtPackages)
			.where(eq(dgtPackages.name, data.name));

		if (exists) throw AdminError.duplicate('DGT Package', 'name', data.name);

		const [created] = await db.insert(dgtPackages).values(data).returning();
		return created;
	}

	async update(id: number, data: Partial<DgtPackageInput>) {
		const [existing] = await db.select().from(dgtPackages).where(eq(dgtPackages.id, id));
		if (!existing) throw AdminError.notFound('DGT Package', id);

		const [updated] = await db
			.update(dgtPackages)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(dgtPackages.id, id))
			.returning();
		return updated;
	}

	async delete(id: number) {
		const [deleted] = await db.delete(dgtPackages).where(eq(dgtPackages.id, id)).returning();
		if (!deleted) throw AdminError.notFound('DGT Package', id);
		return { success: true };
	}
}

export const dgtPackageService = new DgtPackageService();
