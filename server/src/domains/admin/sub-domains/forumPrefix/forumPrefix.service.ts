import { db } from '@db';
import { threadPrefixes } from '@schema';
import { eq, not, and, asc, desc } from 'drizzle-orm';
import { AdminError } from '../../admin.errors';
import type { CategoryId } from '@shared/types/ids';

interface UpdatePrefixInput {
	name?: string;
	color?: string | null;
	isActive?: boolean;
	position?: number;
	categoryId?: CategoryId | null;
}

export class ForumPrefixService {
	async updatePrefix(id: Id<'id'>, data: UpdatePrefixInput) {
		const [existing] = await db.select().from(threadPrefixes).where(eq(threadPrefixes.id, id));

		if (!existing) throw AdminError.notFound('Thread Prefix', id);

		// Prevent duplicate names within same scope
		if (data.name && data.name !== existing.name) {
			const [dupe] = await db
				.select({ id: threadPrefixes.id })
				.from(threadPrefixes)
				.where(
					and(
						eq(threadPrefixes.name, data.name),
						data.categoryId
							? eq(threadPrefixes.categoryId, data.categoryId)
							: not(threadPrefixes.categoryId.isNotNull())
					)
				);
			if (dupe) throw AdminError.duplicate('Thread Prefix', 'name', data.name);
		}

		const [updated] = await db
			.update(threadPrefixes)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(threadPrefixes.id, id))
			.returning();

		return updated;
	}

	async deletePrefix(id: Id<'id'>) {
		const [deleted] = await db.delete(threadPrefixes).where(eq(threadPrefixes.id, id)).returning();

		if (!deleted) throw AdminError.notFound('Thread Prefix', id);
		return { success: true };
	}

	/**
	 * Reorders prefixes within the same category/global scope.
	 * Accepts an array of prefix IDs in the desired order.
	 */
	async reorderPrefixes(prefixIds: number[]) {
		if (!prefixIds.length) return { success: true };

		// Fetch all prefixes involved to ensure same scope
		const records = await db.select().from(threadPrefixes).where(threadPrefixes.id.in(prefixIds));

		if (records.length !== prefixIds.length)
			throw AdminError.validation('One or more prefixes not found');

		// Use transaction to update positions
		await db.transaction(async (trx) => {
			for (let i = 0; i < prefixIds.length; i++) {
				await trx
					.update(threadPrefixes)
					.set({ position: i })
					.where(eq(threadPrefixes.id, prefixIds[i]));
			}
		});
		return { success: true };
	}
}

export const forumPrefixService = new ForumPrefixService();
