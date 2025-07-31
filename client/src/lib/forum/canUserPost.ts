import type { AdminId } from '@shared/types/ids';
import { getForumRules } from './getForumRules.js';

export type User = {
	id: string;
	role: 'user' | 'moderator' | 'admin';
	level?: number;
	isRegistered?: boolean;
};

export function canUserPost(forumSlug: string, user: User): boolean {
	const rules = getForumRules(forumSlug as AdminId);
	if (!rules) return false;
	if (!rules.allowPosting) return false;
	switch (rules.accessLevel) {
		case 'public':
			return true;
		case 'registered':
			return !!user.isRegistered;
		case 'level_10+':
			return (user.level ?? 0) >= 10;
		case 'moderator':
			return user.role === 'moderator' || user.role === 'admin';
		case 'admin':
			return user.role === 'admin';
		default:
			return true;
	}
} 