import { db } from '@db';
import { mentionsIndex } from '@schema';
import { eq, and, desc } from 'drizzle-orm';
import { logger } from '@core/logger';
import type { UserId } from '@shared/types/ids';

interface CreateMentionsIndexParams {
	sourceType: 'thread' | 'post' | 'shout';
	sourceId: string;
	userIds: UserId[];
	triggeredBy?: UserId | null;
}

/**
 * Server-side service for mentions index operations
 */
export class MentionsIndexService {
	/**
	 * Creates mentions index entries for discovered mentions in content
	 */
	static async createMentionsIndex(params: CreateMentionsIndexParams): Promise<number> {
		const { sourceType, sourceId, userIds, triggeredBy } = params;

		try {
			logger.info('MENTIONS_INDEX', 'Creating mentions index entries', {
				sourceType,
				sourceId,
				userCount: userIds.length,
				triggeredBy
			});

			// Filter out null/undefined IDs
			const validIds = userIds.filter((id): id is UserId => !!id);

			if (validIds.length === 0) {
				logger.warn('MENTIONS_INDEX', 'No valid user IDs provided', { params });
				return 0;
			}

			const rows = validIds.map((uid) => ({
				sourceType,
				sourceId,
				mentioningUserId: triggeredBy ?? null,
				mentionedUserId: uid
			}));

			const result = await db.insert(mentionsIndex).values(rows);

			logger.info('MENTIONS_INDEX', 'Successfully created mentions index entries', {
				sourceType,
				sourceId,
				entriesCreated: result.length
			});

			return result.length;
		} catch (error) {
			logger.error('MENTIONS_INDEX', 'Error creating mentions index', {
				error,
				sourceType,
				sourceId,
				userCount: userIds.length
			});
			return 0;
		}
	}

	/**
	 * Get mentions index entries for a specific source
	 */
	static async getMentionsForSource(sourceType: string, sourceId: string) {
		try {
			const mentions = await db
				.select()
				.from(mentionsIndex)
				.where(
					and(
						eq(mentionsIndex.sourceType, sourceType),
						eq(mentionsIndex.sourceId, sourceId)
					)
				);

			return mentions;
		} catch (error) {
			logger.error('MENTIONS_INDEX', 'Error getting mentions for source', {
				error,
				sourceType,
				sourceId
			});
			return [];
		}
	}

	/**
	 * Remove mentions index entries for a specific source
	 */
	static async removeMentionsForSource(sourceType: string, sourceId: string): Promise<boolean> {
		try {
			await db
				.delete(mentionsIndex)
				.where(
					and(
						eq(mentionsIndex.sourceType, sourceType),
						eq(mentionsIndex.sourceId, sourceId)
					)
				);

			logger.info('MENTIONS_INDEX', 'Successfully removed mentions for source', {
				sourceType,
				sourceId
			});

			return true;
		} catch (error) {
			logger.error('MENTIONS_INDEX', 'Error removing mentions for source', {
				error,
				sourceType,
				sourceId
			});
			return false;
		}
	}

	/**
	 * Get all mentions for a specific user
	 */
	static async getMentionsForUser(userId: UserId, limit = 50, offset = 0) {
		try {
			const mentions = await db
				.select()
				.from(mentionsIndex)
				.where(eq(mentionsIndex.mentionedUserId, userId))
				.limit(limit)
				.offset(offset)
				.orderBy(desc(mentionsIndex.createdAt));

			return mentions;
		} catch (error) {
			logger.error('MENTIONS_INDEX', 'Error getting mentions for user', {
				error,
				userId
			});
			return [];
		}
	}
}