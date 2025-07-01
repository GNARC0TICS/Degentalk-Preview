import type { AdminId } from '@db/types';
/**
 * @deprecated Use useForumStructure().getForum(slug)?.rules instead
 * This function is kept for backward compatibility but will be removed.
 * Prefer using the ForumStructureContext for dynamic forum rules.
 */

import type { MergedRules } from '@/contexts/ForumStructureContext';

// This function is deprecated - use ForumStructureContext instead
export function getForumRules(forumSlug: AdminId): MergedRules | undefined {
	console.warn(
		'getForumRules() is deprecated. Use useForumStructure().getForum(slug)?.rules instead'
	);
	// Return undefined to force migration to context-based approach
	return undefined;
}

// Export the type for backward compatibility
export type { MergedRules as ForumRules };
