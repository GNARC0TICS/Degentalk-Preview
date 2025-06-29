/**
 * Forum Layout Configuration
 *
 * Centralized configuration for forum layout options and display preferences.
 * Following the config-first architecture pattern.
 */

export const forumLayoutConfig = {
	// Default view mode for thread lists
	defaultView: 'list' as 'list' | 'grid' | 'masonry',

	// Available view modes (can be toggled in UI)
	availableViews: ['list', 'grid', 'masonry'] as const,

	// Header display variants
	headerVariants: {
		default: 'detailed',
		compact: ['trading-zone', 'quick-questions'], // Forums that should use compact header
		minimal: ['announcements', 'rules'] // Forums that should use minimal header
	},

	// Sidebar configuration
	sidebar: {
		position: 'right' as 'left' | 'right',
		breakpoint: 'xl' as 'lg' | 'xl' | '2xl',
		defaultWidgets: ['forum-stats', 'online-users', 'recent-activity']
	},

	// Filter display options
	filters: {
		position: 'inline' as 'inline' | 'sidebar' | 'modal',
		defaultVisible: false,
		persistState: true,
		syncWithUrl: true
	},

	// Thread list display options
	threadList: {
		itemsPerPage: 20,
		showPagination: true,
		showAuthorAvatars: true,
		showLastReply: true,
		showStats: true,
		highlightSticky: true,
		highlightLocked: true
	},

	// Animation and transitions
	animations: {
		enabled: true,
		headerTransition: 'fade',
		filterTransition: 'slide',
		threadHover: 'lift'
	},

	// Responsive breakpoints
	responsive: {
		mobileBreakpoint: 640,
		tabletBreakpoint: 768,
		desktopBreakpoint: 1024
	}
} as const;

// Type exports for consumption
export type ForumLayoutConfig = typeof forumLayoutConfig;
export type ViewMode = typeof forumLayoutConfig.defaultView;
export type HeaderVariant = 'detailed' | 'compact' | 'minimal';
