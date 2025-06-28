---
title: routing logic
status: STABLE
updated: 2025-06-28
---

# Forum Routing Logic

## Overview
The Degentalk forum structure consists of three distinct entity types:
1. **Primary Zones**: Single-forum, branded destinations (`isZone: true, canonical: true, parentId: null`)
2. **Expandable Categories**: Containers for child forums (`isZone: false, parentId: null`)
3. **Child Forums**: Individual forums within categories (`isZone: false, parentId: [category_id]`)

This document defines the routing architecture and helper utilities for navigating between these entities.

## URL Structure

The routing structure follows these patterns:

| Entity Type | URL Pattern | Example |
|-------------|------------|---------|
| Primary Zone | `/forums/[zone_slug]` | `/forums/the-pit` |
| Expandable Category | `/zones/[category_slug]` | `/zones/market-moves` |
| Child Forum | `/forums/[forum_slug]` | `/forums/altcoin-discussion` |
| Thread | `/threads/[thread_slug]` | `/threads/best-layer2-solutions-2025` |
| Thread (ID fallback) | `/threads/[thread_id]` | `/threads/12345` |

## Routing Logic

### Entity Type Detection
The system needs to determine the type of entity (zone, category, or forum) to apply the appropriate routing and presentation logic.

```typescript
/**
 * Determines the type of forum entity based on its properties
 */
function getForumEntityType(entity: {
  isZone?: boolean;
  canonical?: boolean;
  parentId?: string | number | null;
}): 'primary-zone' | 'category' | 'child-forum' {
  if (entity.isZone && entity.canonical) {
    return 'primary-zone';
  } else if (!entity.isZone && !entity.parentId) {
    return 'category';
  } else {
    return 'child-forum';
  }
}
```

### URL Generation

```typescript
/**
 * Generates the appropriate URL for a forum entity
 */
function getForumEntityUrl(entity: {
  slug: string;
  isZone?: boolean;
  canonical?: boolean;
  parentId?: string | number | null;
}): string {
  const entityType = getForumEntityType(entity);
  
  switch (entityType) {
    case 'primary-zone':
      return `/forums/${entity.slug}`;
    case 'category':
      return `/zones/${entity.slug}`;
    case 'child-forum':
      return `/forums/${entity.slug}`;
    default:
      return '/';
  }
}
```

### Link Component

For convenience, a reusable `ForumLink` component can wrap the logic:

```tsx
interface ForumLinkProps {
  entity: {
    id: string | number;
    name: string;
    slug: string;
    isZone?: boolean;
    canonical?: boolean;
    parentId?: string | number | null;
  };
  children?: React.ReactNode;
  className?: string;
}

function ForumLink({ entity, children, className = '' }: ForumLinkProps) {
  const url = getForumEntityUrl(entity);
  
  return (
    <Link href={url} className={className}>
      {children || entity.name}
    </Link>
  );
}
```

## Route Handlers

### Forum/Zone Page Handler
A unified handler for both Primary Zones and Child Forums:

```tsx
// /forums/[slug].tsx
export default function ForumPage() {
  const { slug } = useParams();
  const { data: entity, isLoading } = useFetchForumEntityBySlug(slug);
  
  if (isLoading) return <Loading />;
  if (!entity) return <NotFound />;
  
  const isZonePage = entity.isZone && entity.canonical;
  
  return (
    <div>
      {isZonePage ? (
        <ZoneHeader zone={entity} />
      ) : (
        <ForumHeader forum={entity} />
      )}
      
      <ThreadList 
        threads={entity.threads}
        forumId={entity.id}
        isZone={isZonePage}
      />
    </div>
  );
}
```

### Category Page Handler

```tsx
// /zones/[slug].tsx
export default function CategoryPage() {
  const { slug } = useParams();
  const { data: category, isLoading } = useFetchCategoryBySlug(slug);
  
  if (isLoading) return <Loading />;
  if (!category) return <NotFound />;
  
  return (
    <div>
      <CategoryHeader category={category} />
      
      <div className="forum-list">
        {category.forums.map(forum => (
          <ForumListItem 
            key={forum.id}
            forum={forum}
          />
        ))}
      </div>
    </div>
  );
}
```

## Breadcrumb Generation

Breadcrumbs should accurately reflect the entity hierarchy:

