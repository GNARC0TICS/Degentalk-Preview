import type { AdminId } from '@db/types';
import { getForumRules } from './getForumRules';

export function getAvailablePrefixes(forumSlug: string): string[] {
	const rules = getForumRules(forumSlug);
	return rules?.availablePrefixes ?? [];
}
