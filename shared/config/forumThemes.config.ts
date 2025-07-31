// Note: Icon strings reference lucide-react icon names
// The actual icons should be resolved in the client

// Extended visual theme configuration for Forums / Primary Areas
// This file centralises all visual styling tokens for Forum-level components (cards, nav items, etc.)
// Do NOT import component code here – keep it as a pure configuration / data module.

export type GlowIntensity = 'low' | 'medium' | 'high';
export type RarityOverlay = 'common' | 'premium' | 'legendary';

export interface ForumTheme {
	/** Tailwind gradient utility for the background */
	gradient: string;
	/** Tailwind text colour used for accents */
	accent: string;
	/** Tailwind border utility */
	border: string;
	/** Tailwind shadow utility used for glow */
	glow: string;
	/** Lucide icon name shown when no custom emoji/icon is provided */
	icon: string;
	/** Optional – controls shadow intensity classes */
	glowIntensity?: GlowIntensity;
	/** Optional – overlay used for rarity tiers */
	rarityOverlay?: RarityOverlay;
}

export const FORUM_THEMES = {
	pit: {
		gradient: 'from-red-900/40 via-red-800/20 to-red-700/10',
		accent: 'text-red-400',
		border: 'border-red-500/30 hover:border-red-500/60',
		glow: 'shadow-red-500/20',
		icon: 'Flame',
		glowIntensity: 'high',
		rarityOverlay: 'common'
	},
	mission: {
		gradient: 'from-blue-900/40 via-blue-800/20 to-blue-700/10',
		accent: 'text-blue-400',
		border: 'border-blue-500/30 hover:border-blue-500/60',
		glow: 'shadow-blue-500/20',
		icon: 'Target',
		glowIntensity: 'medium',
		rarityOverlay: 'common'
	},
	casino: {
		gradient: 'from-purple-900/40 via-purple-800/20 to-purple-700/10',
		accent: 'text-purple-400',
		border: 'border-purple-500/30 hover:border-purple-500/60',
		glow: 'shadow-purple-500/20',
		icon: 'Sparkles',
		glowIntensity: 'medium',
		rarityOverlay: 'premium'
	},
	briefing: {
		gradient: 'from-amber-900/40 via-amber-800/20 to-amber-700/10',
		accent: 'text-amber-400',
		border: 'border-amber-500/30 hover:border-amber-500/60',
		glow: 'shadow-amber-500/20',
		icon: 'MessageSquare',
		glowIntensity: 'low',
		rarityOverlay: 'common'
	},
	archive: {
		gradient: 'from-gray-900/40 via-gray-800/20 to-gray-700/10',
		accent: 'text-gray-400',
		border: 'border-gray-500/30 hover:border-gray-500/60',
		glow: 'shadow-gray-500/20',
		icon: 'MessageSquare',
		glowIntensity: 'low',
		rarityOverlay: 'common'
	},
	shop: {
		gradient: 'from-violet-900/30 via-pink-900/20 to-blue-900/30',
		accent: 'text-violet-400',
		border: 'border-violet-500/30 hover:border-violet-500/60',
		glow: 'shadow-violet-500/20',
		icon: 'Crown',
		glowIntensity: 'high',
		rarityOverlay: 'legendary'
	},
	default: {
		gradient: 'from-zinc-900/30 via-zinc-800/20 to-zinc-700/10',
		accent: 'text-zinc-400',
		border: 'border-zinc-500/30 hover:border-zinc-500/60',
		glow: 'shadow-zinc-500/20',
		icon: 'MessageSquare',
		glowIntensity: 'medium',
		rarityOverlay: 'common'
	},
	// Additional fallback themes for forums without custom artwork
	ocean: {
		gradient: 'from-blue-900/50 via-cyan-800/30 to-teal-900/40',
		accent: 'text-cyan-400',
		border: 'border-cyan-500/30 hover:border-cyan-500/60',
		glow: 'shadow-cyan-500/20',
		icon: 'Waves',
		glowIntensity: 'medium',
		rarityOverlay: 'common'
	},
	sunset: {
		gradient: 'from-orange-900/50 via-pink-800/30 to-purple-900/40',
		accent: 'text-orange-400',
		border: 'border-orange-500/30 hover:border-orange-500/60',
		glow: 'shadow-orange-500/20',
		icon: 'Sun',
		glowIntensity: 'high',
		rarityOverlay: 'common'
	},
	forest: {
		gradient: 'from-green-900/50 via-emerald-800/30 to-teal-900/40',
		accent: 'text-emerald-400',
		border: 'border-emerald-500/30 hover:border-emerald-500/60',
		glow: 'shadow-emerald-500/20',
		icon: 'Trees',
		glowIntensity: 'medium',
		rarityOverlay: 'common'
	},
	cosmic: {
		gradient: 'from-indigo-900/50 via-purple-800/30 to-pink-900/40',
		accent: 'text-indigo-400',
		border: 'border-indigo-500/30 hover:border-indigo-500/60',
		glow: 'shadow-indigo-500/20',
		icon: 'Star',
		glowIntensity: 'high',
		rarityOverlay: 'premium'
	},
	volcanic: {
		gradient: 'from-orange-900/50 via-red-800/30 to-yellow-900/40',
		accent: 'text-orange-500',
		border: 'border-orange-600/30 hover:border-orange-600/60',
		glow: 'shadow-orange-600/20',
		icon: 'Flame',
		glowIntensity: 'high',
		rarityOverlay: 'common'
	},
	arctic: {
		gradient: 'from-slate-900/50 via-blue-800/30 to-cyan-900/40',
		accent: 'text-sky-400',
		border: 'border-sky-500/30 hover:border-sky-500/60',
		glow: 'shadow-sky-500/20',
		icon: 'Snowflake',
		glowIntensity: 'low',
		rarityOverlay: 'common'
	},
	neon: {
		gradient: 'from-pink-900/50 via-purple-800/30 to-cyan-900/40',
		accent: 'text-pink-400',
		border: 'border-pink-500/30 hover:border-pink-500/60',
		glow: 'shadow-pink-500/20',
		icon: 'Zap',
		glowIntensity: 'high',
		rarityOverlay: 'premium'
	},
	desert: {
		gradient: 'from-yellow-900/50 via-amber-800/30 to-orange-900/40',
		accent: 'text-yellow-400',
		border: 'border-yellow-500/30 hover:border-yellow-500/60',
		glow: 'shadow-yellow-500/20',
		icon: 'Sun',
		glowIntensity: 'medium',
		rarityOverlay: 'common'
	},
	twilight: {
		gradient: 'from-purple-900/50 via-blue-800/30 to-indigo-900/40',
		accent: 'text-purple-300',
		border: 'border-purple-400/30 hover:border-purple-400/60',
		glow: 'shadow-purple-400/20',
		icon: 'Moon',
		glowIntensity: 'medium',
		rarityOverlay: 'common'
	}
} as const;

export type ForumThemeKey = keyof typeof FORUM_THEMES;

// Utility helper – safely fetch a theme by id with graceful fallback
export const getForumTheme = (themeId?: string | null): ForumTheme => {
	if (themeId && themeId in FORUM_THEMES) {
		return FORUM_THEMES[themeId as ForumThemeKey];
	}
	return FORUM_THEMES.default;
};

// Fallback theme selector for forums without custom artwork
// Uses a deterministic hash of the forum ID to assign consistent themes
export const getFallbackForumTheme = (forumId: string): ForumTheme => {
	// Array of fallback theme keys (excluding specific zone themes)
	const fallbackThemeKeys: ForumThemeKey[] = [
		'ocean', 'sunset', 'forest', 'cosmic', 'volcanic',
		'arctic', 'neon', 'desert', 'twilight', 'default'
	];
	
	// Generate a hash from the forum ID
	const hash = forumId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
	
	// Select a theme based on the hash
	const themeKey = fallbackThemeKeys[hash % fallbackThemeKeys.length];
	
	if (themeKey && themeKey in FORUM_THEMES) {
		return FORUM_THEMES[themeKey];
	}

	return FORUM_THEMES.default;
};
