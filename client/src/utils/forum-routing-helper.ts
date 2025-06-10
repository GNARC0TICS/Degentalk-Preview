/**
 * Forum Routing Helper
 *
 * Utility functions for handling forum entity routing and type checking
 * based on the ForumFusion canonical structure.
 */

import { PrimaryZone } from '@/constants/primaryZones.tsx';

/**
 * Forum entity base type (zone, category, forum)
 */
export interface ForumEntityBase {
<<<<<<< HEAD
	id: number;
	name: string;
	slug: string;
	description?: string;
	isZone?: boolean;
	canonical?: boolean;
	parentId?: number | null;
	parentSlug?: string;
	parentName?: string;
	icon?: string;
	colorTheme?: string;
	threadCount?: number;
	postCount?: number;
	canHaveThreads?: boolean;
	position?: number;
=======
  id: number;
  name: string;
  slug: string;
  description?: string;
  isZone?: boolean; // Potentially deprecated in favor of forum_type
  canonical?: boolean; // Potentially deprecated in favor of forum_type
  forum_type?: 'primary' | 'general' | 'merged' | 'deprecated'; // New field
  parentId?: number | null;
  parentSlug?: string;
  parentName?: string;
  icon?: string;
  colorTheme?: string;
  threadCount?: number;
  postCount?: number;
  canHaveThreads?: boolean;
  position?: number;
>>>>>>> e9161f07a590654bde699619fdc9d26a47d0139a
}

/**
 * Forum entity types
 */
export type ForumEntityType = 'primary' | 'general' | 'merged' | 'deprecated' | 'category' | 'child-forum' | 'unknown';

/**
 * Type guard to check if object is a PrimaryZone
 */
export function isPrimaryZoneObject(obj: any): obj is PrimaryZone {
  return obj && typeof obj === 'object' && 
         typeof obj.id === 'string' && 
         typeof obj.label === 'string' && 
         typeof obj.slug === 'string' &&
         obj.displayPriority !== undefined;
}

/**
 * Centralized entity classification
 */
export function getForumEntityType(entity: ForumEntityBase): ForumEntityType {
<<<<<<< HEAD
	if (entity.isZone && entity.canonical) return 'primary-zone';
	if (!entity.isZone && (entity.parentId === null || entity.parentId === undefined))
		return 'category';
	return 'child-forum';
}

export function isPrimaryZone(entity: ForumEntityBase): boolean {
	return getForumEntityType(entity) === 'primary-zone';
=======
  if (entity.forum_type) {
    return entity.forum_type;
  }
  // Fallback to old logic if forum_type is not present
  if (entity.isZone && entity.canonical) return 'primary'; // old primary-zone
  if (!entity.isZone && (entity.parentId === null || entity.parentId === undefined)) return 'category';
  if (!entity.isZone && entity.parentId !== null && entity.parentId !== undefined) return 'child-forum'; // old child-forum
  return 'unknown';
}

export function isPrimaryZone(entity: ForumEntityBase): boolean {
  // Prioritize new forum_type field
  if (entity.forum_type) {
    return entity.forum_type === 'primary';
  }
  // Fallback to old logic
  return entity.isZone === true && entity.canonical === true;
>>>>>>> e9161f07a590654bde699619fdc9d26a47d0139a
}
export function isCategory(entity: ForumEntityBase): boolean {
	return getForumEntityType(entity) === 'category';
}
export function isChildForum(entity: ForumEntityBase): boolean {
	return getForumEntityType(entity) === 'child-forum';
}

/**
 * Canonical URL generator for forum entities
 * This will be superseded by getZonePath for primary/general zones.
 * Kept for now for other entity types or legacy use.
 */
