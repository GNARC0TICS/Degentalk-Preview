import type { LucideProps } from 'lucide-react';
import { LayoutGrid } from 'lucide-react'; // For "All Content"
import type { MergedZone, MergedForum, MergedTheme } from '@/contexts/ForumStructureContext';
// NOTE: Removed direct import of ZONE_THEMES. Icons will be resolved at render time via useForumTheme.
import { getForumEntityUrl } from '@/utils/forum-routing-helper'; // Assuming this helper provides correct URLs
import type { ComponentType } from 'react';

type LucideIcon = ComponentType<LucideProps>;

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

  const primaryZonesFromFilter = zones.filter(z => z.isPrimary === true); // Renamed to avoid conflict
  const generalZonesFromFilter = zones.filter(z => z.isPrimary === false); // Renamed to avoid conflict

// Helper function to process a forum and its potential subforums recursively
function processForumRecursive(
  forum: MergedForum, 
  parentTheme?: MergedTheme, // Theme from parent zone or parent forum
  parentSemanticThemeKey?: string | null
): NavNode {
  const forumNode: NavNode = {
    id: forum.slug, // Use slug as ID for NavNode
    name: forum.name,
    slug: forum.slug,
    href: getForumEntityUrl(forum), // Flat URL: /forums/[slug]
    type: 'forum', // Type remains 'forum' for both parent forums and subforums
    iconEmoji: forum.theme?.icon || parentTheme?.icon, // Prioritize forum's own theme icon
    iconComponent: undefined, // Resolved at render time by NavItem using theme context
    theme: forum.theme || parentTheme, // Forum's merged theme, fallback to parent's
    semanticThemeKey: forum.theme?.colorTheme || parentSemanticThemeKey,
    children: [], // Initialize children for subforums
    entityData: forum,
    // Stats: parent forums will have rolled-up stats from service, subforums their direct stats
    counts: { threads: forum.threadCount, posts: forum.postCount },
  };

  // Recursively process subforums (only one level deep as per decision)
  if (forum.forums && forum.forums.length > 0) { // forum.forums is the subForums array from MergedForum
    forum.forums.forEach(subForum => {
      // Pass down the current forum's effective theme as a fallback for the subforum
      const currentForumEffectiveTheme = forum.theme || parentTheme;
      const currentForumEffectiveSemanticKey = forum.theme?.colorTheme || parentSemanticThemeKey;
      // For subforums, their 'parentTheme' is the theme of the 'forum' they are under.
      forumNode.children.push(processForumRecursive(subForum, currentForumEffectiveTheme, currentForumEffectiveSemanticKey));
    });
  }
  return forumNode;
}

// Original buildNavigationTree starts here, ensure no duplication
// The previous export function buildNavigationTree was duplicated. This is the correct start.
// Note: The filter for primaryZones and generalCategories was outside this function in the erroneous version.
// It should use the 'zones' parameter passed to this function.

  // isPrimary flag should be available on MergedZone from ForumStructureContext
  // const primaryZones = zones.filter(z => z.isPrimary === true); // This was part of the duplicated block
  // const generalZones = zones.filter(z => z.isPrimary === false); // This was part of the duplicated block

  // 2. Process Primary Zones
  primaryZonesFromFilter.forEach(zone => { // Use renamed variable
    const zoneNode: NavNode = {
      id: zone.slug,
      name: zone.name,
      slug: zone.slug,
      href: `/zones/${zone.slug}`, 
      type: 'primaryZone', // Keep distinct type for now, or use 'zone' with isPrimary flag
      iconEmoji: zone.theme?.icon,
      iconComponent: undefined,
      theme: zone.theme,
      semanticThemeKey: zone.theme?.colorTheme,
      children: [], 
      entityData: zone,
      counts: { threads: zone.threadCount, posts: zone.postCount }, // Aggregated counts from service
      isCanonical: zone.canonical, // Use canonical from MergedZone if available, or isPrimary
    };

    if (zone.forums && zone.forums.length > 0) { // These are top-level/parent forums
      zone.forums.forEach(parentForum => {
        zoneNode.children.push(processForumRecursive(parentForum, zone.theme, zone.theme?.colorTheme));
      });
    }
    navigationTree.push(zoneNode);
  });

  // 3. Process General Zones (previously generalCategories)
  generalZonesFromFilter.forEach(zone => { // Use renamed variable and ensure 'zone' is the correct term
    const zoneNode: NavNode = {
      id: zone.slug,
      name: zone.name,
      slug: zone.slug,
      href: `/zones/${zone.slug}`, 
      type: 'generalCategory', // This type distinguishes rendering in HierarchicalZoneNav. Consider if 'zone' with a flag is better.
      iconEmoji: zone.theme?.icon,
      iconComponent: undefined,
      theme: zone.theme,
      semanticThemeKey: zone.theme?.colorTheme,
      children: [],
      entityData: zone,
      counts: { forums: zone.forums?.length, threads: zone.threadCount, posts: zone.postCount }, // Aggregated counts
      isCanonical: zone.canonical, // Use canonical from MergedZone
    };

    if (zone.forums && zone.forums.length > 0) { // These are top-level/parent forums
      zone.forums.forEach(parentForum => {
        zoneNode.children.push(processForumRecursive(parentForum, zone.theme, zone.theme?.colorTheme));
      });
    }
    navigationTree.push(zoneNode);
  });

  return navigationTree;
}
// The duplicated export function buildNavigationTree and its content below this line should be removed.
// The error "A function whose declared type is neither 'undefined', 'void', nor 'any' must return a value."
// was likely due to the processForumRecursive being defined *after* the first buildNavigationTree
// and the second buildNavigationTree (the duplicate) not having its filters (primaryZones, generalZones) defined correctly.
// By ensuring processForumRecursive is defined first, and only one buildNavigationTree exists, this should be resolved.
// The '}' expected error was due to the malformed structure from the duplication.
