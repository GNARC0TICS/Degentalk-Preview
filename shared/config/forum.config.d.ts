export declare const ZONE_TYPES: readonly ["primary", "general"];
export type ZoneType = (typeof ZONE_TYPES)[number];
export interface PrefixGrantRule {
    slug: string;
    autoAssign: boolean;
    condition?: {
        minReplies?: number;
        minLikes?: number;
        minXp?: number;
        role?: string;
    };
}
export interface ForumRules {
    allowPosting: boolean;
    xpEnabled: boolean;
    tippingEnabled: boolean;
    xpMultiplier?: number;
    accessLevel?: 'public' | 'registered' | 'level_10+' | 'vip' | 'mod' | 'admin';
    minXpRequired?: number;
    allowPolls?: boolean;
    allowTags?: boolean;
    allowAttachments?: boolean;
    availablePrefixes?: string[];
    prefixGrantRules?: PrefixGrantRule[];
    requiredPrefix?: boolean;
    customComponent?: string;
    customRules?: Record<string, unknown>;
}
export interface ForumTheme {
    color: string;
    icon: string;
    colorTheme: string;
    bannerImage?: string;
    backgroundImage?: string;
    landingComponent?: string;
    customStyles?: Record<string, string>;
}
export interface Forum {
    slug: string;
    name: string;
    description?: string;
    rules: ForumRules;
    themeOverride?: Partial<ForumTheme>;
    position?: number;
    tags?: string[];
    forums?: Forum[];
}
export interface Zone {
    slug: string;
    name: string;
    description: string;
    type: ZoneType;
    position?: number;
    theme: ForumTheme;
    defaultRules?: Partial<ForumRules>;
    forums: Forum[];
}
export declare const DEFAULT_FORUM_RULES: ForumRules;
export declare const forumMap: Zone[];
export declare function getForumBySlug(slug: string, zones?: Zone[]): Forum | undefined;
