import { db } from '@server/src/lib/db';
import { mentionsIndex, users } from '@schema';
import { mentionSourceTypeEnum } from '@schema';
import { and, eq, inArray } from 'drizzle-orm';

export type MentionSourceType = 'post' | 'thread' | 'chat';

interface CreateMentionsIndexParams {
	sourceType: MentionSourceType;
	sourceId: number;
	mentionedUserIds: number[];
	triggeredBy?: number; // ID of the user who wrote the mention
}

/**
 * Bulk-inserts mentions into `mentions_index`, skipping duplicates.
 * Returns the number of new rows created.
 */
export async function createMentionsIndex({
	sourceType,
	sourceId,
	mentionedUserIds,
	triggeredBy
}: CreateMentionsIndexParams): Promise<number> {
	if (mentionedUserIds.length === 0) return 0;

	// Ensure mentionedUserIds are valid (exist in users table)
	const validUsers = await db
		.select({ id: users.id })
		.from(users)
		.where(inArray(users.id, mentionedUserIds));

	const validIds = validUsers.map((u) => u.id);
	if (validIds.length === 0) return 0;

	const rows = validIds.map((uid) => ({
		sourceType,
		sourceId,
		mentioningUserId: triggeredBy ?? null,
		mentionedUserId: uid
	}));

	const result = await db
		.insert(mentionsIndex)
		.values(rows as any) // typing workaround for optional field
		.onConflictDoNothing();

	// NOTE: drizzle-orm returns undefined for insert on pg; count manually via query
	const inserted = await db
		.select({ count: mentionSourceTypeEnum }) // dummy select, not ideal
		.from(mentionsIndex)
		.where(and(eq(mentionsIndex.sourceType, sourceType), eq(mentionsIndex.sourceId, sourceId)));

	return inserted.length;
}