```typescript
interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Generates breadcrumbs for forum entity
 */
async function getForumBreadcrumbs(entity: {
  id: string | number;
  name: string;
  slug: string;
  isZone?: boolean;
  canonical?: boolean;
  parentId?: string | number | null;
}): Promise<BreadcrumbItem[]> {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Home', url: '/' }
  ];
  
  const entityType = getForumEntityType(entity);
  
  switch (entityType) {
    case 'primary-zone':
      breadcrumbs.push({
        name: entity.name,
        url: `/forums/${entity.slug}`
      });
      break;
    case 'category':
      breadcrumbs.push({
        name: 'Categories',
        url: '/zones'
      });
      breadcrumbs.push({
        name: entity.name,
        url: `/zones/${entity.slug}`
      });
      break;
    case 'child-forum':
      if (entity.parentId) {
        // Fetch parent category
        const category = await fetchCategoryById(entity.parentId);
        
        breadcrumbs.push({
          name: 'Categories',
          url: '/zones'
        });
        
        if (category) {
          breadcrumbs.push({
            name: category.name,
            url: `/zones/${category.slug}`
          });
        }
        
        breadcrumbs.push({
          name: entity.name,
          url: `/forums/${entity.slug}`
        });
      }
      break;
  }
  
  return breadcrumbs;
}
```

## Thread Routing

Threads are accessed via:

```
/threads/[thread_slug]
```

Or, if slug is not available:

```
/threads/[thread_id]
```

Thread URLs should include their parent forum context in breadcrumbs:

```tsx
async function getThreadBreadcrumbs(thread: {
  id: string | number;
  title: string;
  slug: string;
  categoryId: string | number;
}): Promise<BreadcrumbItem[]> {
  // Get forum entity for this thread
  const forumEntity = await fetchForumEntityById(thread.categoryId);
  
  // Get forum breadcrumbs first
  const breadcrumbs = await getForumBreadcrumbs(forumEntity);
  
  // Add thread as final breadcrumb
  breadcrumbs.push({
    name: thread.title,
    url: `/threads/${thread.slug || thread.id}`
  });
  
  return breadcrumbs;
}
```

## Active State Detection

To highlight the current location in navigation UI:

```typescript
/**
 * Check if entity is active based on current URL
 */
function isEntityActive(
  entity: { slug: string },
  currentPath: string
): boolean {
  const entityUrl = getForumEntityUrl(entity);
  return currentPath === entityUrl || currentPath.startsWith(`${entityUrl}/`);
}
```

## Utility Functions for Common Tasks

```typescript
/**
 * Helper function to check if entity is a Primary Zone
 */
function isPrimaryZone(entity: { isZone?: boolean; canonical?: boolean }): boolean {
  return !!entity.isZone && !!entity.canonical;
}

/**
 * Helper function to check if entity is a Category
 */
function isCategory(entity: { isZone?: boolean; parentId?: string | number | null }): boolean {
  return !entity.isZone && !entity.parentId;
}

/**
 * Helper function to check if entity is a Child Forum
 */
function isChildForum(entity: { isZone?: boolean; parentId?: string | number | null }): boolean {
  return !entity.isZone && !!entity.parentId;
}
```

## Implementation Notes

1. The routing helper functions should be placed in `client/src/utils/forum-routing-helper.ts`
2. Navigation components should use these utilities for consistent URL generation
3. The routing structure separates zones from categories to maintain clear conceptual boundaries
4. Child forums share the `/forums/` route prefix with primary zones because they are both single forums (not categories)

## Edge Cases

1. **Duplicate Slugs**: Ensure slugs are unique at the database level to prevent routing conflicts
2. **Nested Categories**: If future development adds nested categories, additional routing logic will be needed
3. **Redirects**: Consider implementing redirects for legacy URLs from older forum structures
4. **Zone/Forum with Same Slug**: Prevent Primary Zones and Child Forums from having identical slugs 

## Widget Slot Awareness & Variants

The **Widget System** pipes layout/context information down to each widget.  
Starting **2025-06-22** every widget loaded by `WidgetFrame` receives:

```ts
interface WidgetProps {
  instanceId: string;
  /**
   * ID of the slot the widget is rendered in, e.g. 'sidebar/right' or 'main/top'.
   */
  slotId?: SlotId;
}
```

### Variant Convention

Certain widgets support a `variant` prop that tweaks their presentation depending on the
slot:

* **`'widget'`** — larger card style intended for sidebars or extended layouts.
* **`'feed'`** — compact feed-item style intended for inline placement in the main content column.

`WidgetFrame` now injects this prop automatically:

```tsx
const extraProps = useMemo(() => {
  if (componentId === 'hotThreads') {
    return {
      variant: currentSlot?.startsWith('sidebar/') ? 'widget' : 'feed'
    };
  }
  return {};
}, [componentId, currentSlot]);
```

Any widget can adopt the same pattern—if it wishes to render differently based on
location, expose a `variant` prop and let `WidgetFrame` (or future helper) set a
default based on `slotId`.

### Admin UX

Administrators can move widgets between slots in real-time via the gear ⚙️ menu.  
Because the variant is driven by `slotId`, the visual style updates immediately when
a widget swaps from sidebar → main or vice-versa—no manual configuration required.

--- 