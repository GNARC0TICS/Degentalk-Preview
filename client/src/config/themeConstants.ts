/**
 * @deprecated Use theme.config.ts instead
 * This file is maintained for backward compatibility
 */
import { theme, zoneThemes } from './theme.config';

// Re-export from theme.config.ts for backward compatibility
export const ZONE_THEMES = zoneThemes;

// Map theme keys to icon components
export const THEME_ICONS = Object.entries(zoneThemes).reduce(
	(acc, [key, theme]) => ({ ...acc, [key]: theme.icon }),
	{}
) as const;

// Map theme keys to gradient/border classes for cards (used in forums/index.tsx)
export const THEME_COLORS_BG = Object.entries(zoneThemes).reduce(
	(acc, [key, theme]) => {
		const gradientClass = theme.gradientFrom && theme.gradientTo 
			? `${theme.gradientFrom} ${theme.gradientTo} ${theme.borderColor}`
			: key === 'shop' 
				? 'from-violet-500/20 via-pink-500/10 to-blue-500/20 border-violet-500/30'
				: `${theme.gradientFrom || 'from-zinc-800/80'} ${theme.gradientTo || 'to-zinc-900/80'} ${theme.borderColor}`;
		return { ...acc, [key]: gradientClass };
	},
	{}
) as const;
