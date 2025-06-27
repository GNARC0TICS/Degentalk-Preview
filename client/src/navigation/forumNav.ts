import type { LucideProps } from 'lucide-react';
import { LayoutGrid } from 'lucide-react'; // For "All Content"
import type { MergedZone, MergedForum, MergedTheme } from '@/contexts/ForumStructureContext';
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

export function buildNavigationTree(zones: MergedZone[]): NavNode[] {
	const navigationTree: NavNode[] = [];

	navigationTree.push({
		id: 'all-content',
		name: 'All Content',
		slug: 'all', // A conventional slug
		href: '/forums', // Or a more specific "all content" page if exists
		type: 'systemLink',
		iconComponent: LayoutGrid,
		semanticThemeKey: 'default', // Apply a default theme
		children: [],
		counts: {} // Could aggregate total counts if available
	});

	const primaryZonesFromFilter = zones.filter((z) => z.isPrimary === true); // Renamed to avoid conflict
	const generalZonesFromFilter = zones.filter((z) => z.isPrimary === false); // Renamed to avoid conflict

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
			counts: { threads: forum.threadCount, posts: forum.postCount }
		};

		if (forum.forums && forum.forums.length > 0) {
			forum.forums.forEach((subForum) => {
				const currentForumEffectiveTheme = forum.theme || parentTheme;
				const currentForumEffectiveSemanticKey = forum.theme?.colorTheme || parentSemanticThemeKey;
				forumNode.children.push(
					processForumRecursive(
						subForum,
						currentForumEffectiveTheme,
						currentForumEffectiveSemanticKey
					)
				);
			});
		}
		return forumNode;
	}

	primaryZonesFromFilter.forEach((zone) => {
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
			isCanonical: zone.canonical // Use canonical from MergedZone if available, or isPrimary
		};

		if (zone.forums && zone.forums.length > 0) {
			zone.forums.forEach((parentForum) => {
				zoneNode.children.push(
					processForumRecursive(parentForum, zone.theme, zone.theme?.colorTheme)
				);
			});
		}
		navigationTree.push(zoneNode);
	});

	generalZonesFromFilter.forEach((zone) => {
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
			isCanonical: zone.canonical // Use canonical from MergedZone
		};

		if (zone.forums && zone.forums.length > 0) {
			zone.forums.forEach((parentForum) => {
				zoneNode.children.push(
					processForumRecursive(parentForum, zone.theme, zone.theme?.colorTheme)
				);
			});
		}
		navigationTree.push(zoneNode);
	});

	return navigationTree;
}
