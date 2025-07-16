import type { AdminId } from '@shared/types/ids';
import { getForumRules } from './getForumRules.js';

export function getAvailablePrefixes(forumSlug: string): string[] {
	const rules = getForumRules(forumSlug);
	return rules?.availablePrefixes ?? [];
}
