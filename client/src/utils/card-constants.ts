/**
 * Standard card styling patterns for consistent UI
 * Ensures visual consistency across all card components
 */

export const CARD_STYLES = {
	// Standard background patterns
	background: {
		primary: 'bg-zinc-900/60 border-zinc-800',
		secondary: 'bg-zinc-800/50 border-zinc-700/50',
		accent: 'bg-zinc-900/80 border-zinc-700',
		transparent: 'bg-zinc-900/40 border-zinc-800/50'
	},

	// Standard hover effects
	hover: {
		subtle: 'hover:bg-zinc-800/40 transition-colors duration-200',
		scale: 'hover:scale-[1.02] transition-all duration-300',
		glow: 'hover:shadow-lg hover:shadow-zinc-900/50 transition-all duration-300',
		combined: 'hover:scale-[1.02] hover:bg-zinc-800/40 hover:shadow-lg transition-all duration-300'
	},

	// Standard heights for different card types
	height: {
		compact: 'min-h-[120px]',
		standard: 'min-h-[180px]',
		large: 'min-h-[240px]',
		hero: 'min-h-[320px]'
	},

	// Consistent border radius
	radius: {
		small: 'rounded-lg',
		standard: 'rounded-xl',
		large: 'rounded-2xl'
	},

	// Shadow patterns
	shadow: {
		none: '',
		subtle: 'shadow-sm shadow-black/20',
		standard: 'shadow-md shadow-black/30',
		large: 'shadow-xl shadow-black/40'
	}
} as const;

/**
 * Pre-composed card classes for common use cases
 */
export const CARD_VARIANTS = {
	// Forum/Zone cards
	zone: `${CARD_STYLES.background.primary} ${CARD_STYLES.height.large} ${CARD_STYLES.radius.standard} ${CARD_STYLES.hover.combined} ${CARD_STYLES.shadow.standard}`,

	// Forum list items
	forumItem: `${CARD_STYLES.background.secondary} ${CARD_STYLES.height.compact} ${CARD_STYLES.radius.small} ${CARD_STYLES.hover.subtle}`,

	// Thread cards
	thread: `${CARD_STYLES.background.primary} ${CARD_STYLES.height.standard} ${CARD_STYLES.radius.standard} ${CARD_STYLES.hover.scale}`,

	// Content cards (posts, etc.)
	content: `${CARD_STYLES.background.primary} ${CARD_STYLES.radius.standard} ${CARD_STYLES.shadow.subtle}`,

	// Widget/sidebar cards
	widget: `${CARD_STYLES.background.accent} ${CARD_STYLES.radius.standard} ${CARD_STYLES.shadow.subtle}`,

	// Hero/featured cards
	hero: `${CARD_STYLES.background.primary} ${CARD_STYLES.height.hero} ${CARD_STYLES.radius.large} ${CARD_STYLES.hover.glow} ${CARD_STYLES.shadow.large}`
} as const;

/**
 * Helper function to get card styling
 */
export function getCardStyle(variant: keyof typeof CARD_VARIANTS): string {
	return CARD_VARIANTS[variant];
}

/**
 * Helper function to combine custom card styles
 */
export function createCardStyle(
	background: keyof typeof CARD_STYLES.background,
	hover: keyof typeof CARD_STYLES.hover,
	height?: keyof typeof CARD_STYLES.height,
	radius: keyof typeof CARD_STYLES.radius = 'standard',
	shadow: keyof typeof CARD_STYLES.shadow = 'subtle'
): string {
	const baseClasses = [
		CARD_STYLES.background[background],
		CARD_STYLES.hover[hover],
		CARD_STYLES.radius[radius],
		CARD_STYLES.shadow[shadow]
	];

	if (height) {
		baseClasses.push(CARD_STYLES.height[height]);
	}

	return baseClasses.join(' ');
}
