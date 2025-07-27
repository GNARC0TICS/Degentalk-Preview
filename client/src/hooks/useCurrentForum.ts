import { useParams } from 'react-router-dom';
import { useForumStructure } from '@/features/forum/contexts/ForumStructureContext';
import type { MergedForum } from '@/features/forum/contexts/ForumStructureContext';

/**
 * Hook to get the current forum context from URL parameters
 * 
 * Returns the current forum based on the URL slug, or undefined if not in a forum context
 * Follows the same pattern used in ForumPage.tsx
 */
export function useCurrentForum() {
  const params = useParams<{ 
    zoneSlug?: string; 
    forumSlug?: string; 
    subforumSlug?: string 
  }>();
  
  const forumSlug = params?.subforumSlug || params?.forumSlug;
  const { getForum, zones, forumsById } = useForumStructure();
  
  // Get forum data with error handling (same logic as ForumPage.tsx)
  let forum: MergedForum | undefined = undefined;
  
  try {
    // Try to find the forum by slug in child forums first
    forum = forumSlug ? getForum(forumSlug) : undefined;

    // If not found, check top-level forums (stored in zones)
    if (!forum && forumSlug) {
      forum = zones.find((f) => f.slug === forumSlug);
    }

    // If still not found, search all forums by ID
    if (!forum && forumSlug) {
      forum = Object.values(forumsById).find((f) => f.slug === forumSlug);
    }
  } catch (error) {
    // Silent error handling - return undefined for graceful degradation
    console.warn('Failed to get current forum:', error);
  }
  
  return {
    forum,
    forumSlug,
    forumId: forum?.id,
    zoneSlug: params?.zoneSlug,
    isSubforum: !!params?.subforumSlug,
    isInForum: !!forumSlug,
    isInZone: !!params?.zoneSlug
  };
} 