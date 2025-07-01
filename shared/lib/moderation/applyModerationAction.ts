import type { AdminId } from '@db/types';
import { db } from '@server/src/lib/db';
import { eq } from 'drizzle-orm';
import { threads, posts, contentModerationActions } from '@schema';
import type { AdminId, ModeratorId } from '@/db/types';

export type VisibilityStatus =
	| 'draft'
	| 'published'
	| 'hidden'
	| 'shadowbanned'
	| 'archived'
	| 'deleted';

interface ApplyModerationActionParams {
	moderatorId: ModeratorId;
	targetType: 'thread' | 'post';
	targetId: number;
	newVisibility: VisibilityStatus;
	reason: string;
}

/**
 * Applies a moderation action by updating the visibility of the target content
 * and logging the action to `admin.content_moderation_actions`.
 *
 * This helper should be used by all moderation endpoints/services to ensure
 * audit trails remain consistent.
 */
export async function applyModerationAction({
	moderatorId,
	targetType,
	targetId,
	newVisibility,
	reason
}: ApplyModerationActionParams): Promise<void> {
	// 1) Update inline visibility + reason
	if (targetType === 'thread') {
		await db
			.update(threads)
			.set({
				visibilityStatus: newVisibility,
				moderationReason: reason
			})
			.where(eq(threads.id, targetId));
	} else {
		await db
			.update(posts)
			.set({
				visibilityStatus: newVisibility,
				moderationReason: reason
			})
			.where(eq(posts.id, targetId));
	}

	// 2) Insert audit log
	await db.insert(contentModerationActions).values({
		moderatorId,
		contentType: targetType,
		contentId: targetId,
		actionType: 'visibility_change',
		reason,
		additionalData: { newVisibility }
	});
}
