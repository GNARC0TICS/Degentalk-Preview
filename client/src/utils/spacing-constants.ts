/**
 * Standard spacing patterns for forum pages
 * Ensures consistent layout across all forum-facing components
 *
 * NOTE: This is transitioning to use UIConfigContext for admin-configurable spacing
 */

import { useUIConfig, buildResponsiveClasses } from '@/contexts/UIConfigContext';

// Static constants for non-React contexts (will be deprecated)
export const FORUM_SPACING = {
	// Container padding - matches ResponsiveLayoutWrapper pattern
	container: 'px-2 sm:px-4 py-6 sm:py-8 md:py-12',

	// Section margins
	section: 'mb-8',
	sectionLarge: 'mb-16',

	// Card spacing
	cardGrid: 'gap-6',
	cardStack: 'space-y-6',

	// Component spacing within pages
	component: 'mb-6',
	componentLarge: 'mb-12',

	// Content padding
	contentPadding: 'p-4 sm:p-6',
	contentPaddingSmall: 'p-3 sm:p-4',

	// Header spacing
	headerMargin: 'mb-6',
	headerPadding: 'pb-3'
} as const;

// New configurable spacing hook
export const useForumSpacing = () => {
	const { spacing } = useUIConfig();

	return {
		// Configurable spacing from admin panel
		container: buildResponsiveClasses(spacing.container),
		section: buildResponsiveClasses(spacing.section),
		sectionLarge: buildResponsiveClasses(spacing.sectionLarge),
		card: buildResponsiveClasses(spacing.card),
		cardCompact: buildResponsiveClasses(spacing.cardCompact),
		element: buildResponsiveClasses(spacing.element),
		elementSmall: buildResponsiveClasses(spacing.elementSmall),

		// Static spacing that doesn't need configuration (yet)
		cardGrid: 'gap-6',
		cardStack: 'space-y-6',
		headerMargin: 'mb-6',
		headerPadding: 'pb-3'
	};
};

export const FORUM_LAYOUTS = {
	// Standard page wrapper
	page: 'min-h-screen bg-black',

	// Main content area within Wide wrapper
	mainContent: FORUM_SPACING.container,

	// Grid layouts
	forumGrid: 'grid grid-cols-1 lg:grid-cols-12 gap-8',
	zoneGrid: 'grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-6',

	// Flex layouts
	headerFlex: 'flex flex-col sm:flex-row sm:justify-between sm:items-center',
	statsFlex: 'flex flex-wrap items-center gap-4 sm:gap-6 text-sm'
} as const;

/**
 * Helper function to get consistent spacing classes
 */
export function getForumSpacing(type: keyof typeof FORUM_SPACING): string {
	return FORUM_SPACING[type];
}

/**
 * Helper function to get consistent layout classes
 */
export function getForumLayout(type: keyof typeof FORUM_LAYOUTS): string {
	return FORUM_LAYOUTS[type];
}
