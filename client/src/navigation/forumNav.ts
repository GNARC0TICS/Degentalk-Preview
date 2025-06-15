import type { LucideIcon } from 'lucide-react';
import { LayoutGrid } from 'lucide-react'; // For "All Content"
import type { MergedZone, MergedForum, MergedTheme } from '@/contexts/ForumStructureContext';
// NOTE: Removed direct import of ZONE_THEMES. Icons will be resolved at render time via useForumTheme.
import { getForumEntityUrl } from '@/utils/forum-routing-helper'; // Assuming this helper provides correct URLs

export interface NavNode {
  id: string; // Using slug as a unique ID
  name: string;
  slug: string;
  href: string;
  type: 'primaryZone' | 'generalCategory' | 'forum' | 'systemLink';
  iconComponent?: LucideIcon;
  iconEmoji?: string | null;
  theme?: MergedTheme; // Retaining theme from MergedZone/Forum for flexibility
  semanticThemeKey?: string | null; // e.g., 'pit', 'mission' for ZONE_THEMES lookup
  children: NavNode[];
  entityData?: MergedZone | MergedForum; // Original entity data
  counts?: { forums?: number; threads?: number; posts?: number };
  isCanonical?: boolean; // To flag primary zones
}

export function buildNavigationTree(
  zones: MergedZone[],
  // forumsRecord: Record<string, MergedForum> // May not be needed if MergedZone contains all forum details
): NavNode[] {
  const navigationTree: NavNode[] = [];

  // 1. Add "All Content" link
  navigationTree.push({
    id: 'all-content',
    name: 'All Content',
    slug: 'all', // A conventional slug
    href: '/forums', // Or a more specific "all content" page if exists
    type: 'systemLink',
    iconComponent: LayoutGrid,
    semanticThemeKey: 'default', // Apply a default theme
    children: [],
    counts: {}, // Could aggregate total counts if available
  });

  const primaryZones = zones.filter(z => z.canonical === true);
  const generalCategories = zones.filter(z => z.canonical !== true && z.forums && z.forums.length > 0);

  // 2. Process Primary Zones
  primaryZones.forEach(zone => {
    navigationTree.push({
      id: zone.slug,
      name: zone.name,
      slug: zone.slug,
      href: `/zones/${zone.slug}`, // Assuming URL structure
      type: 'primaryZone',
      iconEmoji: zone.icon,
      // iconComponent will now be resolved in NavItem via useForumTheme;
      iconComponent: undefined,
      theme: zone.theme,
      semanticThemeKey: zone.colorTheme,
      children: [], // Primary zones in HierarchicalZoneNav are direct links, no children shown in that style
      entityData: zone,
      counts: { threads: zone.threadCount, posts: zone.postCount },
      isCanonical: true,
    });
  });

  // 3. Process General Categories and their Forums
  generalCategories.forEach(category => {
    const categoryNode: NavNode = {
      id: category.slug,
      name: category.name,
      slug: category.slug,
      href: `/zones/${category.slug}`, // URL for the category itself
      type: 'generalCategory',
      iconEmoji: category.icon,
      // iconComponent resolved in NavItem
      iconComponent: undefined,
      theme: category.theme,
      semanticThemeKey: category.colorTheme,
      children: [],
      entityData: category,
      counts: { forums: category.forums?.length, threads: category.threadCount, posts: category.postCount },
      isCanonical: false,
    };

    if (category.forums) {
      category.forums.forEach(forum => {
        categoryNode.children.push({
          id: forum.slug,
          name: forum.name,
          slug: forum.slug,
          href: getForumEntityUrl(forum), // Use helper for forum URLs
          type: 'forum',
          iconEmoji: forum.icon,
          // iconComponent resolved in NavItem
          iconComponent: undefined,
          theme: forum.theme,
          semanticThemeKey: forum.colorTheme,
          children: [],
          entityData: forum,
          counts: { threads: forum.threadCount, posts: forum.postCount },
        });
      });
    }
    navigationTree.push(categoryNode);
  });

  return navigationTree;
}
