import { ROUTES } from '@/constants/routes';

/**
 * Forum URL generation utilities for the hierarchical structure
 */

export interface ForumContext {
  id: number;
  slug: string;
  name: string;
}

export interface ZoneContext {
  id: number;
  slug: string;
  name: string;
}

/**
 * Generates the correct URL for a forum based on its context
 */
export function generateForumUrl(
  zone: ZoneContext,
  forum: ForumContext,
  parentForum?: ForumContext
): string {
  if (parentForum) {
    // This is a subforum
    return ROUTES.SUBFORUM(zone.slug, parentForum.slug, forum.slug);
  } else {
    // This is a direct forum under zone
    return ROUTES.FORUM(zone.slug, forum.slug);
  }
}

/**
 * Generates the create thread URL for a forum
 */
export function generateCreateThreadUrl(
  zone: ZoneContext,
  forum: ForumContext,
  parentForum?: ForumContext
): string {
  if (parentForum) {
    // Create thread in subforum
    return ROUTES.CREATE_THREAD_IN_SUBFORUM(zone.slug, parentForum.slug, forum.slug);
  } else {
    // Create thread in direct forum
    return ROUTES.CREATE_THREAD_IN_FORUM(zone.slug, forum.slug);
  }
}

/**
 * Generates zone URL
 */
export function generateZoneUrl(zone: ZoneContext): string {
  return ROUTES.ZONE(zone.slug);
}

/**
 * Parses a hierarchical forum URL to extract zone, forum, and subforum
 */
export function parseForumUrl(pathname: string): {
  zoneSlug?: string;
  forumSlug?: string;
  subforumSlug?: string;
  isCreateThread?: boolean;
} {
  // Match patterns:
  // /zones/{zone}
  // /zones/{zone}/{forum}
  // /zones/{zone}/{forum}/{subforum}
  // /zones/{zone}/{forum}/create
  // /zones/{zone}/{forum}/{subforum}/create
  
  const zoneMatch = pathname.match(/^\/zones\/([^\/]+)(?:\/(.+))?$/);
  if (!zoneMatch) return {};
  
  const zoneSlug = zoneMatch[1];
  const remainder = zoneMatch[2];
  
  if (!remainder) {
    // Just /zones/{zone}
    return { zoneSlug };
  }
  
  if (remainder === 'create') {
    // /zones/{zone}/create - shouldn't happen but handle gracefully
    return { zoneSlug, isCreateThread: true };
  }
  
  const parts = remainder.split('/');
  
  if (parts.length === 1) {
    // /zones/{zone}/{forum}
    return { zoneSlug, forumSlug: parts[0] };
  }
  
  if (parts.length === 2) {
    if (parts[1] === 'create') {
      // /zones/{zone}/{forum}/create
      return { zoneSlug, forumSlug: parts[0], isCreateThread: true };
    } else {
      // /zones/{zone}/{forum}/{subforum}
      return { zoneSlug, forumSlug: parts[0], subforumSlug: parts[1] };
    }
  }
  
  if (parts.length === 3 && parts[2] === 'create') {
    // /zones/{zone}/{forum}/{subforum}/create
    return { 
      zoneSlug, 
      forumSlug: parts[0], 
      subforumSlug: parts[1], 
      isCreateThread: true 
    };
  }
  
  // Fallback for unrecognized patterns
  return { zoneSlug };
}

/**
 * Determines if a URL represents a legacy forum URL that needs redirecting
 */
export function isLegacyForumUrl(pathname: string): boolean {
  return pathname.startsWith('/forums/') || pathname.startsWith('/forum/');
}

/**
 * Extracts the forum slug from a legacy URL
 */
export function extractLegacyForumSlug(pathname: string): string | null {
  const match = pathname.match(/^\/(forums?|forum)\/([^\/]+)/);
  return match ? match[2] : null;
}