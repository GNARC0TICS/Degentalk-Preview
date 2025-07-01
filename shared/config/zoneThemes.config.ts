// Note: Icon strings reference lucide-react icon names
// The actual icons should be resolved in the client

// Extended visual theme configuration for Zones / Primary Areas
// This file centralises all visual styling tokens for Zone-level components (cards, nav items, etc.)
// Do NOT import component code here – keep it as a pure configuration / data module.

export type GlowIntensity = 'low' | 'medium' | 'high';
export type RarityOverlay = 'common' | 'premium' | 'legendary';

export interface ZoneTheme {
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

export const ZONE_THEMES: Record<string, ZoneTheme> = {
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
	}
} as const;

export type ZoneThemeKey = keyof typeof ZONE_THEMES;

// Utility helper – safely fetch a theme by id with graceful fallback
export const getZoneTheme = (themeId?: string | null) =>
	ZONE_THEMES[themeId as ZoneThemeKey] ?? ZONE_THEMES.default;
