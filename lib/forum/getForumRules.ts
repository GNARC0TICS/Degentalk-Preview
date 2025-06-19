import { forumMap, ForumRules } from '@/config/forumMap.config';

export function getForumRules(forumSlug: string): ForumRules | undefined {
	for (const zone of forumMap.zones) {
		for (const forum of zone.forums) {
			if (forum.slug === forumSlug) {
				return forum.rules;
			}
		}
	}
	return undefined;
}
