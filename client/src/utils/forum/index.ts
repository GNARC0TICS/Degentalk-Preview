/**
 * Forum Utilities - Consolidated exports
 * 
 * All forum-related utility functions organized in one place
 */

// URL utilities - Primary exports from urls.ts
export { 
	generateForumUrl, 
	generateCreateThreadUrl, 
	generateForumsIndexUrl, 
	parseForumUrl as parseForumUrlBasic, 
	isLegacyForumUrl, 
	extractLegacyForumSlug 
} from './urls';

// Additional URL utilities from urls.ts
export { 
	getForumUrl, 
	getSubforumUrl, 
	getCreateThreadUrl,
	generateBreadcrumbs,
	isForumActive 
} from './urls';

// Breadcrumb utilities  
export { createForumBreadcrumbs } from './breadcrumbs';

// Sidebar utilities
export * from './sidebarUtils';

// Routing utilities - Core functions and types
export { 
	getForumEntityType,
	isPrimaryZone,
	isCategory,
	isChildForum,
	getForumEntityUrl,
	getStaticBreadcrumbs,
	getThreadUrl,
	sortEntities,
	getZoneOrForumDisplayName,
	getForumAnchorId,
	formatZoneName,
	isEntityActive
} from './routing';

// Export types separately to avoid indirect export issues
export type { ForumEntityBase, ForumEntityType, BreadcrumbItem } from './routing';

// Statistics utilities
export * from './stats';

// Formatting utilities
export * from './formatting';