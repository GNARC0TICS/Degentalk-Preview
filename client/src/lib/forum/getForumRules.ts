/**
 * @deprecated Use useForumStructure().getForum(slug)?.rules instead
 * This function is kept for backward compatibility but will be removed.
 * Prefer using the ForumStructureContext for dynamic forum rules.
 */

import type { AdminId } from '@shared/types/ids';
import type { MergedRules } from '@/features/forum/contexts/ForumStructureContext';
import { logger } from '@/lib/logger';

// This function is deprecated - use ForumStructureContext instead
export function getForumRules(forumSlug: AdminId): MergedRules | undefined {
	logger.warn('GetForumRules', 'getForumRules() is deprecated. Use useForumStructure().getForum(slug)?.rules instead');
	// Return undefined to force migration to context-based approach
	return undefined;
}

// Export the type for backward compatibility
export type { MergedRules as ForumRules }; 