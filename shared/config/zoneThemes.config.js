"use strict";
// Note: Icon strings reference lucide-react icon names
// The actual icons should be resolved in the client
Object.defineProperty(exports, "__esModule", { value: true });
exports.getZoneTheme = exports.ZONE_THEMES = void 0;
exports.ZONE_THEMES = {
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
};
// Utility helper – safely fetch a theme by id with graceful fallback
var getZoneTheme = function (themeId) { var _a; return (_a = exports.ZONE_THEMES[themeId]) !== null && _a !== void 0 ? _a : exports.ZONE_THEMES.default; };
exports.getZoneTheme = getZoneTheme;
