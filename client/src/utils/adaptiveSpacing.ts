/**
 * Adaptive Spacing Utilities
 *
 * Provides consistent responsive spacing patterns across the forum
 * components based on breakpoints and content density.
 */

import { type ClassValue } from 'clsx';

export type SpacingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ContentDensity = 'compact' | 'comfortable' | 'spacious';

/**
 * Get responsive spacing classes based on breakpoint and density
 */
export const getAdaptiveSpacing = (
	size: SpacingSize = 'md',
	density: ContentDensity = 'comfortable'
): Record<'mobile' | 'tablet' | 'desktop', string> => {
	const spacingMap = {
		compact: {
			xs: { mobile: 'space-y-1', tablet: 'space-y-1', desktop: 'space-y-2' },
			sm: { mobile: 'space-y-2', tablet: 'space-y-2', desktop: 'space-y-3' },
			md: { mobile: 'space-y-3', tablet: 'space-y-3', desktop: 'space-y-4' },
			lg: { mobile: 'space-y-4', tablet: 'space-y-4', desktop: 'space-y-6' },
			xl: { mobile: 'space-y-6', tablet: 'space-y-6', desktop: 'space-y-8' }
		},
		comfortable: {
			xs: { mobile: 'space-y-2', tablet: 'space-y-2', desktop: 'space-y-3' },
			sm: { mobile: 'space-y-3', tablet: 'space-y-3', desktop: 'space-y-4' },
			md: { mobile: 'space-y-4', tablet: 'space-y-4', desktop: 'space-y-6' },
			lg: { mobile: 'space-y-6', tablet: 'space-y-6', desktop: 'space-y-8' },
			xl: { mobile: 'space-y-8', tablet: 'space-y-8', desktop: 'space-y-12' }
		},
		spacious: {
			xs: { mobile: 'space-y-3', tablet: 'space-y-4', desktop: 'space-y-4' },
			sm: { mobile: 'space-y-4', tablet: 'space-y-6', desktop: 'space-y-6' },
			md: { mobile: 'space-y-6', tablet: 'space-y-8', desktop: 'space-y-8' },
			lg: { mobile: 'space-y-8', tablet: 'space-y-12', desktop: 'space-y-16' },
			xl: { mobile: 'space-y-12', tablet: 'space-y-16', desktop: 'space-y-24' }
		}
	};

	return spacingMap[density][size];
};

/**
 * Get responsive padding classes
 */
export const getAdaptivePadding = (
	size: SpacingSize = 'md',
	density: ContentDensity = 'comfortable'
): Record<'mobile' | 'tablet' | 'desktop', string> => {
	const paddingMap = {
		compact: {
			xs: { mobile: 'p-1', tablet: 'p-2', desktop: 'p-2' },
			sm: { mobile: 'p-2', tablet: 'p-3', desktop: 'p-3' },
			md: { mobile: 'p-3', tablet: 'p-4', desktop: 'p-4' },
			lg: { mobile: 'p-4', tablet: 'p-6', desktop: 'p-6' },
			xl: { mobile: 'p-6', tablet: 'p-8', desktop: 'p-8' }
		},
		comfortable: {
			xs: { mobile: 'p-2', tablet: 'p-3', desktop: 'p-3' },
			sm: { mobile: 'p-3', tablet: 'p-4', desktop: 'p-4' },
			md: { mobile: 'p-4', tablet: 'p-6', desktop: 'p-6' },
			lg: { mobile: 'p-6', tablet: 'p-8', desktop: 'p-8' },
			xl: { mobile: 'p-8', tablet: 'p-12', desktop: 'p-12' }
		},
		spacious: {
			xs: { mobile: 'p-3', tablet: 'p-4', desktop: 'p-4' },
			sm: { mobile: 'p-4', tablet: 'p-6', desktop: 'p-6' },
			md: { mobile: 'p-6', tablet: 'p-8', desktop: 'p-8' },
			lg: { mobile: 'p-8', tablet: 'p-12', desktop: 'p-12' },
			xl: { mobile: 'p-12', tablet: 'p-16', desktop: 'p-16' }
		}
	};

	return paddingMap[density][size];
};

/**
 * Get responsive typography scale
 */
export const getAdaptiveTypography = (
	level: 'body' | 'caption' | 'heading' | 'title' | 'display'
): Record<'mobile' | 'tablet' | 'desktop', string> => {
	const typographyMap = {
		body: {
			mobile: 'text-sm leading-relaxed',
			tablet: 'text-base leading-relaxed',
			desktop: 'text-base leading-relaxed'
		},
		caption: {
			mobile: 'text-xs leading-tight',
			tablet: 'text-xs leading-normal',
			desktop: 'text-sm leading-normal'
		},
		heading: {
			mobile: 'text-base font-semibold leading-tight',
			tablet: 'text-lg font-semibold leading-tight',
			desktop: 'text-lg font-semibold leading-tight'
		},
		title: {
			mobile: 'text-lg font-bold leading-tight',
			tablet: 'text-xl font-bold leading-tight',
			desktop: 'text-2xl font-bold leading-tight'
		},
		display: {
			mobile: 'text-xl font-bold leading-tight',
			tablet: 'text-2xl font-bold leading-tight',
			desktop: 'text-3xl font-bold leading-tight'
		}
	};

	return typographyMap[level];
};

/**
 * Get responsive touch target size
 */
export const getTouchTargetSize = (
	size: 'sm' | 'md' | 'lg' = 'md'
): Record<'mobile' | 'desktop', string> => {
	const touchTargetMap = {
		sm: {
			mobile: 'h-10 w-10', // 40px minimum for small targets
			desktop: 'h-8 w-8'
		},
		md: {
			mobile: 'h-11 w-11', // 44px recommended minimum
			desktop: 'h-10 w-10'
		},
		lg: {
			mobile: 'h-12 w-12', // 48px for primary actions
			desktop: 'h-11 w-11'
		}
	};

	return touchTargetMap[size];
};

/**
 * Helper to combine responsive classes with breakpoint prefixes
 */
export const combineResponsiveClasses = (
	classes: Record<'mobile' | 'tablet' | 'desktop', string>
): string => {
	return `${classes.mobile} md:${classes.tablet} lg:${classes.desktop}`;
};

/**
 * Breakpoint-aware spacing hook result
 */
export interface AdaptiveSpacingResult {
	spacing: string;
	padding: string;
	typography: string;
	touchTarget: string;
}

/**
 * Get all adaptive classes for a given configuration
 */
export const getAdaptiveConfig = (config: {
	spacing?: SpacingSize;
	padding?: SpacingSize;
	typography?: 'body' | 'caption' | 'heading' | 'title' | 'display';
	touchTarget?: 'sm' | 'md' | 'lg';
	density?: ContentDensity;
}): AdaptiveSpacingResult => {
	const {
		spacing = 'md',
		padding = 'md',
		typography = 'body',
		touchTarget = 'md',
		density = 'comfortable'
	} = config;

	const spacingClasses = getAdaptiveSpacing(spacing, density);
	const paddingClasses = getAdaptivePadding(padding, density);
	const typographyClasses = getAdaptiveTypography(typography);
	const touchTargetClasses = getTouchTargetSize(touchTarget);

	return {
		spacing: combineResponsiveClasses(spacingClasses),
		padding: combineResponsiveClasses(paddingClasses),
		typography: combineResponsiveClasses(typographyClasses),
		touchTarget: `${touchTargetClasses.mobile} lg:${touchTargetClasses.desktop}`
	};
};
