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
export declare const FORUM_THEMES: Record<string, ForumTheme>;
export type ForumThemeKey = keyof typeof FORUM_THEMES;
export declare const getForumTheme: (themeId?: string | null) => ForumTheme;
export declare const getFallbackForumTheme: (forumId: string) => ForumTheme;