<<<<<<< HEAD
export function getForumEntityUrl(entity: { slug: string }): string {
	return `/forum/${entity.slug}`;
=======
export function getForumEntityUrl(entity: ForumEntityBase): string {
  // This function might need further refactoring based on how 'category' and 'child-forum' are handled.
  // For now, it assumes general forums are under /forum/
  if (entity.forum_type === 'primary') {
    return `/${entity.slug}`;
  }
  return `/forum/${entity.slug}`;
>>>>>>> e9161f07a590654bde699619fdc9d26a47d0139a
}

/**
 * Generates the correct path for a zone based on its type and slug.
 * Primary Zones: `/[zone_slug]`
 * General Forums: `/forum/[slug]`
 * 
 * Now supports both ForumEntityBase and PrimaryZone objects
 */
export function getZonePath(zone: ForumEntityBase | PrimaryZone): string {
  // Handle PrimaryZone objects
  if (isPrimaryZoneObject(zone)) {
    return `/${zone.slug}`;
  }
  
  // Handle ForumEntityBase objects
  if (isPrimaryZone(zone as ForumEntityBase)) {
    return `/${zone.slug}`;
  }
  
  // Default to general forum path structure
  return `/forum/${zone.slug}`;
}

/**
 * Breadcrumb item representation
 */
export interface BreadcrumbItem {
	name: string;
	url: string;
}

/**
 * Static breadcrumbs with parent context support
 */
<<<<<<< HEAD
export function getStaticBreadcrumbs(entity: ForumEntityBase): BreadcrumbItem[] {
	const breadcrumbs: BreadcrumbItem[] = [{ name: 'Home', url: '/' }];
	const type = getForumEntityType(entity);
	switch (type) {
		case 'primary-zone':
			breadcrumbs.push({ name: entity.name, url: `/forums/${entity.slug}` });
			break;
		case 'category':
			breadcrumbs.push({ name: 'Categories', url: '/zones' });
			breadcrumbs.push({ name: entity.name, url: `/zones/${entity.slug}` });
			break;
		case 'child-forum':
			if (entity.parentSlug) {
				breadcrumbs.push({ name: entity.parentName || 'Back', url: `/zones/${entity.parentSlug}` });
			}
			breadcrumbs.push({ name: entity.name, url: `/forums/${entity.slug}` });
			break;
	}
	return breadcrumbs;
=======
export function getStaticBreadcrumbs(entity: ForumEntityBase | PrimaryZone): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Home', url: '/' }
  ];
  
  // Handle PrimaryZone objects
  if (isPrimaryZoneObject(entity)) {
    breadcrumbs.push({ name: entity.label, url: getZonePath(entity) });
    return breadcrumbs;
  }
  
  // Handle ForumEntityBase objects
  const forumEntity = entity as ForumEntityBase;
  const type = getForumEntityType(forumEntity);
  switch (type) {
    case 'primary': // Changed from 'primary-zone'
      // Primary zones are top-level, so their breadcrumb is just their name linked to their path.
      breadcrumbs.push({ name: forumEntity.name, url: getZonePath(forumEntity) });
      break;
    case 'general': // Assuming 'child-forum' maps to 'general' or needs specific handling
      // If general forums can be nested under categories, this might need adjustment.
      // For now, treating them as directly under a main "Forums" or "General Forums" section.
      // This part might need more context from the overall navigation structure.
      // Let's assume a generic "Forums" link before the specific general forum.
      breadcrumbs.push({ name: 'Forums', url: '/forums' }); // Placeholder, might need to be dynamic
      breadcrumbs.push({ name: forumEntity.name, url: getZonePath(forumEntity) });
      break;
    case 'category':
      breadcrumbs.push({ name: 'Categories', url: '/zones' }); // Assuming '/zones' is the path for categories listing
      breadcrumbs.push({ name: forumEntity.name, url: `/zones/${forumEntity.slug}` }); // Path for a specific category
      break;
    case 'child-forum': // This case might become 'general' or be handled differently
      // If 'child-forum' still exists as a distinct type and can be under a 'category'
      if (forumEntity.parentSlug) {
        // Assuming parent is a category, linking to /zones/parentSlug
        breadcrumbs.push({ name: 'Categories', url: '/zones' });
        breadcrumbs.push({ name: forumEntity.parentName || 'Parent Category', url: `/zones/${forumEntity.parentSlug}` });
      }
      breadcrumbs.push({ name: forumEntity.name, url: getZonePath(forumEntity) }); // General forums are /forum/[slug]
      break;
    // Add cases for 'merged', 'deprecated', 'unknown' if they need breadcrumbs
  }
  return breadcrumbs;
>>>>>>> e9161f07a590654bde699619fdc9d26a47d0139a
}

/**
 * Thread URL generator
 */
export function getThreadUrl(thread: { id: number; slug?: string }): string {
	return `/threads/${thread.slug || thread.id}`;
}

/**
 * Hierarchical structure mapping
 */
export function mapToHierarchicalStructure(entities: ForumEntityBase[]): {
	primaryZones: ForumEntityBase[];
	categories: Array<ForumEntityBase & { children: ForumEntityBase[] }>;
} {
	const primaryZones: ForumEntityBase[] = [];
	const categoriesMap = new Map<number, ForumEntityBase & { children: ForumEntityBase[] }>();
	const childForums: ForumEntityBase[] = [];
	entities.forEach((entity) => {
		if (isPrimaryZone(entity)) {
			primaryZones.push(entity);
		} else if (isCategory(entity)) {
			categoriesMap.set(entity.id, { ...entity, children: [] });
		} else {
			childForums.push(entity);
		}
	});
	childForums.forEach((forum) => {
		if (forum.parentId && categoriesMap.has(forum.parentId)) {
			const category = categoriesMap.get(forum.parentId);
			if (category) {
				category.children.push(forum);
			}
		}
	});
	return {
		primaryZones,
		categories: Array.from(categoriesMap.values())
	};
}

