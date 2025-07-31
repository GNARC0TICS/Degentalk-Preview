// Export only UI-related types for static landing page
export type {
	Forum,
	ForumSettings,
	ForumStats,
	ForumPrefix,
	ForumRule,
	ForumHierarchy
} from './forum-core.types.js';

export type {
	Thread,
	ThreadUser,
	ThreadPrefix,
	ThreadTag,
	ThreadPermissions,
	ThreadListItem
} from './thread.types.js';

export type {
	Post,
	PostAuthor
} from './post.types.js';

export type {
	ItemRarity,
	ItemCategory,
	Frame,
	Badge,
	Title,
	RarityConfig
} from './cosmetics.types.js';

export type {
	ThemeColor,
	ThemeConfig,
	ColorScheme,
	ThemeVariant
} from './theme.types.js';