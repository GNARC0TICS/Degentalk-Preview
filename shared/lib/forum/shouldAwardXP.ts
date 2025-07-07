import type { AdminId } from '@shared/types/ids';
import { getForumRules } from './getForumRules';

export function shouldAwardXP(forumSlug: AdminId): boolean {
	const rules = getForumRules(forumSlug);
	return !!rules?.xpEnabled;
}
