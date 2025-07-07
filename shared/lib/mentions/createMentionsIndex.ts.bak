import { db } from '@/lib/db';
import { mentionsIndex } from '@db/schema';
import type { UserId } from '@shared/types';

/**
 * Creates mentions index entries for discovered mentions in content
 */
export async function createMentionsIndex(params: {
	sourceType: 'thread' | 'post' | 'shout';
	sourceId: string;
	userIds: UserId[];
	triggeredBy?: UserId | null;
}): Promise<number> {
	const { sourceType, sourceId, userIds, triggeredBy } = params;

	// Filter out null/undefined IDs
	const validIds = userIds.filter((id): id is UserId => !!id);

	if (validIds.length === 0) return 0;

	const rows = validIds.map((uid) => ({
		sourceType,
		sourceId,
		mentioningUserId: triggeredBy ?? null,
		mentionedUserId: uid
	}));

	const result = await db.insert(mentionsIndex).values(rows);
	return result.length;
}
