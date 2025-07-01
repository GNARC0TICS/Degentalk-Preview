import type { AdminId } from '@db/types';
import { getForumRules } from './getForumRules';

export function shouldAwardXP(forumSlug: AdminId): boolean {
	const rules = getForumRules(forumSlug);
	return !!rules?.xpEnabled;
}
