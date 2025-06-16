import {
	Flame,
	Target,
	Archive,
	Dices,
	FileText,
	Folder,
	Coins
} from 'lucide-react';

// Enhanced theme configuration for Zones
export const ZONE_THEMES = {
	'pit': { // Keys should be simple strings for easier lookup
		icon: Flame,
		color: 'text-red-400', // Tailwind text color class
		bgColor: 'bg-red-900/20',
		borderColor: 'border-red-500/30',
		label: 'The Pit'
	},
	'mission': {
		icon: Target,
		color: 'text-blue-400',
		bgColor: 'bg-blue-900/20',
		borderColor: 'border-blue-500/30',
		label: 'Mission Control'
	},
	'casino': {
		icon: Dices,
		color: 'text-purple-400',
		bgColor: 'bg-purple-900/20',
		borderColor: 'border-purple-500/30',
		label: 'Casino Floor'
	},
	'briefing': {
		icon: FileText,
		color: 'text-amber-400',
		bgColor: 'bg-amber-900/20',
		borderColor: 'border-amber-500/30',
		label: 'Briefing Room'
	},
	'archive': {
		icon: Archive,
		color: 'text-gray-400',
		bgColor: 'bg-gray-900/20',
		borderColor: 'border-gray-500/30',
		label: 'The Archive'
	},
	'shop': {
		icon: Coins,
		color: 'text-violet-400',
		bgColor: 'bg-gradient-to-br from-violet-900/30 via-pink-900/20 to-blue-900/30',
		borderColor: 'border-violet-500/30',
		label: 'DegenShop™'
	},
	'default': { // Added a default theme entry
		icon: Folder,
		color: 'text-emerald-400',
		bgColor: 'bg-zinc-900/80',
		borderColor: 'border-zinc-700/30',
		label: 'Default'
	}
} as const; // Use 'as const' for better type inference on keys

// Map theme keys to icon components (can be derived from ZONE_THEMES if needed, or kept separate)
// This specific THEME_ICONS might be redundant if ZONE_THEMES.default.icon is used as fallback.
export const THEME_ICONS = {
	pit: Flame,
	mission: Target,
	casino: Dices,
	briefing: FileText,
	archive: Archive,
	shop: Coins,
	default: Folder
} as const;

// Map theme keys to gradient/border classes for cards (used in forums/index.tsx)
export const THEME_COLORS_BG = {
	pit: 'from-orange-500/20 to-red-500/20 border-orange-500/30',
	mission: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
	casino: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
	briefing: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30',
	archive: 'from-gray-500/20 to-zinc-500/20 border-gray-500/30',
	shop: 'from-violet-500/20 via-pink-500/10 to-blue-500/20 border-violet-500/30',
	default: 'from-zinc-800/80 to-zinc-900/80 border-zinc-700/30'
} as const;
