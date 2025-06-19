import { getForumRules } from './getForumRules';

export type User = {
	id: string;
	role: 'user' | 'mod' | 'admin';
	level?: number;
	isRegistered?: boolean;
};

export function canUserPost(forumSlug: string, user: User): boolean {
	const rules = getForumRules(forumSlug);
	if (!rules) return false;
	if (!rules.allowPosting) return false;
	switch (rules.accessLevel) {
		case 'public':
			return true;
		case 'registered':
			return !!user.isRegistered;
		case 'level_10+':
			return (user.level ?? 0) >= 10;
		case 'mod':
			return user.role === 'mod' || user.role === 'admin';
		case 'admin':
			return user.role === 'admin';
		default:
			return true;
	}
}
