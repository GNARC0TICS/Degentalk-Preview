import { getForumRules } from './getForumRules';

export function shouldAwardXP(forumSlug: string): boolean {
  const rules = getForumRules(forumSlug);
  return !!rules?.xpEnabled;
} 