/**
 * Entity sorting helper
 */
export function sortEntities(entities: ForumEntityBase[]): ForumEntityBase[] {
	return entities.slice().sort((a, b) => {
		if (a.position !== undefined && b.position !== undefined) return a.position - b.position;
		if (a.position !== undefined) return -1;
		if (b.position !== undefined) return 1;
		return a.name.localeCompare(b.name);
	});
}

/**
 * Display name helper (icon + name)
 */
<<<<<<< HEAD
export function getZoneOrForumDisplayName(entity: ForumEntityBase): string {
	return entity.icon ? `${entity.icon} ${entity.name}` : entity.name;
=======
export function getZoneOrForumDisplayName(entity: ForumEntityBase | PrimaryZone): string {
  if (isPrimaryZoneObject(entity)) {
    const icon = typeof entity.icon === 'string' ? entity.icon : '';
    return icon ? `${icon} ${entity.label}` : entity.label;
  }
  const forumEntity = entity as ForumEntityBase;
  return forumEntity.icon ? `${forumEntity.icon} ${forumEntity.name}` : forumEntity.name;
>>>>>>> e9161f07a590654bde699619fdc9d26a47d0139a
}

/**
 * Anchor ID helper for in-page navigation
 */
<<<<<<< HEAD
export function getForumAnchorId(entity: ForumEntityBase): string {
	return `forum-${entity.slug || entity.id}`;
=======
export function getForumAnchorId(entity: ForumEntityBase | PrimaryZone): string {
  if (isPrimaryZoneObject(entity)) {
    return `forum-${entity.slug || entity.id}`;
  }
  const forumEntity = entity as ForumEntityBase;
  return `forum-${forumEntity.slug || forumEntity.id}`;
>>>>>>> e9161f07a590654bde699619fdc9d26a47d0139a
}

/**
 * Gets the appropriate CSS class for a forum entity based on its theme
 * @param entity The forum entity or primary zone
 * @returns CSS class name for applying theme styles
 */
<<<<<<< HEAD
export function getThemeClass(entity: ForumEntityBase): string {
	if (!entity.colorTheme) {
		return 'zone-theme-default';
	}

	return `zone-theme-${entity.colorTheme}`;
=======
export function getThemeClass(entity: ForumEntityBase | PrimaryZone): string {
  const colorTheme = isPrimaryZoneObject(entity) ? entity.colorTheme : entity.colorTheme;
  if (!colorTheme) {
    return 'zone-theme-default';
  }
  
  return `zone-theme-${colorTheme}`;
>>>>>>> e9161f07a590654bde699619fdc9d26a47d0139a
}

/**
 * Formats a zone/forum name for display with its icon
 * @param entity The forum entity or primary zone
 * @returns String with icon and name or just name
 */
<<<<<<< HEAD
export function formatZoneName(entity: ForumEntityBase): string {
	if (entity.icon) {
		return `${entity.icon} ${entity.name}`;
	}
	return entity.name;
=======
export function formatZoneName(entity: ForumEntityBase | PrimaryZone): string {
  if (isPrimaryZoneObject(entity)) {
    const icon = typeof entity.icon === 'string' ? entity.icon : '';
    return icon ? `${icon} ${entity.label}` : entity.label;
  }
  const forumEntity = entity as ForumEntityBase;
  if (forumEntity.icon) {
    return `${forumEntity.icon} ${forumEntity.name}`;
  }
  return forumEntity.name;
>>>>>>> e9161f07a590654bde699619fdc9d26a47d0139a
}

/**
 * Check if entity is active based on current URL path
 */
export function isEntityActive(
<<<<<<< HEAD
	entity: Pick<ForumEntityBase, 'slug' | 'isZone' | 'canonical' | 'parentId'>,
	currentPath: string
): boolean {
	const entityUrl = getForumEntityUrl(entity as ForumEntityBase);
	return currentPath === entityUrl || currentPath.startsWith(`${entityUrl}/`);
=======
  entity: ForumEntityBase | PrimaryZone,
  currentPath: string
): boolean {
  const entityUrl = getZonePath(entity); // Use new getZonePath
  return currentPath === entityUrl || currentPath.startsWith(`${entityUrl}/`);
>>>>>>> e9161f07a590654bde699619fdc9d26a47d0139a
}
