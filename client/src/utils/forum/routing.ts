/**
 * Forum Routing Helper
 *
 * Utility functions for handling forum entity routing and type checking
 * based on the ForumFusion canonical structure.
 */

/**
 * Forum entity base type (zone, category, forum)
 */
export interface ForumEntityBase {
	id: string;
	name: string;
	slug: string;
	description?: string | null; // Matched MergedForum
	type: 'zone' | 'category' | 'forum'; // Added type, should be primary
	isZone?: boolean; // Will be derived from type
	canonical?: boolean; // Will be derived from type and parentId
	parentId?: string | null;
	parentSlug?: string;
	parentName?: string;
	icon?: string;
	colorTheme?: string;
	threadCount?: number;
	postCount?: number;
	canHaveThreads?: boolean;
	position?: number;
}

/**
 * Forum entity types
 */
export type ForumEntityType = 'primary-zone' | 'category' | 'child-forum';

/**
 * Centralized entity classification
 */
export function getForumEntityType(entity: ForumEntityBase): ForumEntityType {
	// Derive isZone and canonical if not provided, based on type and parentId
	const isZoneDerived = entity.isZone ?? entity.type === 'zone';
	const canonicalDerived =
		entity.canonical ??
		(entity.type === 'zone' && (entity.parentId === null || entity.parentId === undefined));

	if (isZoneDerived && canonicalDerived) return 'primary-zone';
	// A 'category' type is a top-level grouper if it has no parent or its parent is a zone (but not a forum itself)
	// The original logic for category was: !entity.isZone && (entity.parentId === null || entity.parentId === undefined)
	// This translates to: entity.type === 'category' (assuming categories are top-level or parented by zones)
	if (entity.type === 'category') return 'category';
	if (entity.type === 'forum') return 'child-forum'; // type 'forum' are always child-forums

	// Fallback for older structures or if type is ambiguous, try to infer
	if (isZoneDerived) return 'primary-zone'; // If it's a zone, assume primary if not specified otherwise
	return 'child-forum'; // Default to child-forum if type is not 'category' or 'zone'
}

export function isPrimaryZone(entity: ForumEntityBase): boolean {
	// A primary zone is of type 'zone' and has no parentId or is marked canonical.
	// If canonical field is present, it takes precedence.
	if (typeof entity.canonical === 'boolean') return entity.type === 'zone' && entity.canonical;
	return entity.type === 'zone' && (entity.parentId === null || entity.parentId === undefined);
}
export function isCategory(entity: ForumEntityBase): boolean {
	// A category is of type 'category'. It might have a parentId (if nested under a zone not handled by simple parentId logic)
	// or no parentId if it's a top-level category.
	return entity.type === 'category';
}
export function isChildForum(entity: ForumEntityBase): boolean {
	// A child forum is of type 'forum'.
	return entity.type === 'forum';
}

/**
 * Canonical URL generator for forum entities
 */
export function getForumEntityUrl(entity: { slug: string }): string {
	return `/forum/${entity.slug}`;
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
}

/**
 * Thread URL generator
 */
export function getThreadUrl(thread: { id: string; slug?: string }): string {
	return `/threads/${thread.slug || thread.id}`;
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
export function getZoneOrForumDisplayName(entity: ForumEntityBase): string {
	return entity.icon ? `${entity.icon} ${entity.name}` : entity.name;
}

/**
 * Anchor ID helper for in-page navigation
 */
export function getForumAnchorId(entity: ForumEntityBase): string {
	return `forum-${entity.slug || entity.id}`;
}

/**
 * Formats a zone/forum name for display with its icon
 * @param entity The forum entity
 * @returns String with icon and name or just name
 */
export function formatZoneName(entity: ForumEntityBase): string {
	if (entity.icon) {
		return `${entity.icon} ${entity.name}`;
	}
	return entity.name;
}

/**
 * Check if entity is active based on current URL path
 */
export function isEntityActive(
	entity: Pick<ForumEntityBase, 'slug' | 'isZone' | 'canonical' | 'parentId'>,
	currentPath: string
): boolean {
	const entityUrl = getForumEntityUrl(entity as ForumEntityBase);
	return currentPath === entityUrl || currentPath.startsWith(`${entityUrl}/`);
}
