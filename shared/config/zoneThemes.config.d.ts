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
export declare const ZONE_THEMES: Record<string, ZoneTheme>;
export type ZoneThemeKey = keyof typeof ZONE_THEMES;
export declare const getZoneTheme: (themeId?: string | null) => ZoneTheme;
