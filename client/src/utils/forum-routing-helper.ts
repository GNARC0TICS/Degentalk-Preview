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
}

/**
 * Forum entity types
 */
export type ForumEntityType = 'primary-zone' | 'category' | 'child-forum';

/**
 * Centralized entity classification
 */
export function getForumEntityType(entity: ForumEntityBase): ForumEntityType {
  if (entity.isZone && entity.canonical) return 'primary-zone';
  if (!entity.isZone && (entity.parentId === null || entity.parentId === undefined)) return 'category';
  return 'child-forum';
}

export function isPrimaryZone(entity: ForumEntityBase): boolean {
  return getForumEntityType(entity) === 'primary-zone';
}
export function isCategory(entity: ForumEntityBase): boolean {
  return getForumEntityType(entity) === 'category';
}
export function isChildForum(entity: ForumEntityBase): boolean {
  return getForumEntityType(entity) === 'child-forum';
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
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Home', url: '/' }
  ];
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
  entities.forEach(entity => {
    if (isPrimaryZone(entity)) {
      primaryZones.push(entity);
    } else if (isCategory(entity)) {
      categoriesMap.set(entity.id, { ...entity, children: [] });
    } else {
      childForums.push(entity);
    }
  });
  childForums.forEach(forum => {
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
    if (a.position !== undefined && b.position !== undefined)
      return a.position - b.position;
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
 * Gets the appropriate CSS class for a forum entity based on its theme
 * @param entity The forum entity
 * @returns CSS class name for applying theme styles
 */
export function getThemeClass(entity: ForumEntityBase): string {
  if (!entity.colorTheme) {
    return 'zone-theme-default';
  }
  
  return `zone-theme-${entity.colorTheme}`;
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