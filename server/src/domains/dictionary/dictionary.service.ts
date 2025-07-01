import { db } from '@db';
import { and, count, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { dictionaryEntries, dictionaryUpvotes, insertDictionaryEntrySchema } from '@schema';
import { XP_ACTIONS, xpLevelService } from '../../../services/xp-level-service';
import slugify from 'slugify';
import type { EntryId } from '@/db/types';

export const DictionaryStatus = {
	PENDING: 'pending',
	APPROVED: 'approved',
	REJECTED: 'rejected'
} as const;

export class DictionaryService {
	/** Fetch paginated entries with optional filters */
	static async list(params: {
		page?: number;
		limit?: number;
		search?: string;
		status?: string;
		tag?: string;
		authorId?: string;
		sort?: 'newest' | 'oldest' | 'popular' | 'alphabetical';
	}) {
		const page = params.page ?? 1;
		const limit = params.limit ?? 20;
		const offset = (page - 1) * limit;

		const whereClauses: any[] = [];

		if (params.status && params.status !== 'all') {
			whereClauses.push(eq(dictionaryEntries.status, params.status));
		}
		if (params.search) {
			const q = `%${params.search}%`;
			whereClauses.push(
				or(ilike(dictionaryEntries.word, q), ilike(dictionaryEntries.definition, q))
			);
		}
		if (params.tag) {
			// Simple includes using @> for Postgres array contains
			whereClauses.push(sql`${dictionaryEntries.tags} @> ARRAY[${params.tag}]`);
		}
		if (params.authorId) {
			whereClauses.push(eq(dictionaryEntries.authorId, params.authorId));
		}

		const orderBy = (() => {
			switch (params.sort) {
				case 'oldest':
					return [dictionaryEntries.createdAt];
				case 'popular':
					return [desc(dictionaryEntries.upvoteCount)];
				case 'alphabetical':
					return [dictionaryEntries.word];
				case 'newest':
				default:
					return [desc(dictionaryEntries.createdAt)];
			}
		})();

		const entries = await db
			.select()
			.from(dictionaryEntries)
			.where(whereClauses.length ? and(...whereClauses) : undefined)
			.orderBy(...orderBy)
			.limit(limit)
			.offset(offset);

		const total = await db
			.select({ count: count() })
			.from(dictionaryEntries)
			.where(whereClauses.length ? and(...whereClauses) : undefined);

		return { entries, total: total[0]?.count ?? 0 };
	}

	/** Fetch single entry by slug */
	static async getBySlug(slug: string) {
		const [entry] = await db
			.select()
			.from(dictionaryEntries)
			.where(eq(dictionaryEntries.slug, slug))
			.limit(1);
		return entry;
	}

	/** Create a new dictionary entry */
	static async create(data: unknown & { authorId: string }) {
		const parsed = insertDictionaryEntrySchema.parse(data);
		const slugBase = slugify(parsed.word);

		// Ensure slug uniqueness by appending a numeric suffix if needed
		let slug = slugBase;
		let counter = 1;
		while (true) {
			const existing = await db
				.select({ id: dictionaryEntries.id })
				.from(dictionaryEntries)
				.where(eq(dictionaryEntries.slug, slug))
				.limit(1);
			if (existing.length === 0) break;
			slug = `${slugBase}-${counter++}`;
		}

		const [inserted] = await db
			.insert(dictionaryEntries)
			.values({
				...parsed,
				slug,
				authorId: data.authorId
			})
			.returning();

		// Award XP to author
		await xpLevelService.awardXp(
			data.authorId as unknown as number,
			XP_ACTIONS.DICTIONARY_ENTRY_SUBMITTED
		);

		return inserted;
	}

	/** Approve or reject entry (moderation) */
	static async moderate(entryId: EntryId, status: 'approved' | 'rejected', approverId: string) {
		const [updated] = await db
			.update(dictionaryEntries)
			.set({ status, approverId, updatedAt: new Date() })
			.where(eq(dictionaryEntries.id, entryId))
			.returning();

		if (status === 'approved') {
			// Award XP to author & moderator
			if (updated) {
				await Promise.all([
					xpLevelService.awardXp(
						updated.authorId as unknown as number,
						XP_ACTIONS.DICTIONARY_ENTRY_APPROVED
					),
					xpLevelService.awardXp(
						approverId as unknown as number,
						XP_ACTIONS.DICTIONARY_ENTRY_APPROVAL
					)
				]);
			}
		}
		return updated;
	}

	/** Upvote toggle */
	static async toggleUpvote(entryId: EntryId, userId: string) {
		// Check existing
		const existing = await db
			.select()
			.from(dictionaryUpvotes)
			.where(and(eq(dictionaryUpvotes.entryId, entryId), eq(dictionaryUpvotes.userId, userId)))
			.limit(1);

		let upvoted = false;

		await db.transaction(async (tx) => {
			if (existing.length) {
				// Remove upvote
				await tx.delete(dictionaryUpvotes).where(eq(dictionaryUpvotes.id, existing[0].id));
				await tx
					.update(dictionaryEntries)
					.set({ upvoteCount: sql`${dictionaryEntries.upvoteCount} - 1` })
					.where(eq(dictionaryEntries.id, entryId));
			} else {
				// Add upvote
				await tx.insert(dictionaryUpvotes).values({ entryId, userId });
				await tx
					.update(dictionaryEntries)
					.set({ upvoteCount: sql`${dictionaryEntries.upvoteCount} + 1` })
					.where(eq(dictionaryEntries.id, entryId));
				upvoted = true;
			}
		});

		if (upvoted) {
			const [entry] = await db
				.select({ authorId: dictionaryEntries.authorId })
				.from(dictionaryEntries)
				.where(eq(dictionaryEntries.id, entryId))
				.limit(1);
			if (entry) {
				await xpLevelService.awardXp(
					entry.authorId as unknown as number,
					XP_ACTIONS.DICTIONARY_ENTRY_UPVOTED
				);
			}
		}

		return { upvoted };
	}
}
