import type { AdminId } from '@shared/types/ids';
import { getForumRules } from './getForumRules';

export type ThreadEngagementStats = {
	replies: number;
	likes: number;
};

export function prefixEngine(forumSlug: AdminId, stats: ThreadEngagementStats): AdminId[] {
	const rules = getForumRules(forumSlug);
	if (!rules?.prefixGrantRules) return [];
	return rules.prefixGrantRules
		.filter(
			(rule) =>
				rule.autoAssign &&
				(!rule.condition?.minReplies || stats.replies >= rule.condition.minReplies) &&
				(!rule.condition?.minLikes || stats.likes >= rule.condition.minLikes)
		)
		.map((rule) => rule.slug);
}
