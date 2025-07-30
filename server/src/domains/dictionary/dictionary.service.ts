import { db } from '@degentalk/db';
import { and, count, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { dictionaryEntries, dictionaryUpvotes, insertDictionaryEntrySchema } from '@schema';
import { DictionaryRepository } from './repositories/dictionary.repository';
import { XP_ACTION } from '../xp/xp-actions';
import { xpService } from '../xp/xp.service';
import slugify from 'slugify';
import type { EntryId } from '@shared/types/ids';

export const DictionaryStatus = {
	PENDING: 'pending',
	APPROVED: 'approved',
	REJECTED: 'rejected'
} as const;

// Initialize repository instance
const dictionaryRepo = new DictionaryRepository();

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
		// For simple cases with no complex filtering, use repository method
		if (!params.status && !params.tag && !params.authorId && !params.sort) {
			const page = params.page ?? 1;
			const limit = params.limit ?? 20;
			const offset = (page - 1) * limit;
			
			const entries = await dictionaryRepo.findAll({ 
				limit, 
				offset, 
				search: params.search 
			});
			const total = await dictionaryRepo.getCount();
			
			return { entries, total };
		}

		// For complex filtering, maintain existing direct DB access logic
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
		const result = await dictionaryRepo.findBySlug(slug);
		return result?.entry || null;
	}

	/** Create a new dictionary entry */
	static async create(data: unknown & { authorId: string }) {
		const parsed = insertDictionaryEntrySchema.parse(data);
		const slugBase = slugify(parsed.word);

		// Ensure slug uniqueness by appending a numeric suffix if needed
		let slug = slugBase;
		let counter = 1;
		while (true) {
			const existing = await dictionaryRepo.findBySlug(slug);
			if (!existing) break;
			slug = `${slugBase}-${counter++}`;
		}

		const inserted = await dictionaryRepo.create({
			...parsed,
			slug,
			authorId: data.authorId
		});

		// Award XP to author
		await xpService.awardXp(
			data.authorId as unknown as number,
			XP_ACTION.DICTIONARY_ENTRY_SUBMITTED
		);

		return inserted;
	}

	/** Approve or reject entry (moderation) */
	static async moderate(entryId: EntryId, status: 'approved' | 'rejected', approverId: string) {
		const updated = await dictionaryRepo.update(entryId, { 
			status, 
			approverId, 
			updatedAt: new Date() 
		});

		if (status === 'approved') {
			// Award XP to author & moderator
			if (updated) {
				await Promise.all([
					xpService.awardXp(
						updated.authorId as unknown as number,
						XP_ACTION.DICTIONARY_ENTRY_APPROVED
					),
					xpService.awardXp(
						approverId as unknown as number,
						XP_ACTION.DICTIONARY_ENTRY_APPROVAL
					)
				]);
			}
		}
		return updated;
	}

	/** Upvote toggle */
	static async toggleUpvote(entryId: EntryId, userId: string) {
		// Check if user has already upvoted
		const hasUpvoted = await dictionaryRepo.hasUserUpvoted(entryId, userId);

		let upvoted = false;

		if (hasUpvoted) {
			// Remove upvote
			await dictionaryRepo.removeUpvote(entryId, userId);
			upvoted = false;
		} else {
			// Add upvote
			await dictionaryRepo.addUpvote(entryId, userId);
			upvoted = true;
			
			// Award XP to entry author
			const entry = await dictionaryRepo.findById(entryId);
			if (entry?.entry) {
				await xpService.awardXp(
					entry.entry.authorId as unknown as number,
					XP_ACTION.DICTIONARY_ENTRY_UPVOTED
				);
			}
		}

		return { upvoted };
	}
}
